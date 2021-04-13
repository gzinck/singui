import { context$ } from './audioContext';
import React from 'react';
import { fromFetch } from 'rxjs/fetch';
import { combineLatest, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

const useAudio = (audioVolume$: Observable<number>) => {
    React.useEffect(() => {
        const getAudioFrom = (url: string) => {
            const startBuffer$ = fromFetch(url).pipe(mergeMap((res) => res.arrayBuffer()));
            return combineLatest(context$, startBuffer$).pipe(mergeMap(([context, buffer]) => context.decodeAudioData(buffer)));
        };

        const sources: AudioNode[] = [];

        const subscription = combineLatest(context$, getAudioFrom('/audio/start.wav'), getAudioFrom('/audio/loop.wav')).subscribe(
            ([context, startAudio, loopAudio]) => {
                const gain = context.createGain();
                audioVolume$.subscribe((volume) => gain.gain.setValueAtTime(volume, context.currentTime));

                const startSource = context.createBufferSource();
                startSource.buffer = startAudio;
                startSource.connect(gain);

                const loopSource = context.createBufferSource();
                loopSource.buffer = loopAudio;
                loopSource.loop = true;
                loopSource.connect(gain);

                // Connect everything to the output
                gain.connect(context.destination);

                // Hold onto the sources to do cleanup later
                sources.push(startSource, loopSource, gain);

                startSource.start(0);
                startSource.onended = () => {
                    loopSource.start(0);
                };
            }
        );

        return () => {
            // Clean up the sources if we're unmounting, otherwise the sound will continue!
            sources.forEach((node) => node.disconnect());
            subscription.unsubscribe();
        };
    }, [audioVolume$]);
};

export default useAudio;
