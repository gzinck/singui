import React from 'react';
import { smoothPitch } from '../utils/smoothPitch';
import PitchMeter from './pitchMeter/PitchMeter';
import { voiceDetector } from './detector/shared';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from './theme';

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
    h1: {
        marginTop: 0
    }
}));

const Tuner = (): React.ReactElement => {
    const classes = useStyles();
    const [note, setNote] = React.useState('Sing or hum to begin');
    const [noteNum, setNoteNum] = React.useState(0);
    const [error, setError] = React.useState(0);

    // Get updates as the user sings
    React.useEffect(() => {
        const subscription = voiceDetector
            .getState()
            .pipe(smoothPitch())
            .subscribe((state) => {
                setNote(state.note);
                setNoteNum(state.noteNum);
                setError(state.error);
            });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <div className={classes.root}>
            <h1 className={classes.h1}>Tuner</h1>
            <h2>{note}</h2>
            <p>Error: {Math.round(error * 100)}%</p>
            <PitchMeter noteNum={noteNum} error={error} />
        </div>
    );
};

export default Tuner;
