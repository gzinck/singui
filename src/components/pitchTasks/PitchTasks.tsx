import { Theme } from '../theme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React from 'react';
import StaticPitchMeter from '../pitchMeter/StaticPitchMeter';
import { voiceDetector } from '../detector/shared';
import { smoothPitch } from '../../utils/smoothPitch';
import {convertNoteToString} from "../../utils/pitchConverter";

const useStyles = makeStyles<Theme>((theme) => ({
    root: {
        backgroundColor: theme.palette.background.default,
        minHeight: '100vh',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.palette.text.primary
    }
}));

const PitchTasks = (): React.ReactElement => {
    const classes = useStyles();
    const [noteNum, setNoteNum] = React.useState(0);
    const [error, setError] = React.useState(0);
    const target = 6;

    // Get updates as the user sings
    React.useEffect(() => {
        const subscription = voiceDetector
            .getState()
            .pipe(smoothPitch())
            .subscribe((state) => {
                setNoteNum(state.noteNum);
                setError(state.error);
            });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <div className={classes.root}>
            <h1>Pitch Tasks</h1>
            <h2>{convertNoteToString(target, false)}</h2>
            <StaticPitchMeter noteNum={noteNum} error={error} target={target} />
        </div>
    );
};

export default PitchTasks;