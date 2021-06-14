import { TaskType, UniversalRecognizerState } from '../../../utils/rxjs/recognizers/universalRecognizer';
import { TaskTarget } from './target';
import { TaskProgressState } from '../../../utils/rxjs/taskProgress';
import React from 'react';
import { getCurrentStringForState } from '../../../utils/targetConverter';
import CircularPitchMeter, { noteNamesFrom } from './progressIndicators/CircularPitchMeter';
import useSustainLength from '../../audio/useSustainLength';
import useTonic from '../../audio/useTonic';
import Hideable from '../../common/Hideable';

interface Props {
    state: TaskProgressState<TaskTarget, UniversalRecognizerState>;
    hideable: boolean;
}

const PitchIndicatorFromState = ({ state, hideable }: Props): React.ReactElement => {
    const [sustainLength] = useSustainLength();
    const [tonic] = useTonic();
    const keyNumber = tonic % 12;
    const noteLabels = React.useMemo(() => noteNamesFrom(keyNumber), [keyNumber]);
    return (
        <Hideable hidden={hideable && state.type === TaskType.PITCH && state.progress === 0}>
            <CircularPitchMeter
                noteLabels={noteLabels}
                startNum={(state.type === TaskType.INTERVAL ? state.startNote : state.noteAbs) - keyNumber}
                startError={state.type === TaskType.INTERVAL ? state.startError : state.error}
                endNum={state.noteAbs - keyNumber}
                endError={state.error}
                progress={state.type === TaskType.PITCH ? Math.min(state.progress / sustainLength, 1) : 1}
                label={getCurrentStringForState(state)}
            />
        </Hideable>
    );
};

PitchIndicatorFromState.defaultProps = {
    hideable: false
};

export default PitchIndicatorFromState;
