import { audioContext } from './audioContext';
import React from 'react';
import { combineLatest, concat, interval, of, Subscription, timer } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import { IAudioContext, IAudioNode, IGainNode } from 'standardized-audio-context';
import { getCachedAudio } from './getCachedAudio';

const backgroundGain = 0.3;
const foregroundRampUpTime = 0.1;
const overlapTime = 0.5;
const gainUpCurve: Float32Array = new Float32Array([0, 1]);
const gainDownCurve: Float32Array = new Float32Array([1, 0]);

interface CrossfadeProps {
    toFadeIn: IGainNode<IAudioContext>;
    toFadeOut?: IGainNode<IAudioContext>;
    buffer: AudioBuffer;
    atTime: number;
    overlapTime: number;
    context: IAudioContext;
}

const crossfade = ({ toFadeOut, toFadeIn, buffer, atTime, overlapTime, context }: CrossfadeProps) => {
    const audioNode = context.createBufferSource();
    audioNode.buffer = buffer;
    audioNode.connect(toFadeIn);
    audioNode.start(atTime);

    // Do the appropriate fades
    toFadeIn.gain.setValueCurveAtTime(gainUpCurve, atTime, overlapTime);
    if (toFadeOut) toFadeOut.gain.setValueCurveAtTime(gainDownCurve, atTime, overlapTime);
};

interface Props {
    keyNumber: number;
    hasBackground?: boolean;
}

const useAudio = ({ keyNumber, hasBackground }: Props) => {
    const ctx = React.useContext(audioContext);
    const [isPlaying, setIsPlaying] = React.useState(false);

    React.useEffect(() => {
        const sources: IAudioNode<any>[] = [];

        const subscriptions: Subscription[] = [];

        if (hasBackground) {
            subscriptions.push(
                combineLatest([
                    getCachedAudio(`/audio/background/background-${keyNumber}-start.mp3`, ctx.audioContext),
                    getCachedAudio(`/audio/background/background-${keyNumber}-loop.mp3`, ctx.audioContext)
                ]).subscribe(([startAudio, loopAudio]) => {
                    const startSource = ctx.audioContext.createBufferSource();
                    startSource.buffer = startAudio;
                    const startGain = ctx.audioContext.createGain();
                    startSource.connect(startGain);
                    startGain.connect(ctx.backgroundGain);

                    // Make two gain controls for the loop audio
                    const loopGain1 = ctx.audioContext.createGain();
                    loopGain1.gain.setValueAtTime(0, 0);
                    loopGain1.connect(ctx.backgroundGain);
                    const loopGain2 = ctx.audioContext.createGain();
                    loopGain2.gain.setValueAtTime(0, 0);
                    loopGain2.connect(ctx.backgroundGain);

                    // Hold onto the sources to do cleanup later
                    sources.push(startSource, loopGain1, loopGain2);

                    // Start the sound
                    startSource.start(ctx.audioContext.currentTime);

                    // Start when the start is done
                    subscriptions.push(
                        timer((startSource.buffer.duration - overlapTime) * 1000)
                            .pipe(
                                concatMap(() => concat(of(0), interval((loopAudio.duration - overlapTime) * 1000).pipe(map((i) => i + 1))))
                            )
                            .subscribe((index: number) => {
                                if (startGain.gain.value > 0) {
                                    startGain.gain.setValueCurveAtTime(gainDownCurve, ctx.audioContext.currentTime, overlapTime);
                                }
                                crossfade({
                                    toFadeOut: index % 2 === 0 ? loopGain1 : loopGain2,
                                    toFadeIn: index % 2 === 0 ? loopGain2 : loopGain1,
                                    buffer: loopAudio,
                                    atTime: ctx.audioContext.currentTime,
                                    overlapTime,
                                    context: ctx.audioContext
                                });
                            })
                    );
                })
            );
        }

        return () => {
            // Clean up the sources if we're unmounting, otherwise the sound will continue!
            sources.forEach((node) => node.disconnect());
            subscriptions.forEach((sub) => sub.unsubscribe());
        };
    }, [keyNumber, hasBackground, ctx]);

    // Can slign timing with background music by recording start time of the music.
    const audioEndSubs = React.useRef<Subscription[]>([]);
    const play = React.useCallback(
        (url: string) => {
            // Fade the background music
            const startAtGoal = ctx.audioContext.currentTime + foregroundRampUpTime;
            ctx.backgroundGain.gain.setValueAtTime(1, ctx.audioContext.currentTime);
            ctx.foregroundGain.gain.setValueAtTime(1, ctx.audioContext.currentTime);
            ctx.backgroundGain.gain.linearRampToValueAtTime(backgroundGain, startAtGoal);

            getCachedAudio(url, ctx.audioContext).subscribe((buffer) => {
                const source = ctx.audioContext.createBufferSource();
                source.buffer = buffer;

                setIsPlaying(true);
                const startAt = startAtGoal < ctx.audioContext.currentTime ? ctx.audioContext.currentTime : startAtGoal;
                source.connect(ctx.foregroundGain);
                source.start(startAt);

                // Bring back the background music
                audioEndSubs.current.forEach((sub) => sub.unsubscribe());
                audioEndSubs.current = [
                    timer(Math.max(foregroundRampUpTime, buffer.duration - foregroundRampUpTime) * 1000).subscribe(() => {
                        // Must call set before ramp
                        ctx.backgroundGain.gain.setValueAtTime(backgroundGain, ctx.audioContext.currentTime);
                        ctx.foregroundGain.gain.setValueAtTime(1, ctx.audioContext.currentTime);
                        ctx.backgroundGain.gain.linearRampToValueAtTime(1, ctx.audioContext.currentTime + foregroundRampUpTime);
                        ctx.foregroundGain.gain.linearRampToValueAtTime(0, ctx.audioContext.currentTime + foregroundRampUpTime);
                    }),
                    timer(buffer.duration * 1000).subscribe(() => setIsPlaying(false))
                ];
            });
        },
        [ctx]
    );

    return { play, isPlaying };
};

export default useAudio;
