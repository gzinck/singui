import { merge, Observable } from 'rxjs';
import { ReadableVocalState } from '../../pitchConverter';
import { pitchRecognizer, PitchRecognizerState } from './pitchRecognizer';
import { debounceTime, map, scan } from 'rxjs/operators';

interface Props {
    sustainLength$: Observable<number>;
    startNote: number;
}

export interface IntervalRecognizerTonicState {
    interval: number;
    startNote: number;
    startError: number;
    endNote: number;
    endError: number;
    stage: number;
    progress: number;
    isDone: boolean;
}

export const intervalRecognizerTonicInitialState: IntervalRecognizerTonicState = {
    interval: 0,
    startNote: 0,
    startError: 0,
    endNote: 0,
    endError: 0,
    stage: 0,
    progress: 0,
    isDone: false
};

// TODO: rename this to intervalRecognizer (doesn't matter what start note is)
export const intervalRecognizerTonic = (props: Props) => (
    source$: Observable<ReadableVocalState>
): Observable<IntervalRecognizerTonicState> => {
    const { sustainLength$ } = props;
    const pitches$ = source$.pipe(pitchRecognizer({ sustainLength$ }));
    const done$ = source$.pipe(
        debounceTime(500),
        map(() => 0)
    );

    return merge(pitches$, done$).pipe(
        scan<PitchRecognizerState | number, IntervalRecognizerTonicState>((state, curr) => {
            if (typeof curr === 'number') {
                // We have finished the interval
                return {
                    ...state,
                    stage: 0,
                    progress: 0,
                    isDone: state.stage === 1 && state.interval !== 0
                };
            }

            const stage = state.stage === 0 && (!curr.isDone || curr.noteNum % 12 !== props.startNote) ? 0 : 1;
            const endNote = curr.noteNum;
            const endError = curr.error;
            const startNote = stage === 0 ? endNote : state.startNote;
            const startError = stage === 0 ? endError : state.startError;
            const interval = endNote - startNote;

            return {
                interval,
                startNote,
                startError,
                endNote,
                endError,
                stage,
                progress: state.stage === 0 ? curr.progress : state.progress,
                isDone: false
            };
        }, intervalRecognizerTonicInitialState)
    );
};
