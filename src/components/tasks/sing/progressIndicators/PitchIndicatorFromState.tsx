import { TaskType, UniversalRecognizerState } from '../../../../utils/rxjs/recognizers/universalRecognizer';
import { TaskTarget } from '../target';
import { TaskProgressState } from '../../../../utils/rxjs/taskProgress';
import React from 'react';
import CircularPitchMeter, { noteNamesFrom } from './CircularPitchMeter';
import useSustainLength from '../../../audio/useSustainLength';
import useTonic from '../../../audio/useTonic';
import Hideable from '../../../common/Hideable';
import { convertNumericNoteToString } from '../../../../utils/pitchConverter';

interface Props {
    state: TaskProgressState<TaskTarget, UniversalRecognizerState>;
    hideable: boolean;
    numberLabels: boolean;
}

const noteNumberLabels1 = new Array(12).fill(0).map((_, idx) => convertNumericNoteToString(idx) || '-');
const noteNumberLabels8 = ['(8)', ...noteNumberLabels1.slice(1)];

const getRecognizedFromState = (state: TaskProgressState<TaskTarget, UniversalRecognizerState>, keyNumber: number): number[] => {
    switch (state.type) {
        case TaskType.PITCH:
            return [state.noteAbs - keyNumber];
        case TaskType.INTERVAL:
            return [state.startNote - keyNumber, state.noteAbs - keyNumber];
        case TaskType.MELODY:
            return state.melodies[0].intervals.map((interval) => state.startNote - keyNumber + interval);
    }
};

const PitchIndicatorFromState = ({ state, hideable, numberLabels }: Props): React.ReactElement => {
    const [sustainLength] = useSustainLength();
    const [tonic] = useTonic();
    const keyNumber = tonic % 12;
    const noteLabels = React.useMemo(() => noteNamesFrom(keyNumber), [keyNumber]);
    const noteNumberLabels = state.type !== TaskType.PITCH && state.noteAbs - state.startNote > 5 ? noteNumberLabels8 : noteNumberLabels1;
    return (
        <Hideable hidden={hideable && state.type === TaskType.PITCH && state.progress === 0}>
            <CircularPitchMeter
                noteLabels={numberLabels ? noteNumberLabels : noteLabels}
                noteNum={state.noteAbs - keyNumber}
                error={state.error}
                recognized={getRecognizedFromState(state, keyNumber)}
                progress={state.type === TaskType.PITCH ? Math.min(state.progress / sustainLength, 1) : 1}
            />
        </Hideable>
    );
};

PitchIndicatorFromState.defaultProps = {
    hideable: false,
    numberLabels: true
};

export default PitchIndicatorFromState;
