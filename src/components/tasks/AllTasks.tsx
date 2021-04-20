import React from 'react';
import TaskPage from './taskPage/TaskPage';
import MelodyDiagram from './progressIndicators/MelodyDiagram';
import { TaskProgressState } from '../../utils/rxjs/taskProgress';
import { audioVolume$, sustainLength$, voiceDetector } from '../detector/shared';
import { smoothPitch } from '../../utils/rxjs/smoothPitch';
import useGain from '../audio/useGain';
import useAudio from '../audio/useAudio';
import IndicatorsContainer from './progressIndicators/IndicatorsContainer';
import StaticPitchMeter, { intervalsAscendingNotes } from './progressIndicators/StaticPitchMeter';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../theme';
import { pitchRecognizer, pitchRecognizerInitialState } from '../../utils/rxjs/recognizers/pitchRecognizer';
import { RecognizerMap, TaskType, universalRecognizer, UniversalRecognizerState } from '../../utils/rxjs/recognizers/universalRecognizer';
import { MelodyRecognizerState, MelodyState } from '../../utils/rxjs/recognizers/melodyRecognizer';
import { MelodyTaskTarget, TaskTarget } from './target';
import { getUniversalTaskProgressInitialState, universalTaskProgress } from '../../utils/rxjs/universalTaskProgress';

interface Props {
    keyNumber: number;
    targets: TaskTarget[];
    recognizers: RecognizerMap;
}

const useStyles = makeStyles<Theme>((theme) => ({
    melodyBox: {
        marginLeft: theme.spacing(3),
        flexBasis: '50rem',
        flexShrink: 1,
        maxHeight: '75vh'
    },
    matchesBox: {
        maxHeight: 'calc(75vh - 14rem)',
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
    const [currPitch, setCurrPitch] = React.useState(pitchRecognizerInitialState);
    const [state, setState] = React.useState<TaskProgressState<TaskTarget, UniversalRecognizerState>>(
        getUniversalTaskProgressInitialState(targets[0])
    );
    const [sustainLength, setSustainLength] = React.useState(0);
    const [gain, setGain] = useGain(audioVolume$);
    useAudio(audioVolume$);

    React.useEffect(() => {
        const pitch$ = voiceDetector.getState().pipe(smoothPitch(), pitchRecognizer({ sustainLength$, keyNumber }));
        const subscriptions = [
            pitch$.subscribe((state) => setCurrPitch(state)),
            pitch$
                .pipe(universalRecognizer({ recognizers, keyNumber }), universalTaskProgress({ targets, keyNumber }))
                .subscribe((nextState) => setState(nextState)),
            sustainLength$.subscribe((len) => setSustainLength(len))
        ];

        return () => subscriptions.forEach((sub) => sub.unsubscribe());
    }, [keyNumber, recognizers, targets]);

    return (
        <TaskPage
            header="Melody tasks"
            subheader="Sing the melody below"
            sustainLength={sustainLength}
            setSustainLength={(sustainLength) => sustainLength$.next(sustainLength)}
            gain={gain}
            setGain={setGain}
        >
            <IndicatorsContainer>
                <StaticPitchMeter
                    noteLabels={intervalsAscendingNotes}
                    startNum={fitToMeter(state.inProgress ? state.note : currPitch.note)}
                    startError={currPitch.error}
                    target={fitToMeter(state.nextNote)}
                    progress={state.inProgress ? 1 : Math.min(currPitch.progress / sustainLength, 1)}
                    isCorrect={state.inProgress ? state.nextNote === state.note : state.nextNote === currPitch.note}
                />
                <div className={classes.melodyBox}>
                    <div>
                        {state.nextTarget.type === TaskType.MELODY && (
                            <MelodyDiagram
                                melody={state.nextTarget.value}
                                done={
                                    state.type === TaskType.MELODY && state.inProgress
                                        ? getTargetMelody(state, (state.currTarget as MelodyTaskTarget).id).intervals.map(
                                              (interval) => interval.duration !== 0
                                          )
                                        : Array(state.nextTarget.value.length).fill(false)
                                }
                                current={
                                    state.inProgress && state.type === TaskType.MELODY
                                        ? state.interval
                                        : currPitch.note - state.nextTarget.startNote
                                }
                            />
                        )}
                    </div>
                    {state.type === TaskType.MELODY && (
                        <div className={classes.matchesBox}>
                            <h3>Matching melodies</h3>
                            {state.melodies.map((melody: MelodyState, idx: number) => (
                                <MelodyDiagram
                                    key={melody.id}
                                    melody={melody.intervals.map((i) => i.interval)}
                                    done={melody.intervals.map((interval) => interval.duration !== 0)}
                                    current={state.interval}
                                    variant={
                                        idx === 0 && melody.intervals[melody.intervals.length - 1].duration !== 0
                                            ? state.currTarget.type === TaskType.MELODY && melody.id === state.currTarget.id
                                                ? 'success'
                                                : 'failure'
                                            : ''
                                    }
                                />
                            ))}
                        </div>
                    )}
                </div>
            </IndicatorsContainer>
        </TaskPage>
    );
};

export default AllTasks;
