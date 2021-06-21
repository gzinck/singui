import { Observable } from 'rxjs';
import { ReadableVocalState } from '../../pitchConverter';
import { scan } from 'rxjs/operators';
import { mod12 } from '../../math';

interface Props {
    sustainLength: number;
    keyNumber: number;
}

export interface PitchRecognizerState {
    error: number;
    noteAbs: number;
    note: number; // Note, adjusted for the key and mod 12
    hz: number;
    progress: number;
    isValid: boolean;
}

export const pitchRecognizerInitialState: PitchRecognizerState = {
    error: 0,
    noteAbs: 0,
    note: 0,
    hz: 0,
    progress: 0,
    isValid: false
};

export const pitchRecognizer = ({ sustainLength, keyNumber }: Props) => (
    source: Observable<ReadableVocalState>
): Observable<PitchRecognizerState> => {
    return source.pipe(
        scan<ReadableVocalState, PitchRecognizerState>((state, curr) => {
            const progress = state.noteAbs === curr.noteNum ? state.progress + 1 : 0;
            return {
                error: curr.error,
                noteAbs: curr.noteNum,
                note: mod12(curr.noteNum - keyNumber),
                hz: curr.hz,
                isValid: progress >= sustainLength,
                progress
            };
        }, pitchRecognizerInitialState)
    );
};
