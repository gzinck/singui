import React from 'react';
import { smoothPitch } from '../../utils/rxjs/smoothPitch';
import ScrollingPitchMeter from './progressIndicators/ScrollingPitchMeter';
import { voiceDetector } from '../detector/shared';
import TaskPage from './taskPage/TaskPage';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../theme';

const useStyles = makeStyles<Theme>((theme) => ({
    root: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
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

        return () => subscription.unsubscribe();
    }, []);

    return (
        <TaskPage header="Tuner">
            <div className={classes.root}>
                <h2>{note}</h2>
                <p>Error: {Math.round(error * 100)}%</p>
                <ScrollingPitchMeter noteNum={noteNum} error={error} />
            </div>
        </TaskPage>
    );
};

export default Tuner;
