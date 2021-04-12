import React from 'react';
import TaskPage from './TaskPage';
import MelodyDiagram from './MelodyDiagram';
import { getTaskProgressInitialState, taskProgress } from '../../utils/taskProgress';
import { getMelodyRecognizerInitialState, melodyRecognizer, MelodyRecognizerState } from '../../utils/recognizers/melodyRecognizer';
import { Subject } from 'rxjs';
import { voiceDetector } from '../detector/shared';
import { smoothPitch } from '../../utils/smoothPitch';

const melodies = [
    [0, 3, 12],
    [0, 3, -3]
];

const defaultSustainLength = 2;

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
                        checkCorrect: (state, target) =>
                            state.melodies[0].intervals.reduce<boolean>(
                                (correct, curr, idx) => correct && target[idx] === curr.interval,
                                true
                            ),
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
                done={state.melodies[(state.results.length - 1) % melodies.length].intervals.map(
                    (interval) => interval.duration !== 0 && !state.isDone
                )}
                current={state.interval}
            />
        </TaskPage>
    );
};

export default MelodyTasks;
