import { audioContext } from './audioContext';
import React from 'react';
import { fromFetch } from 'rxjs/fetch';
import { combineLatest, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

const useAudio = (audioVolume$: Observable<number>) => {
    React.useEffect(() => {
        const getAudioFrom = (url: string) =>
            fromFetch(url).pipe(
                mergeMap((res) => res.arrayBuffer()),
                mergeMap((buffer) => audioContext.decodeAudioData(buffer))
            );

        const sources: { disconnect: () => void }[] = [];

        const subscription = combineLatest(getAudioFrom('/audio/start.wav'), getAudioFrom('/audio/loop.wav')).subscribe(
            ([startAudio, loopAudio]) => {
                const gain = audioContext.createGain();
                audioVolume$.subscribe((volume) => gain.gain.setValueAtTime(volume, audioContext.currentTime));

                const startSource = audioContext.createBufferSource();
                startSource.buffer = startAudio;
                startSource.connect(gain);

                const loopSource = audioContext.createBufferSource();
                loopSource.buffer = loopAudio;
                loopSource.loop = true;
                loopSource.connect(gain);

                // Connect everything to the output
                gain.connect(audioContext.destination);

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
