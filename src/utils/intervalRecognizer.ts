import { convertHzToInterval, ReadableVocalState } from './pitchConverter';
import { merge, Observable } from 'rxjs';
import { debounceTime, map, scan } from 'rxjs/operators';
import { pitchRecognizer, PitchRecognizerState } from './pitchRecognizer';

interface Props {
    sustainLength$: Observable<number>;
}

export interface IntervalRecognizerState {
    startHz: number;
    endHz: number;
    interval: number;
    error: number;
    stage: number;
    progress: number;
    isDone: boolean;
}

export const intervalRecognizerInitialState: IntervalRecognizerState = {
    startHz: 0,
    endHz: 0,
    interval: 0,
    error: 0,
    stage: 0,
    progress: 0,
    isDone: false
};

export const intervalRecognizer = ({ sustainLength$ }: Props) => (
    source$: Observable<ReadableVocalState>
): Observable<IntervalRecognizerState> => {
    const pitches$ = source$.pipe(pitchRecognizer({ sustainLength$ }));
    const done$ = source$.pipe(
        debounceTime(500),
        map(() => 0)
    );
    return merge(pitches$, done$).pipe(
        scan<PitchRecognizerState | number, IntervalRecognizerState>((state, curr) => {
            if (typeof curr === 'number') {
                return {
                    ...state,
                    stage: 0, // Moving right along!
                    isDone: true
                };
            } else {
                const startHz = state.stage === 0 ? curr.hz : state.startHz;
                const endHz = curr.hz;

                // Calculate the interval
                const intervalUnrounded = convertHzToInterval(startHz, endHz);
                const roundUp = intervalUnrounded % 1 >= 0.5;
                const interval = roundUp ? Math.ceil(intervalUnrounded) : Math.floor(intervalUnrounded);
                const error = roundUp ? 1 - (intervalUnrounded % 1) : intervalUnrounded % 1;

                return {
                    startHz,
                    endHz,
                    interval,
                    error,
                    stage: state.stage === 0 && !curr.isDone ? 0 : 1,
                    // Edge case not considered: what if user changes sustainLength mid-interval?
                    progress: state.stage === 0 ? curr.progress : state.progress,
                    isDone: false
                };
            }
        }, intervalRecognizerInitialState)
    );
};
