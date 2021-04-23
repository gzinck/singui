import React from 'react';
import TaskPage from './taskPage/TaskPage';
import MelodyDiagram from './progressIndicators/MelodyDiagram';
import { TaskProgressState } from '../../utils/rxjs/taskProgress';
import { audioVolume$, sustainLength$, voiceDetector } from '../detector/shared';
import { smoothPitch } from '../../utils/rxjs/smoothPitch';
import useGain from '../audio/useGain';
import useAudio from '../audio/useAudio';
import StaticPitchMeter, { intervalsAscendingNotes, scale15Notes } from './progressIndicators/StaticPitchMeter';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../theme';
import { RecognizerMap, TaskType, universalRecognizer, UniversalRecognizerState } from '../../utils/rxjs/recognizers/universalRecognizer';
import { MelodyRecognizerState, MelodyState } from '../../utils/rxjs/recognizers/melodyRecognizer';
import { MelodyTaskTarget, TaskTarget } from './target';
import { getUniversalTaskProgressInitialState, universalTaskProgress } from '../../utils/rxjs/universalTaskProgress';
import { convertIntervalToString, convertScalePitchToString } from '../../utils/pitchConverter';
import TargetBox from './progressIndicators/TargetBox';

interface Props {
    keyNumber: number;
    targets: TaskTarget[];
    recognizers: RecognizerMap;
}

const leftWidth = '16rem';
const useStyles = makeStyles<Theme>(() => ({
    root: {
        width: '100%',
        height: '100%',
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
        maxHeight: 'calc(100% - 14rem)',
        overflowY: 'scroll'
    }
}));

const getTargetMelody = (state: MelodyRecognizerState, id: string): MelodyState => {
    // Ignore when it's undefined; we assume that never happens
    return state.melodies.find((melody) => melody.id === id) as MelodyState;
};

const AllTasks = ({ keyNumber, targets, recognizers }: Props): React.ReactElement<Props> => {
    function fitToMeter<T extends number | undefined>(note: T): T | number {
        return typeof note === 'number' ? Math.max(0, Math.min(13, note + 1)) : note;
    }

    const classes = useStyles();
    const [state, setState] = React.useState<TaskProgressState<TaskTarget, UniversalRecognizerState>>(
        getUniversalTaskProgressInitialState(targets[0])
    );
    const [sustainLength, setSustainLength] = React.useState(0);
    const [gain, setGain] = useGain(audioVolume$);
    useAudio(audioVolume$, keyNumber);

    React.useEffect(() => {
        setState(getUniversalTaskProgressInitialState(targets[0]));
        const subscriptions = [
            voiceDetector
                .getState()
                .pipe(
                    smoothPitch(),
                    universalRecognizer({ sustainLength$, recognizers, keyNumber }),
                    universalTaskProgress({ targets, keyNumber })
                )
                .subscribe((nextState) => setState(nextState)),
            sustainLength$.subscribe((len) => setSustainLength(len))
        ];

        return () => subscriptions.forEach((sub) => sub.unsubscribe());
    }, [keyNumber, recognizers, targets]);

    return (
        <TaskPage
            header="All tasks"
            // subheader={`Sing the ${state.nextTarget.type.toLowerCase()} below`}
            sustainLength={sustainLength}
            setSustainLength={(sustainLength) => sustainLength$.next(sustainLength)}
            gain={gain}
            setGain={setGain}
        >
            <div className={classes.root}>
                <div className={classes.left}>
                    <StaticPitchMeter
                        noteLabels={state.type === TaskType.INTERVAL ? intervalsAscendingNotes : scale15Notes}
                        startNum={fitToMeter(state.note)}
                        startError={state.error}
                        target={fitToMeter(state.nextNote)}
                        progress={state.type === TaskType.PITCH ? Math.min(state.progress / sustainLength, 1) : 1}
                        isCorrect={state.nextNote === state.note}
                    />
                </div>
                <div className={classes.right}>
                    <TargetBox height="7rem">
                        {state.nextTarget.type === TaskType.PITCH && <h2>Pitch: {convertScalePitchToString(state.nextTarget.value)}</h2>}
                        {state.nextTarget.type === TaskType.INTERVAL && (
                            <h2>Interval: {convertIntervalToString(state.nextTarget.value)}</h2>
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

export default AllTasks;
