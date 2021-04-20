import React from 'react';
import StaticPitchMeter from './progressIndicators/StaticPitchMeter';
import { audioVolume$, sustainLength$, voiceDetector } from '../detector/shared';
import { smoothPitch } from '../../utils/rxjs/smoothPitch';
import { convertNoteToString } from '../../utils/pitchConverter';
import NoteProgressIndicator from './progressIndicators/NoteProgressIndicator';
import useAudio from '../audio/useAudio';
import TaskPage from './taskPage/TaskPage';
import IndicatorsContainer from './progressIndicators/IndicatorsContainer';
import { getTaskProgressInitialState, taskProgress } from '../../utils/rxjs/taskProgress';
import { Subscription } from 'rxjs';
import { pitchRecognizer, pitchRecognizerInitialState, PitchRecognizerState } from '../../utils/rxjs/recognizers/pitchRecognizer';

interface PitchTasksProps {
    noteLabels?: string[];
    keyNumber: number;
}

const PitchTasks = (props: PitchTasksProps): React.ReactElement<PitchTasksProps> => {
    const [state, setState] = React.useState(getTaskProgressInitialState(props.keyNumber, pitchRecognizerInitialState, props.keyNumber));
    const [sustainLength, setSustainLength] = React.useState(0);
    const [gain, setGain] = React.useState(0);

    useAudio(audioVolume$);
    React.useEffect(() => {
        const sub = audioVolume$.subscribe((volume) => setGain(volume));
        return () => sub.unsubscribe();
    }, []);

    // Get updates as the user sings
    React.useEffect(() => {
        const possibleTargets = [0, 2, 4, 5, 7, 9, 11];
        const targets = [0, 3, 5, 4, 1, 2, 1, 6, 0, 6, 2, 4, 3, 5].map((n) => (possibleTargets[n] + props.keyNumber) % 12);

        const subscriptions: Subscription[] = [
            voiceDetector
                .getState()
                .pipe(
                    smoothPitch(),
                    pitchRecognizer({ sustainLength$, keyNumber: props.keyNumber }),
                    taskProgress<PitchRecognizerState, number>({
                        targets,
                        checkCorrect: (state, target) => state.noteAbs % 12 === target,
                        initialState: getTaskProgressInitialState(props.keyNumber, pitchRecognizerInitialState, targets[0]),
                        getNextNote: (state) => state.nextTarget
                    })
                )
                .subscribe((nextState) => setState(nextState)),
            sustainLength$.subscribe((len) => setSustainLength(len))
        ];

        return () => subscriptions.forEach((sub) => sub.unsubscribe());
    }, [props.keyNumber]);

    return (
        <TaskPage
            header="Pitch tasks"
            subheader={`Pitch to sing: ${convertNoteToString(state.nextTarget, false)}`}
            sustainLength={sustainLength}
            setSustainLength={(sustainLength) => sustainLength$.next(sustainLength)}
            gain={gain}
            setGain={(volume) => audioVolume$.next(volume)}
        >
            <IndicatorsContainer>
                <StaticPitchMeter
                    noteLabels={props.noteLabels}
                    startNum={(state.noteAbs - props.keyNumber + 12) % 12}
                    startError={state.error}
                    target={(state.nextTarget - props.keyNumber + 12) % 12}
                    progress={Math.min(state.progress / sustainLength, 1)}
                    isCorrect={state.isCorrect}
                />
                <NoteProgressIndicator
                    noteName={convertNoteToString(state.noteAbs)}
                    isIncorrect={!state.isCorrect}
                    progress={Math.min(state.progress / sustainLength, 1)}
                />
            </IndicatorsContainer>
        </TaskPage>
    );
};

PitchTasks.defaultProps = {
    keyNumber: 0
};

export default PitchTasks;
