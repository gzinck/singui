import { pitchTaskProps } from '../sing/possibleTasks';
import { TaskType } from '../../../utils/rxjs/recognizers/universalRecognizer';
import Page from '../../page/Page';
import TargetBox from '../sing/progressIndicators/TargetBox';
import { SingingProps, useSinging } from '../sing/useSinging';
import PitchIndicatorFromState from '../sing/progressIndicators/PitchIndicatorFromState';
import React from 'react';
import { Alert } from '@material-ui/lab';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../../theme';
import { defaultSustainLength } from '../../detector/shared';
import Centered from '../../common/Centered';

export interface CalibrationSingProps {
    header: string;
    startMessage: string;
    error?: string;
    onComplete: (startNote: number) => void;
}

const singingProps: SingingProps = {
    recognizers: pitchTaskProps.recognizers,
    targets: [{ type: TaskType.PITCH, value: 0 }],
    hasBackground: true,
    maxAttempts: 1,
    sustainLength: defaultSustainLength
};

const useStyles = makeStyles<Theme>((theme) => ({
    alert: {
        margin: theme.spacing(1, 0, 2)
    }
}));

const CalibrationSingPage = ({ onComplete, header, startMessage, error }: CalibrationSingProps) => {
    const classes = useStyles();
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
                {error && state.type === TaskType.PITCH && state.progress === 0 && (
                    <Alert className={classes.alert} severity="warning">
                        {error}
                    </Alert>
                )}
            </TargetBox>
            <Centered>
                <PitchIndicatorFromState state={state} hideable={false} numberLabels={false} />
            </Centered>
        </Page>
    );
};

export default CalibrationSingPage;
