import React from 'react';
import MelodyDiagram from './progressIndicators/MelodyDiagram';
import { SingTaskResult, TaskProgressState } from '../../../utils/rxjs/taskProgress';
import { sustainLength$ } from '../../detector/shared';
import { smoothPitch } from '../../../utils/rxjs/smoothPitch';
import useAudio from '../../audio/useAudio';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../../theme';
import {
    RecognizerMap,
    TaskType,
    universalRecognizer,
    UniversalRecognizerState
} from '../../../utils/rxjs/recognizers/universalRecognizer';
import { MelodyRecognizerState, MelodyState } from '../../../utils/rxjs/recognizers/melodyRecognizer';
import { MelodyTaskTarget, TaskTarget } from './target';
import { getUniversalTaskProgressInitialState, universalTaskProgress } from '../../../utils/rxjs/universalTaskProgress';
import { convertNumericNoteToString } from '../../../utils/pitchConverter';
import TargetBox from './progressIndicators/TargetBox';
import VoiceDetector from '../../detector/VoiceDetector';
import { audioContext } from '../../audio/audioContext';
import useSustainLength from '../../audio/useSustainLength';
import { useAudioCache } from '../../audio/useAudioCache';
import useTonic from '../../audio/useTonic';
import SuccessBar from './progressIndicators/SuccessBar';
import Page from '../../page/Page';
import CircularPitchMeter, { noteNamesFrom } from './progressIndicators/CircularPitchMeter';

interface Props {
    header: string;
    targets: TaskTarget[];
    recognizers: RecognizerMap;
    withPrompts?: boolean;
    maxAttempts: number;
    // Called every time a task is completed
    onComplete?: (results: SingTaskResult<TaskTarget>[]) => void;
}

const useStyles = makeStyles<Theme>(() => ({
    root: {
        width: '100%',
        position: 'relative',
        height: 'calc(100vh - 8rem)'
    },
    target: {
        maxWidth: '30rem',
        margin: '0 calc(50% - 15rem)'
    },
    pitchPopup: {
        margin: '1rem calc(50% - 8.5rem)'
    }
}));

const getTargetMelody = (state: MelodyRecognizerState, id: string): MelodyState => {
    // Ignore when it's undefined; we assume that never happens
    return state.melodies.find((melody) => melody.id === id) as MelodyState;
};

const SingTasks = ({ header, targets, recognizers, withPrompts, maxAttempts, onComplete }: Props): React.ReactElement<Props> => {
    const [feedback, setFeedback] = React.useState<boolean[]>([]);
    const [tonic] = useTonic();
    const octave = Math.floor(tonic / 12);
    const keyNumber = tonic % 12;

    const noteLabels = React.useMemo(() => noteNamesFrom(keyNumber), [keyNumber]);

    const classes = useStyles();
    const ctx = React.useContext(audioContext);
    const [sustainLength] = useSustainLength();
    const [state, setState] = React.useState<TaskProgressState<TaskTarget, UniversalRecognizerState>>(
        getUniversalTaskProgressInitialState(targets[0])
    );
    useAudioCache({ keyNumber, octave, targets });
    const { play } = useAudio({ keyNumber, hasBackground: true });

    React.useEffect(() => {
        if (keyNumber === 0 && octave === 0) return;

        setState(getUniversalTaskProgressInitialState(targets[0]));
        const voiceDetector = new VoiceDetector(ctx.audioContext);
        const sub = voiceDetector
            .getState()
            .pipe(
                smoothPitch(),
                universalRecognizer({ sustainLength$, recognizers, keyNumber }),
                universalTaskProgress({ targets, keyNumber, octave, play: withPrompts ? play : undefined, maxAttempts })
            )
            .subscribe((nextState: TaskProgressState<TaskTarget, UniversalRecognizerState>) => {
                setState(nextState);
                if (nextState.isDone) {
                    setFeedback((feedback) => [...feedback, nextState.isCorrect]);
                    onComplete && onComplete(nextState.results.slice(0, nextState.results.length - 1));
                }
            });

        return () => sub.unsubscribe();
    }, [keyNumber, octave, withPrompts, recognizers, targets, ctx.audioContext, play, maxAttempts, onComplete]);

    return (
        <Page header={header}>
            <div className={classes.root}>
                <div className={classes.target}>
                    <TargetBox height="7rem">
                        {state.nextTarget.type === TaskType.PITCH && <h2>Pitch: {convertNumericNoteToString(state.nextTarget.value)}</h2>}
                        {state.nextTarget.type === TaskType.INTERVAL && (
                            <h2>Interval: {convertNumericNoteToString(state.nextTarget.value)}</h2>
                        )}
                        {state.nextTarget.type === TaskType.MELODY && (
                            <MelodyDiagram
                                melody={state.nextTarget.value}
                                done={
                                    state.type === TaskType.MELODY
                                        ? getTargetMelody(state, (state.currTarget as MelodyTaskTarget).id).intervals.map(
                                              (interval) => interval.duration !== 0
                                          )
                                        : Array(state.nextTarget.value.length).fill(false)
                                }
                                current={state.type === TaskType.MELODY ? state.interval : state.note - state.nextTarget.startNote}
                            />
                        )}
                    </TargetBox>
                </div>
                <div className={classes.pitchPopup}>
                    <CircularPitchMeter
                        noteLabels={noteLabels}
                        startNum={state.note}
                        startError={state.error}
                        progress={state.type === TaskType.PITCH ? Math.min(state.progress / sustainLength, 1) : 1}
                    />
                </div>
                <SuccessBar items={feedback} />
            </div>
        </Page>
    );
};

SingTasks.defaultProps = {
    maxAttempts: 1,
    withPrompts: false
};

export default SingTasks;
