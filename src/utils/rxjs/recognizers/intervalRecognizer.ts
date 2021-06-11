import { Observable } from 'rxjs';
import { PitchRecognizerState } from './pitchRecognizer';
import { map } from 'rxjs/operators';

interface Props {
    startNote: number;
    startError: number;
    startNoteIdx: number; //
}

export interface IntervalRecognizerState {
    startNote: number;
    startError: number;
    hz: number;
    note: number; // This is the interval (relative pitch compared to the start note).
    noteAbs: number;
    interval: number;
    error: number;
    isValid: boolean;
}

export const intervalRecognizerInitialState: IntervalRecognizerState = {
    startNote: 0,
    startError: 0,
    hz: 0,
    note: 0,
    noteAbs: 0,
    interval: 0,
    error: 0,
    isValid: false
};

export const intervalRecognizer = ({ startNote, startError, startNoteIdx }: Props) => (
    source$: Observable<PitchRecognizerState>
): Observable<IntervalRecognizerState> => {
    return source$.pipe(
        map((state) => {
            const interval = state.noteAbs - startNote;
            return {
                startNote,
                startError,
                hz: state.hz,
                note: interval + startNoteIdx,
                noteAbs: state.noteAbs,
                interval,
                error: state.error,
                isValid: interval !== 0 // Everything is fair game EXCEPT singing one note
            };
        })
    );
};
