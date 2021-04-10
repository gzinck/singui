import React from 'react';
import StaticPitchMeter from '../pitchMeter/StaticPitchMeter';
import { voiceDetector } from '../detector/shared';
import { smoothPitch } from '../../utils/smoothPitch';
import { convertNoteToString } from '../../utils/pitchConverter';
import NoteProgressIndicator from '../progress/NoteProgressIndicator';
import useAudio from '../audio/useAudio';
import TaskPage from './TaskPage';
import IndicatorsContainer from './IndicatorsContainer';
import { getTaskProgressInitialState, taskProgress } from '../../utils/taskProgress';
import { Subject, Subscription } from 'rxjs';
import { pitchRecognizer, pitchRecognizerInitialState, PitchRecognizerState } from '../../utils/pitchRecognizer';

interface PitchTasksProps {
    noteLabels?: string[];
    keyNumber: number;
}

const defaultSustainLength = 5;

const PitchTasks = (props: PitchTasksProps): React.ReactElement<PitchTasksProps> => {
    const [state, setState] = React.useState(getTaskProgressInitialState(props.keyNumber, pitchRecognizerInitialState));
    const sustainLength$ = React.useRef(new Subject<number>());
    const [sustainLength, setSustainLength] = React.useState(defaultSustainLength);

    const setGain = useAudio();

    // Get updates as the user sings
    React.useEffect(() => {
        const possibleTargets = [0, 2, 4, 5, 7, 9, 11];
        const targets = [0, 3, 5, 4, 1, 2, 1, 6, 0, 6, 2, 4, 3, 5].map((n) => (possibleTargets[n] + props.keyNumber) % 12);

        const subscriptions: Subscription[] = [
            voiceDetector
                .getState()
                .pipe(
                    smoothPitch(),
                    pitchRecognizer({ sustainLength$: sustainLength$.current }),
                    taskProgress<PitchRecognizerState>({
                        targets,
                        convertCurrent: (n: number) => n % 12,
                        currKey: 'noteNum',
                        initialState: getTaskProgressInitialState(props.keyNumber, pitchRecognizerInitialState)
                    })
                )
                .subscribe((nextState) => setState(nextState)),
            sustainLength$.current.subscribe((len) => setSustainLength(len))
        ];
        sustainLength$.current.next(defaultSustainLength);

        return () => subscriptions.forEach((sub) => sub.unsubscribe());
    }, [props.keyNumber]);

    return (
        <TaskPage
            header="Pitch tasks"
            subheader={`Pitch to sing: ${convertNoteToString(state.nextTarget, false)}`}
            sustainLength={sustainLength}
            setSustainLength={(sustainLength) => sustainLength$.current.next(sustainLength)}
            setGain={setGain}
        >
            <IndicatorsContainer>
                <StaticPitchMeter
                    noteLabels={props.noteLabels}
                    startNum={(state.noteNum - props.keyNumber + 12) % 12}
                    startError={state.error}
                    target={(state.nextTarget - props.keyNumber + 12) % 12}
                />
                <NoteProgressIndicator
                    noteName={convertNoteToString(state.noteNum)}
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
