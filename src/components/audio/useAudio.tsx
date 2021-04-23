import { audioContext } from './audioContext';
import React from 'react';
import { fromFetch } from 'rxjs/fetch';
import { combineLatest, concat, interval, Observable, of, Subscription, timer } from 'rxjs';
import { concatMap, map, mergeMap } from 'rxjs/operators';
import { IAudioContext, IGainNode } from 'standardized-audio-context';

const overlapTime = 0.5;
const gainUpCurve: Float32Array = new Float32Array([0, 1]);
const gainDownCurve: Float32Array = new Float32Array([1, 0]);

interface CrossfadeProps {
    toFadeIn: IGainNode<IAudioContext>;
    toFadeOut?: IGainNode<IAudioContext>;
    buffer: AudioBuffer;
    atTime: number;
    overlapTime: number;
}

const crossfade = ({ toFadeOut, toFadeIn, buffer, atTime, overlapTime }: CrossfadeProps) => {
    const audioNode = audioContext.createBufferSource();
    audioNode.buffer = buffer;
    audioNode.connect(toFadeIn);
    audioNode.start(atTime);

    // Do the appropriate fades
    toFadeIn.gain.setValueCurveAtTime(gainUpCurve, atTime, overlapTime);
    if (toFadeOut) toFadeOut.gain.setValueCurveAtTime(gainDownCurve, atTime, overlapTime);
};

const useAudio = (audioVolume$: Observable<number>, keyNumber: number) => {
    React.useEffect(() => {
        const getAudioFrom = (url: string) =>
            fromFetch(url).pipe(
                mergeMap((res) => res.arrayBuffer()),
                mergeMap((buffer) => audioContext.decodeAudioData(buffer))
            );

        const sources: { disconnect: () => void }[] = [];

        const subscriptions: Subscription[] = [];
        subscriptions.push(
            combineLatest(
                getAudioFrom(`/audio/background/background-${keyNumber}-start.mp3`),
                getAudioFrom(`/audio/background/background-${keyNumber}-loop.mp3`)
            ).subscribe(([startAudio, loopAudio]) => {
                const gain = audioContext.createGain();
                audioVolume$.subscribe((volume) => gain.gain.setValueAtTime(volume, audioContext.currentTime));

                const startSource = audioContext.createBufferSource();
                startSource.buffer = startAudio;
                const startGain = audioContext.createGain();
                startSource.connect(startGain);
                startGain.connect(gain);

                // Make two gain controls for the loop audio
                const loopGain1 = audioContext.createGain();
                loopGain1.gain.setValueAtTime(0, 0);
                loopGain1.connect(gain);
                const loopGain2 = audioContext.createGain();
                loopGain2.gain.setValueAtTime(0, 0);
                loopGain2.connect(gain);

                // Connect everything to the output
                gain.connect(audioContext.destination);

                // Hold onto the sources to do cleanup later
                sources.push(startSource, loopGain1, loopGain2, gain);

                // Start the sound
                startSource.start(audioContext.currentTime);

                // Start when the start is done
                subscriptions.push(
                    timer((startSource.buffer.duration - overlapTime) * 1000)
                        .pipe(concatMap(() => concat(of(0), interval((loopAudio.duration - overlapTime) * 1000).pipe(map((i) => i + 1)))))
                        .subscribe((index: number) => {
                            if (startGain.gain.value > 0) {
                                startGain.gain.setValueCurveAtTime(gainDownCurve, audioContext.currentTime, overlapTime);
                            }
                            crossfade({
                                toFadeOut: index % 2 === 0 ? loopGain1 : loopGain2,
                                toFadeIn: index % 2 === 0 ? loopGain2 : loopGain1,
                                buffer: loopAudio,
                                atTime: audioContext.currentTime,
                                overlapTime
                            });
                        })
                );
            })
        );

        return () => {
            // Clean up the sources if we're unmounting, otherwise the sound will continue!
            sources.forEach((node) => node.disconnect());
            subscriptions.forEach((sub) => sub.unsubscribe());
        };
    }, [audioVolume$, keyNumber]);
};

export default useAudio;
