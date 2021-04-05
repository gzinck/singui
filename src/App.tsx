import React from 'react';
import './App.css';
import VoiceDetector from './utils/VoiceDetector';
import { map } from 'rxjs/operators';
import { convertPitchToReadable } from './utils/pitchConverter';

const detector = new VoiceDetector();

function App() {
    const [note, setNote] = React.useState('Sing or hum to begin');
    const [error, setError] = React.useState('0%');

    // Get updates as the user sings
    React.useEffect(() => {
        const subscription = detector
            .getState()
            .pipe(map((state) => convertPitchToReadable(state)))
            .subscribe((state) => {
                if (!state) return;
                setNote(state.note);
                setError(`${Math.round(state.error * 100)}%`);
            });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <div className="App">
            <header className="App-header">
                <h1>{note}</h1>
                <p>Extent to which your singing is bad: {error}</p>
            </header>
        </div>
    );
}

export default App;
