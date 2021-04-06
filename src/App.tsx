import React from 'react';
import './App.css';
import VoiceDetector from './utils/VoiceDetector';
import PitchMeter from './components/pitchMeter/PitchMeter';
import { ThemeProvider } from '@material-ui/core/styles';
import { theme } from './components/theme';
import {smoothPitch} from "./utils/smoothPitch";

const detector = new VoiceDetector();

function App() {
    const [note, setNote] = React.useState('Sing or hum to begin');
    const [noteNum, setNoteNum] = React.useState(44);
    const [error, setError] = React.useState(0);

    // Get updates as the user sings
    React.useEffect(() => {
        const subscription = detector
            .getState()
            .pipe(smoothPitch())
            .subscribe((state) => {
                setNoteNum(state.noteNum);
                setNote(state.note);
                setError(state.error);
            });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <div className="App">
                <header className="App-header">
                    <h1>{note}</h1>
                    <p>
                        Extent to which your singing is bad: {Math.round(error * 100)}% -- {noteNum}
                    </p>
                    <PitchMeter noteNum={noteNum} error={error} />
                </header>
            </div>
        </ThemeProvider>
    );
}

export default App;
