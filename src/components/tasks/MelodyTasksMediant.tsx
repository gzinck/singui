import React from 'react';
import TaskPage from './taskPage/TaskPage';
import MelodyDiagram from './progressIndicators/MelodyDiagram';
import { getTaskProgressInitialState, taskProgress } from '../../utils/rxjs/taskProgress';
import { audioVolume$, sustainLength$, voiceDetector } from '../detector/shared';
import { smoothPitch } from '../../utils/rxjs/smoothPitch';
import {
    getMelodyRecognizerMediantInitialState,
    melodyRecognizerMediant,
    MelodyRecognizerMediantState
} from '../../utils/rxjs/recognizers/melodyRecognizerMediant';
import useGain from '../audio/useGain';
import useAudio from '../audio/useAudio';
import IndicatorsContainer from './progressIndicators/IndicatorsContainer';
import StaticPitchMeter, { intervalsAscendingNotes } from './progressIndicators/StaticPitchMeter';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../theme';

interface Props {
    keyNumber: number;
}

const melodies = [
    [0, 3, 1], // 3 - 5 - 4
    [0, 3, 5], // 3 - 5 - 6
    [0, -2, 3], // 3 - 2 - 5
    [0, -4, 0], // 3 - 1 - 3
    [0, 3, 8], // 3 - 5 - 8
    [0, -4, 8], // 3 - 1 - 8
    [0, -4, -2], // 3 - 1 - 2
    [0, 3, 0] // 3 - 5 - 3
];

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

const MelodyTasksMediant = ({ keyNumber }: Props): React.ReactElement<Props> => {
    const classes = useStyles();
    const [state, setState] = React.useState(getTaskProgressInitialState(melodies[0], getMelodyRecognizerMediantInitialState(melodies)));
    const [sustainLength, setSustainLength] = React.useState(0);
    const [gain, setGain] = useGain(audioVolume$);
    useAudio(audioVolume$);

    React.useEffect(() => {
        const subscriptions = [
            voiceDetector
                .getState()
                .pipe(
                    smoothPitch(),
                    melodyRecognizerMediant({ sustainLength$, melodies, startNote: keyNumber + 4 }),
                    taskProgress<MelodyRecognizerMediantState, number[]>({
                        targets: melodies,
                        checkCorrect: (state, _, targetIdx) => state.orderedMelodies[0].targetIdx === targetIdx,
                        initialState: getTaskProgressInitialState(melodies[0], getMelodyRecognizerMediantInitialState(melodies))
                    })
                )
                .subscribe((nextState) => setState(nextState)),
            sustainLength$.subscribe((len) => setSustainLength(len))
        ];

        return () => subscriptions.forEach((sub) => sub.unsubscribe());
    }, [keyNumber]);

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
                    startNum={state.stage === 0 ? ((state.endNote - keyNumber + 12) % 12) + 1 : state.interval + 5}
                    startError={state.error}
                    target={
                        ((
                            state.melodies[state.nextTargetIdx].intervals.find(
                                (interval, idx, arr) => (idx === 0 ? state.stage === 0 : interval.duration === 0) || idx === arr.length - 1
                            ) || {}
                        ).interval || 0) + 5
                    }
                    progress={Math.min(state.progress / sustainLength, 1)}
                />
                <div className={classes.melodyBox}>
                    <MelodyDiagram
                        melody={state.nextTarget}
                        done={state.melodies[state.nextTargetIdx].intervals.map((interval, idx) =>
                            idx === 0 ? state.stage > 0 : interval.duration !== 0 && !state.isDone
                        )}
                        current={state.interval}
                    />
                    <div className={classes.matchesBox}>
                        <h3>Matching melodies</h3>
                        {state.orderedMelodies.map((melody, idx) => (
                            <MelodyDiagram
                                key={melody.targetIdx}
                                melody={melody.intervals.map((i) => i.interval)}
                                done={melody.intervals.map((interval, idx) =>
                                    idx === 0 ? state.stage > 0 && !state.isDone : interval.duration !== 0 && !state.isDone
                                )}
                                current={state.interval}
                                variant={
                                    idx === 0 && melody.intervals[melody.intervals.length - 1].duration !== 0
                                        ? melody.targetIdx === state.currTargetIdx
                                            ? 'success'
                                            : 'failure'
                                        : ''
                                }
                            />
                        ))}
                    </div>
                </div>
            </IndicatorsContainer>
        </TaskPage>
    );
};

export default MelodyTasksMediant;
