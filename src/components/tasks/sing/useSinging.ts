import React from 'react';
import VoiceDetector from '../../detector/VoiceDetector';
import { SingTaskResult, TaskProgressState } from '../../../utils/rxjs/taskProgress';
import { TaskTarget } from './target';
import { RecognizerMap, universalRecognizer, UniversalRecognizerState } from '../../../utils/rxjs/recognizers/universalRecognizer';
import { getUniversalTaskProgressInitialState, universalTaskProgress } from '../../../utils/rxjs/universalTaskProgress';
import { audioContext } from '../../audio/audioContext';
import { smoothPitch } from '../../../utils/rxjs/smoothPitch';
import { sustainLength$ } from '../../detector/shared';
import { useAudioCache } from '../../audio/useAudioCache';
import useAudio from '../../audio/useAudio';
import useTonic from '../../audio/useTonic';

interface Props {
    targets: TaskTarget[];
    octaveDependent?: boolean; // If false, then 0 = 12 = 24, etc. Otherwise, targets must match singing exactly.
    recognizers: RecognizerMap;
    withPrompts?: boolean;
    hasBackground: boolean;
    maxAttempts: number;
    onComplete?: (results: SingTaskResult<TaskTarget>[]) => void;
}

export const useSinging = ({ targets, octaveDependent, recognizers, withPrompts, hasBackground, maxAttempts, onComplete }: Props) => {
    const [tonic] = useTonic();
    const octave = Math.floor(tonic / 12);
    const keyNumber = tonic % 12;

    const ctx = React.useContext(audioContext);
    const [state, setState] = React.useState<TaskProgressState<TaskTarget, UniversalRecognizerState>>(
        getUniversalTaskProgressInitialState(targets[0])
    );
    const [feedback, setFeedback] = React.useState<boolean[]>([]);

    useAudioCache({ keyNumber, octave, targets, pauseCache: !withPrompts });
    const { play } = useAudio({ keyNumber, hasBackground: hasBackground });

    React.useEffect(() => {
        if (keyNumber === 0 && octave === 0) return;

        // Reset the state accordingly
        setState(getUniversalTaskProgressInitialState(targets[0]));

        const voiceDetector = new VoiceDetector(ctx.audioContext);

        const sub = voiceDetector
            .getState()
            .pipe(
                smoothPitch(),
                universalRecognizer({ sustainLength$, recognizers, keyNumber }),
                universalTaskProgress({ targets, octaveDependent, keyNumber, octave, play: withPrompts ? play : undefined, maxAttempts })
            )
            .subscribe((nextState: TaskProgressState<TaskTarget, UniversalRecognizerState>) => {
                setState(nextState);
                if (nextState.isDone) {
                    setFeedback((feedback) => [...feedback, nextState.isCorrect]);
                    onComplete && onComplete(nextState.results.slice(0, nextState.results.length - 1));
                }
            });

        return () => sub.unsubscribe();
    }, [keyNumber, octave, withPrompts, recognizers, targets, octaveDependent, ctx.audioContext, play, maxAttempts, onComplete]);

    // Note that tonic, octave, and keyNumber pertain to the user's tonic/octave/keyNumber set for the experiment.
    // Consider removing down the road.
    return { state, feedback };
};
