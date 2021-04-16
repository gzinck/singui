import React from 'react';
import TaskPage from './taskPage/TaskPage';
import { convertIntervalToString } from '../../utils/pitchConverter';
import IndicatorsContainer from './progressIndicators/IndicatorsContainer';
import { sustainLength$, voiceDetector } from '../detector/shared';
import { smoothPitch } from '../../utils/rxjs/smoothPitch';
import StaticPitchMeter, { intervalsAscendingNotes } from './progressIndicators/StaticPitchMeter';
import NoteProgressIndicator from './progressIndicators/NoteProgressIndicator';
import { Subscription } from 'rxjs';
import { getTaskProgressInitialState, taskProgress } from '../../utils/rxjs/taskProgress';
import {
    intervalRecognizer,
    intervalRecognizerInitialState,
    IntervalRecognizerState
} from '../../utils/rxjs/legacyRecognizers/intervalRecognizer';

const targets = [2, 7, 4, 12, 9, 11, 5];

const IntervalTasks = (): React.ReactElement => {
    const [state, setState] = React.useState(getTaskProgressInitialState(targets[0], intervalRecognizerInitialState));
    const [sustainLength, setSustainLength] = React.useState(0);

    React.useEffect(() => {
        const subscriptions: Subscription[] = [
            voiceDetector
                .getState()
                .pipe(
                    smoothPitch(),
                    intervalRecognizer({ sustainLength$ }),
                    taskProgress<IntervalRecognizerState, number>({
                        targets,
                        checkCorrect: (state, target) => state.interval === target,
                        initialState: getTaskProgressInitialState(targets[0], intervalRecognizerInitialState)
                    })
                )
                .subscribe((nextState) => setState(nextState)),
            sustainLength$.subscribe((len) => setSustainLength(len))
        ];

        return () => subscriptions.forEach((sub) => sub.unsubscribe());
    }, []);

    const endNum = Math.max(0, Math.min(14, state.interval + 1));

    return (
        <TaskPage
            header="Interval tasks"
            subheader={`Interval to sing: ${convertIntervalToString(state.nextTarget)}`}
            sustainLength={sustainLength}
            setSustainLength={(sustainLength) => sustainLength$.next(sustainLength)}
        >
            <IndicatorsContainer>
                <StaticPitchMeter
                    noteLabels={intervalsAscendingNotes}
                    startNum={1}
                    startError={0}
                    endNum={endNum}
                    endError={endNum === 0 ? 0 : state.error}
                    target={1 + state.nextTarget}
                    isCorrect={state.isCorrect || state.stage === 0}
                />
                <NoteProgressIndicator
                    noteName={state.stage === 0 ? 'Start' : convertIntervalToString(state.interval)}
                    isIncorrect={!state.isCorrect && state.stage === 1}
                    progress={Math.min(state.progress / sustainLength, 1)}
                />
            </IndicatorsContainer>
        </TaskPage>
    );
};

export default IntervalTasks;
