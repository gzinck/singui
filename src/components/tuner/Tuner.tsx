import React from 'react';
import { smoothPitch } from '../../utils/smoothPitch';
import ScrollingPitchMeter from '../pitchMeter/ScrollingPitchMeter';
import { voiceDetector } from '../detector/shared';
import TaskPage from '../tasks/TaskPage';

const Tuner = (): React.ReactElement => {
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
        <TaskPage header="Tuner" subheader={note}>
            <p>Error: {Math.round(error * 100)}%</p>
            <ScrollingPitchMeter noteNum={noteNum} error={error} />
        </TaskPage>
    );
};

export default Tuner;
