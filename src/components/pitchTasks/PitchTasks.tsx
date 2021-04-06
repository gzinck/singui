import { Theme } from '../theme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React from 'react';
import StaticPitchMeter from '../pitchMeter/StaticPitchMeter';
import { voiceDetector } from '../detector/shared';
import { smoothPitch } from '../../utils/smoothPitch';
import { convertNoteToString } from '../../utils/pitchConverter';
import NoteProgressIndicator from "../progress/NoteProgressIndicator";

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
    },
    indicators: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    progressIndicator: {
        display: 'flex'
    }
}));

const PitchTasks = (): React.ReactElement => {
    const classes = useStyles();
    const [state, setState] = React.useState({
        noteNum: 0,
        progress: 0,
        error: 0
    });
    const target = 6;

    // Get updates as the user sings
    React.useEffect(() => {
        const subscription = voiceDetector
            .getState()
            .pipe(smoothPitch())
            .subscribe((nextState) => {
                setState(state => ({
                    ...nextState,
                    progress: (state.noteNum === nextState.noteNum) ? state.progress + 1 : 0
                }));
            });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <div className={classes.root}>
            <h1>Pitch Tasks</h1>
            <h2>{convertNoteToString(target, false)}</h2>
            <div className={classes.indicators}>
                <StaticPitchMeter noteNum={state.noteNum} error={state.error} target={target} />
                <div className={classes.progressIndicator}>
                    <NoteProgressIndicator noteNum={state.noteNum} progress={Math.min(state.progress / 4, 1)} />
                </div>
            </div>
        </div>
    );
};

export default PitchTasks;
