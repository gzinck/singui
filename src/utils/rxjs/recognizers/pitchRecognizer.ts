import { Observable } from 'rxjs';
import { ReadableVocalState } from '../../pitchConverter';
import { scan, withLatestFrom } from 'rxjs/operators';

interface Props {
    sustainLength$: Observable<number>;
}

export interface PitchRecognizerState {
    error: number;
    noteNum: number;
    hz: number;
    progress: number;
    isDone: boolean;
}

export const pitchRecognizerInitialState: PitchRecognizerState = {
    error: 0,
    noteNum: 0,
    hz: 0,
    progress: 0,
    isDone: false
};

export const pitchRecognizer = ({ sustainLength$ }: Props) => (
    source: Observable<ReadableVocalState>
): Observable<PitchRecognizerState> => {
    return source.pipe(
        withLatestFrom(sustainLength$),
        scan<[ReadableVocalState, number], PitchRecognizerState>(
            (state, [curr, sustainLength]) => {
                const progress = state.noteNum === curr.noteNum ? state.progress + 1 : 0;
                return {
                    error: curr.error,
                    noteNum: curr.noteNum,
                    hz: curr.hz,
                    isDone: progress >= sustainLength,
                    progress
                };
            },
            {
                error: 0,
                noteNum: 0,
                hz: 0,
                isDone: false,
                progress: 0
            }
        )
    );
};
