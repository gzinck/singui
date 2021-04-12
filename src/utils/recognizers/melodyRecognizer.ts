import { merge, Observable } from 'rxjs';
import { convertHzToInterval, ReadableVocalState } from '../pitchConverter';
import { pitchRecognizer, PitchRecognizerState } from './pitchRecognizer';
import { debounceTime, map, scan } from 'rxjs/operators';

interface Interval {
    interval: number;
    duration: number;
}

interface Melody {
    intervals: Interval[];
    targetIdx: number;
}

interface Props {
    sustainLength$: Observable<number>;
    melodies: number[][];
}

export interface MelodyRecognizerState {
    startHz: number;
    currHz: number;
    interval: number;
    intervals: Interval[];
    stage: number; // 0 is for getting the startHz, 1 is for all others
    isDone: boolean; // when we narrowed things down
    melodies: Melody[]; // in order from most to least likely/matched
}

export const getMelodyRecognizerInitialState = (melodies: number[][]): MelodyRecognizerState => ({
    startHz: 0,
    currHz: 0,
    interval: 0,
    intervals: [],
    stage: 0,
    isDone: false,
    melodies: melodies.map((arr, targetIdx) => ({
        targetIdx,
        intervals: arr.map((interval) => ({ interval, duration: 0 }))
    }))
});

export const melodyRecognizer = ({ sustainLength$, melodies }: Props) => (
    source$: Observable<ReadableVocalState>
): Observable<MelodyRecognizerState> => {
    const pitches$ = source$.pipe(pitchRecognizer({ sustainLength$ }));
    const done$ = source$.pipe(
        debounceTime(500),
        map(() => 0)
    );

    return merge(pitches$, done$).pipe(
        scan<PitchRecognizerState | number, MelodyRecognizerState>((state, curr) => {
            // If we timed out, finish things up
            if (typeof curr === 'number') {
                return {
                    ...state,
                    stage: 0,
                    isDone: state.stage === 1
                };
            }

            const startHz = state.stage === 0 ? curr.hz : state.startHz;
            const currHz = curr.hz;
            const interval = Math.round(convertHzToInterval(startHz, currHz));

            // Add on the current interval (and reset the array if we just finished something)
            const intervals = state.isDone ? [] : [...state.intervals];
            if (intervals.length > 0 && intervals[intervals.length - 1].interval === interval) {
                intervals[intervals.length - 1] = {
                    ...intervals[intervals.length - 1],
                    duration: intervals[intervals.length - 1].duration + 1
                };
            } else if (state.stage === 1 || intervals.length === 0) {
                intervals.push({
                    interval,
                    duration: 1
                });
            } else {
                // Otherwise, we're in stage 0 and switching the first interval to something new
                intervals[0] = {
                    interval,
                    duration: 1
                };
            }

            // Record the durations of all items in the melodies, sort by the date.
            // WARNING: this is inefficient and can easily be improved when necessary.
            const melodyProgress = melodies.map((melody, targetIdx) => {
                let intervalPos = 0;
                return {
                    intervals: melody.map((melInterval) => {
                        while (intervalPos < intervals.length && intervals[intervalPos].interval !== melInterval) intervalPos++;
                        return {
                            interval: melInterval,
                            duration: intervalPos < intervals.length ? intervals[intervalPos].duration : 0
                        };
                    }),
                    targetIdx
                };
            });

            // We're in stage 0 iff we finished at the last update OR we were previously in stage 0 and we're not done
            let stage = state.isDone || (state.stage === 0 && !curr.isDone) ? 0 : 1;

            return {
                startHz,
                currHz,
                interval,
                intervals,
                stage,
                isDone: false,
                melodies: melodyProgress
            };
        }, getMelodyRecognizerInitialState(melodies))
    );
};
