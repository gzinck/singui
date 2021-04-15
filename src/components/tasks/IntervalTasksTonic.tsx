import React from 'react';
import TaskPage from './taskPage/TaskPage';
import { convertIntervalToString } from '../../utils/pitchConverter';
import IndicatorsContainer from './progressIndicators/IndicatorsContainer';
import { audioVolume$, sustainLength$, voiceDetector } from '../detector/shared';
import { smoothPitch } from '../../utils/rxjs/smoothPitch';
import StaticPitchMeter, { intervalsAscendingNotes } from './progressIndicators/StaticPitchMeter';
import NoteProgressIndicator from './progressIndicators/NoteProgressIndicator';
import { Subscription } from 'rxjs';
import { getTaskProgressInitialState, taskProgress } from '../../utils/rxjs/taskProgress';
import {
    intervalRecognizerTonic,
    intervalRecognizerTonicInitialState,
    IntervalRecognizerTonicState
} from '../../utils/rxjs/recognizers/intervalRecognizerTonic';
import useAudio from '../audio/useAudio';

interface IntervalTasksTonicProps {
    keyNumber: number;
}

const targets = [2, 7, 4, 12, 9, 11, 5];

// Deal with negatives elegantly.
const mod = (n: number, m: number): number => ((n % m) + m) % m;
const clampInterval = (n: number): number => Math.max(0, Math.min(14, n + 1));

const IntervalTasks = ({ keyNumber }: IntervalTasksTonicProps): React.ReactElement<IntervalTasksTonicProps> => {
    const [state, setState] = React.useState(getTaskProgressInitialState(targets[0], intervalRecognizerTonicInitialState));
    const [sustainLength, setSustainLength] = React.useState(0);
    const [gain, setGain] = React.useState(0);

    useAudio(audioVolume$);
    React.useEffect(() => {
        const sub = audioVolume$.subscribe((volume) => setGain(volume));
        return () => sub.unsubscribe();
    }, []);

    React.useEffect(() => {
        const subscriptions: Subscription[] = [
            voiceDetector
                .getState()
                .pipe(
                    smoothPitch(),
                    intervalRecognizerTonic({ sustainLength$ }),
                    taskProgress<IntervalRecognizerTonicState, number>({
                        targets,
                        checkCorrect: (state, target) =>
                            (state.interval === target || state.stage === 0) && mod(state.startNote, 12) === keyNumber,
                        initialState: getTaskProgressInitialState(targets[0], intervalRecognizerTonicInitialState)
                    })
                )
                .subscribe((nextState) => setState(nextState)),
            sustainLength$.subscribe((len) => setSustainLength(len))
        ];

        return () => subscriptions.forEach((sub) => sub.unsubscribe());
    }, [keyNumber]);

    const startNum = mod(state.startNote + 12 - keyNumber, 12);

    return (
        <TaskPage
            header="Interval tasks"
            subheader={`Interval to sing: ${convertIntervalToString(state.nextTarget)}`}
            sustainLength={sustainLength}
            setSustainLength={(sustainLength) => sustainLength$.next(sustainLength)}
            gain={gain}
            setGain={(volume) => audioVolume$.next(volume)}
        >
            <IndicatorsContainer>
                <StaticPitchMeter
                    noteLabels={intervalsAscendingNotes}
                    startNum={startNum + 1}
                    startError={state.startError}
                    endNum={clampInterval(startNum + state.interval)}
                    endError={state.endError}
                    target={1 + (state.stage === 0 ? 0 : state.nextTarget)}
                />
                <NoteProgressIndicator
                    noteName={state.stage === 0 ? 'Start' : convertIntervalToString(state.interval)}
                    isIncorrect={!state.isCorrect}
                    progress={Math.min(state.progress / sustainLength, 1)}
                />
            </IndicatorsContainer>
        </TaskPage>
    );
};

export default IntervalTasks;
