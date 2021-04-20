import { Observable } from 'rxjs';
import { PitchRecognizerState } from './pitchRecognizer';
import { map } from 'rxjs/operators';

interface Props {
    startNote: number;
    startNoteIdx: number; //
}

export interface IntervalRecognizerTonicState {
    startNote: number;
    note: number; // This is the interval (relative pitch compared to the start note).
    interval: number;
    error: number;
    isDone: boolean;
}

export const intervalRecognizerTonicInitialState: IntervalRecognizerTonicState = {
    startNote: 0,
    note: 0,
    interval: 0,
    error: 0,
    isDone: false
};

export const intervalRecognizer = ({ startNote, startNoteIdx }: Props) => (
    source$: Observable<PitchRecognizerState>
): Observable<IntervalRecognizerTonicState> => {
    return source$.pipe(
        map((state) => ({
            startNote,
            note: state.noteAbs - startNote + startNoteIdx,
            interval: state.noteAbs - startNote,
            error: state.error,
            isDone: false // It never finishes; it finishes in the universalRecognizer
        }))
    );
};
