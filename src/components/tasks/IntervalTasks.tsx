import React from 'react';
import TaskPage from './TaskPage';
import { convertIntervalToString } from '../../utils/pitchConverter';
import IndicatorsContainer from './IndicatorsContainer';
import { voiceDetector } from '../detector/shared';
import { smoothPitch } from '../../utils/smoothPitch';
import StaticPitchMeter, { intervalsAscendingNotes } from '../pitchMeter/StaticPitchMeter';
import NoteProgressIndicator from '../progress/NoteProgressIndicator';
import { Subject, Subscription } from 'rxjs';
import { getTaskProgressInitialState, taskProgress } from '../../utils/taskProgress';
import { intervalRecognizer, intervalRecognizerInitialState, IntervalRecognizerState } from '../../utils/intervalRecognizer';

const defaultSustainLength = 5;
const targets = [2, 7, 4, 12, 9, 11, 5];

const IntervalTasks = (): React.ReactElement => {
    const [state, setState] = React.useState(getTaskProgressInitialState(targets[0], intervalRecognizerInitialState));
    const sustainLength$ = React.useRef(new Subject<number>());
    const [sustainLength, setSustainLength] = React.useState(defaultSustainLength);

    React.useEffect(() => {
        const subscriptions: Subscription[] = [
            voiceDetector
                .getState()
                .pipe(
                    smoothPitch(),
                    intervalRecognizer({ sustainLength$: sustainLength$.current }),
                    taskProgress<IntervalRecognizerState>({
                        targets,
                        currKey: 'interval',
                        initialState: getTaskProgressInitialState(targets[0], intervalRecognizerInitialState)
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
            header="Interval tasks"
            subheader={`Interval to sing: ${convertIntervalToString(state.nextTarget)}`}
            sustainLength={sustainLength}
            setSustainLength={(sustainLength) => sustainLength$.current.next(sustainLength)}
        >
            <IndicatorsContainer>
                <StaticPitchMeter
                    noteLabels={intervalsAscendingNotes}
                    startNum={1}
                    startError={0}
                    endNum={Math.max(0, Math.min(14, state.interval + 1))}
                    endError={state.error}
                    target={1 + state.nextTarget}
                />
                <NoteProgressIndicator
                    noteName={convertIntervalToString(state.interval)}
                    isIncorrect={!state.isCorrect && state.interval !== 0 && (state.stage === 1 || state.isDone)}
                    progress={Math.min(state.progress / sustainLength, 1)}
                />
            </IndicatorsContainer>
        </TaskPage>
    );
};

export default IntervalTasks;
