import React from 'react';
import TaskPage from './TaskPage';
import MelodyDiagram from './MelodyDiagram';
import { getTaskProgressInitialState, taskProgress } from '../../utils/taskProgress';
import { getMelodyRecognizerInitialState, melodyRecognizer, MelodyRecognizerState } from '../../utils/recognizers/melodyRecognizer';
import { Subject } from 'rxjs';
import { voiceDetector } from '../detector/shared';
import { smoothPitch } from '../../utils/smoothPitch';

const melodies = [
    [0, 4, 2],
    [0, 4, 5],
    [0, -1, -3],
    [0, 4, 7],
    [0, 7, 4],
    [0, -5, 0],
    [0, -5, -7],
    [0, -5, -3],
    [0, -5, 2]
];

const defaultSustainLength = 5;

const MelodyTasks = (): React.ReactElement => {
    const [state, setState] = React.useState(getTaskProgressInitialState(melodies[0], getMelodyRecognizerInitialState(melodies)));
    const sustainLength$ = React.useRef(new Subject<number>());
    const [sustainLength, setSustainLength] = React.useState(defaultSustainLength);

    React.useEffect(() => {
        const subscriptions = [
            voiceDetector
                .getState()
                .pipe(
                    smoothPitch(),
                    melodyRecognizer({ sustainLength$: sustainLength$.current, melodies }),
                    taskProgress<MelodyRecognizerState, number[]>({
                        targets: melodies,
                        checkCorrect: (state, _, targetIdx) => state.orderedMelodies[0].targetIdx === targetIdx,
                        initialState: getTaskProgressInitialState(melodies[0], getMelodyRecognizerInitialState(melodies))
                    })
                )
                .subscribe((nextState) => setState(nextState)),
            sustainLength$.current.subscribe((len) => setSustainLength(len))
        ];
        sustainLength$.current.next(defaultSustainLength);

        return () => subscriptions.forEach((sub) => sub.unsubscribe());
    }, []);

    return (
        <TaskPage
            header="Melody tasks"
            subheader="Sing the melody below"
            sustainLength={sustainLength}
            setSustainLength={(sustainLength) => sustainLength$.current.next(sustainLength)}
        >
            <MelodyDiagram
                melody={state.nextTarget}
                done={state.melodies[state.nextTargetIdx].intervals.map((interval, idx) =>
                    idx === 0 ? interval.duration > sustainLength && !state.isDone : interval.duration !== 0 && !state.isDone
                )}
                current={state.interval}
            />
            <h3>Matching melodies</h3>
            {state.orderedMelodies.map((melody, idx) => (
                <MelodyDiagram
                    key={melody.targetIdx}
                    melody={melody.intervals.map((i) => i.interval)}
                    done={melody.intervals.map((interval, idx) =>
                        idx === 0 ? interval.duration > sustainLength && !state.isDone : interval.duration !== 0 && !state.isDone
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
        </TaskPage>
    );
};

export default MelodyTasks;
