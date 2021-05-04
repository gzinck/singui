import React from 'react';
import TaskPage from './taskPage/TaskPage';
import MelodyDiagram from './progressIndicators/MelodyDiagram';
import { SingTaskResult, TaskProgressState } from '../../utils/rxjs/taskProgress';
import { sustainLength$ } from '../detector/shared';
import { smoothPitch } from '../../utils/rxjs/smoothPitch';
import useAudio from '../audio/useAudio';
import StaticPitchMeter, { numeric15Notes } from './progressIndicators/StaticPitchMeter';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../theme';
import { RecognizerMap, TaskType, universalRecognizer, UniversalRecognizerState } from '../../utils/rxjs/recognizers/universalRecognizer';
import { MelodyRecognizerState, MelodyState } from '../../utils/rxjs/recognizers/melodyRecognizer';
import { MelodyTaskTarget, TaskTarget } from './target';
import { getUniversalTaskProgressInitialState, universalTaskProgress } from '../../utils/rxjs/universalTaskProgress';
import { convertNumericNoteToString } from '../../utils/pitchConverter';
import TargetBox from './progressIndicators/TargetBox';
import VoiceDetector from '../detector/VoiceDetector';
import { audioContext } from '../audio/audioContext';
import useSustainLength from '../audio/useSustainLength';
import { useAudioCache } from '../audio/useAudioCache';
import useTonic from '../audio/useTonic';

interface Props {
    header: string;
    targets: TaskTarget[];
    recognizers: RecognizerMap;
    withPrompts?: boolean;
    maxAttempts: number;
    // Called every time a task is completed
    onComplete?: (results: SingTaskResult<TaskTarget>[]) => void;
}

const leftWidth = '16rem';
const useStyles = makeStyles<Theme>(() => ({
    root: {
        width: '100%',
        height: 'calc(100vh - 8rem)',
        '& > div': {
            clear: 'none',
            float: 'left'
        }
    },
    left: {
        height: '100%',
        width: leftWidth
    },
    right: {
        height: '100%',
        width: `calc(100% - ${leftWidth})`
    },
    pitchBox: {
        width: '10rem',
        height: '10rem',
        position: 'relative'
    },
    matchesBox: {
        maxHeight: 'calc(100% - 11rem)',
        overflowY: 'scroll'
    }
}));

const getTargetMelody = (state: MelodyRecognizerState, id: string): MelodyState => {
    // Ignore when it's undefined; we assume that never happens
    return state.melodies.find((melody) => melody.id === id) as MelodyState;
};

const SingTasks = ({ header, targets, recognizers, withPrompts, maxAttempts, onComplete }: Props): React.ReactElement<Props> => {
    function fitToMeter<T extends number | undefined>(note: T): T | number {
        return typeof note === 'number' ? Math.max(0, Math.min(13, note + 1)) : note;
    }

    const [tonic] = useTonic();
    const octave = Math.floor(tonic / 12);
    const keyNumber = tonic % 12;

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
                if (onComplete && nextState.isDone) {
                    onComplete(nextState.results.slice(0, nextState.results.length - 1));
                }
            });

        return () => sub.unsubscribe();
    }, [keyNumber, octave, withPrompts, recognizers, targets, ctx.audioContext, play, maxAttempts, onComplete]);

    return (
        <TaskPage header={header}>
            <div className={classes.root}>
                <div className={classes.left}>
                    <StaticPitchMeter
                        // Uncomment below for precise musical language instead of numbers
                        // noteLabels={state.type === TaskType.INTERVAL ? intervalsAscendingNotes : scale15Notes}
                        noteLabels={numeric15Notes}
                        startNum={fitToMeter(state.note)}
                        startError={state.error}
                        target={fitToMeter(state.nextNote)}
                        progress={state.type === TaskType.PITCH ? Math.min(state.progress / sustainLength, 1) : 1}
                        isCorrect={state.nextNote === state.note}
                    />
                </div>
                <div className={classes.right}>
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
                    {state.type === TaskType.MELODY && (
                        <div className={classes.matchesBox}>
                            <h3>Matching melodies</h3>
                            {state.melodies.map((melody: MelodyState, idx: number) => (
                                <TargetBox
                                    key={melody.id}
                                    height="5rem"
                                    variant={
                                        idx === 0 && state.isValid
                                            ? state.currTarget.type === TaskType.MELODY && melody.id === state.currTarget.id
                                                ? 'success'
                                                : 'failure'
                                            : ''
                                    }
                                >
                                    <MelodyDiagram
                                        melody={melody.intervals.map((i) => i.interval)}
                                        done={melody.intervals.map((interval) => interval.duration !== 0)}
                                        current={state.interval}
                                    />
                                </TargetBox>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </TaskPage>
    );
};

SingTasks.defaultProps = {
    maxAttempts: 1,
    withPrompts: false
};

export default SingTasks;
