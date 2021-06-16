import { pitchTaskProps } from '../sing/possibleTasks';
import { TaskType } from '../../../utils/rxjs/recognizers/universalRecognizer';
import Page from '../../page/Page';
import TargetBox from '../sing/progressIndicators/TargetBox';
import { SingingProps, useSinging } from '../sing/useSinging';
import PitchIndicatorFromState from '../sing/progressIndicators/PitchIndicatorFromState';
import React from 'react';

export interface CalibrationSingProps {
    header: string;
    startMessage: string;
    onComplete: (startNote: number) => void;
}

const singingProps: SingingProps = {
    recognizers: pitchTaskProps.recognizers,
    targets: [{ type: TaskType.PITCH, value: 0 }],
    hasBackground: false,
    maxAttempts: 1
};

const CalibrationSingPage = ({ onComplete, header, startMessage }: CalibrationSingProps) => {
    const { state } = useSinging(singingProps);
    const [message, setMessage] = React.useState(startMessage);

    React.useEffect(() => {
        if (state.isDone) onComplete(state.noteAbs);
    }, [state.isDone, state.noteAbs, onComplete]);

    React.useEffect(() => {
        if (state.type !== TaskType.PITCH) return; // Won't happen
        if (state.isValid) setMessage('Stop singing');
        else if (state.progress > 0) setMessage('Keep singing...');
        else setMessage(startMessage);
    }, [state, startMessage]);

    return (
        <Page header={header}>
            <TargetBox height="7rem">
                <h2>{message}</h2>
            </TargetBox>
            <PitchIndicatorFromState state={state} hideable={false} numberLabels={false} />
        </Page>
    );
};

export default CalibrationSingPage;
