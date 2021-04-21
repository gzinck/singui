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
    isValid: boolean;
}

export const intervalRecognizerTonicInitialState: IntervalRecognizerTonicState = {
    startNote: 0,
    note: 0,
    interval: 0,
    error: 0,
    isValid: false
};

export const intervalRecognizer = ({ startNote, startNoteIdx }: Props) => (
    source$: Observable<PitchRecognizerState>
): Observable<IntervalRecognizerTonicState> => {
    return source$.pipe(
        map((state) => {
            const interval = state.noteAbs - startNote;
            return {
                startNote,
                note: interval + startNoteIdx,
                interval,
                error: state.error,
                isValid: interval !== 0 // Everything is fair game EXCEPT singing one note
            };
        })
    );
};
