import { TaskType, UniversalRecognizerState } from '../../../../utils/rxjs/recognizers/universalRecognizer';
import { MelodyTaskTarget, TaskTarget } from '../target';
import { TaskProgressState } from '../../../../utils/rxjs/taskProgress';
import React from 'react';
import CircularPitchMeter, { noteNamesFrom } from './CircularPitchMeter';
import useTonic from '../../../audio/useTonic';
import Hideable from '../../../common/Hideable';
import { convertNumericNoteToString } from '../../../../utils/pitchConverter';
import { mod12 } from '../../../../utils/math';

interface Props {
    state: TaskProgressState<TaskTarget, UniversalRecognizerState>;
    hideable: boolean;
    numberLabels: boolean;
}

const noteNumberLabels1 = new Array(12).fill(0).map((_, idx) => convertNumericNoteToString(idx) || '-');
const noteNumberLabels8 = ['(8)', ...noteNumberLabels1.slice(1)];

const getRecognizedFromState = (state: TaskProgressState<TaskTarget, UniversalRecognizerState>, keyNumber: number): number[] => {
    // Deals with case where noteNum = -Infinity at start
    if (!state.recognized) return [mod12(state.pitch.noteNum - keyNumber) || 0];
    switch (state.recognized.type) {
        case TaskType.PITCH:
            return [state.recognized.value];
        case TaskType.INTERVAL:
            return [state.recognized.startNote, state.recognized.value + state.recognized.startNote];
        case TaskType.MELODY:
            return state.recognized.value.map((interval) => (state.recognized as MelodyTaskTarget).startNote + interval);
    }
};

const PitchIndicatorFromState = ({ state, hideable, numberLabels }: Props): React.ReactElement => {
    const [tonic] = useTonic();
    const keyNumber = tonic % 12;
    const noteLabels = React.useMemo(() => noteNamesFrom(keyNumber), [keyNumber]);
    const noteNumberLabels =
        state.type !== TaskType.PITCH && mod12(state.pitch.noteNum - keyNumber) > 5 ? noteNumberLabels8 : noteNumberLabels1;
    return (
        <Hideable hidden={hideable && state.type === TaskType.PITCH && state.progress === 0}>
            <CircularPitchMeter
                noteLabels={numberLabels ? noteNumberLabels : noteLabels}
                // Deal with when noteNum = -Infinity at start
                noteNum={Math.max(state.pitch.noteNum - keyNumber, 0)}
                error={state.pitch.error || 0}
                recognized={getRecognizedFromState(state, keyNumber)}
                progress={state.recognized ? 1 : 0}
            />
        </Hideable>
    );
};

PitchIndicatorFromState.defaultProps = {
    hideable: false,
    numberLabels: true
};

export default PitchIndicatorFromState;
