import React from 'react';
import StaticPitchMeter from '../pitchMeter/StaticPitchMeter';
import { voiceDetector } from '../detector/shared';
import { smoothPitch } from '../../utils/smoothPitch';
import { convertNoteToString } from '../../utils/pitchConverter';
import NoteProgressIndicator from '../progress/NoteProgressIndicator';
import useAudio from '../audio/useAudio';
import TaskPage from './TaskPage';
import IndicatorsContainer from './IndicatorsContainer';

interface PitchTasksProps {
    noteLabels?: string[];
    keyNumber: number;
}

const PitchTasks = (props: PitchTasksProps): React.ReactElement<PitchTasksProps> => {
    const [state, setState] = React.useState({
        noteNum: 0,
        progress: 0,
        error: 0,
        targetIdx: 0,
        sustainLength: 5
    });
    const [targetIdx, setTargetIdx] = React.useState(0);

    const possibleTargets = [0, 2, 4, 5, 7, 9, 11];
    const targets = [0, 3, 5, 4, 1, 2, 1, 6, 0, 6, 2, 4, 3, 5].map((n) => possibleTargets[n]);
    const target = targets[targetIdx % targets.length] + props.keyNumber;

    const setGain = useAudio();

    React.useEffect(() => {
        if (state.progress >= state.sustainLength && state.targetIdx === targetIdx) {
            setTargetIdx((idx) => idx + 1);
        }
    }, [state, targetIdx]);

    // Get updates as the user sings
    React.useEffect(() => {
        const subscription = voiceDetector
            .getState()
            .pipe(smoothPitch())
            .subscribe((nextState) => {
                setState((state) => ({
                    ...nextState,
                    sustainLength: state.sustainLength,
                    progress: state.noteNum === nextState.noteNum ? state.progress + 1 : 0,
                    targetIdx:
                        state.noteNum === nextState.noteNum || state.progress < state.sustainLength ? state.targetIdx : state.targetIdx + 1
                }));
            });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <TaskPage
            header="Pitch tasks"
            subheader={`Pitch to sing: ${convertNoteToString(target, false)}`}
            sustainLength={state.sustainLength}
            setSustainLength={(sustainLength) => setState((state) => ({ ...state, sustainLength }))}
            setGain={setGain}
        >
            <IndicatorsContainer>
                <StaticPitchMeter
                    noteLabels={props.noteLabels}
                    startNum={(state.noteNum - props.keyNumber) % 12}
                    startError={state.error}
                    target={(target + 12 - props.keyNumber) % 12}
                />
                <NoteProgressIndicator
                    noteName={convertNoteToString(state.noteNum)}
                    isIncorrect={state.noteNum % 12 !== (targets[state.targetIdx % targets.length] + props.keyNumber) % 12}
                    progress={Math.min(state.progress / state.sustainLength, 1)}
                />
            </IndicatorsContainer>
        </TaskPage>
    );
};

PitchTasks.defaultProps = {
    keyNumber: 0
};

export default PitchTasks;
