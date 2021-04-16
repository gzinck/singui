import { merge, Observable } from 'rxjs';
import { ReadableVocalState } from '../../pitchConverter';
import { pitchRecognizer, PitchRecognizerState } from './pitchRecognizer';
import { debounceTime, map, scan } from 'rxjs/operators';

interface Interval {
    interval: number;
    duration: number;
}

export interface Melody {
    intervals: Interval[];
    score: number; // Higher score when good
    targetIdx: number; // Index of the melody
}

interface Props {
    sustainLength$: Observable<number>;
    melodies: number[][];
    startNote: number;
}

export interface MelodyRecognizerMediantState {
    startNote: number;
    endNote: number;
    error: number;
    interval: number;
    intervals: Interval[];
    stage: number; // 0 is for getting the startHz, 1 is for all others
    progress: number;
    isDone: boolean; // when we narrowed things down
    melodies: Melody[]; // in the same order as input
    orderedMelodies: Melody[]; // ordered from highest to lowest score
}

export const getMelodyRecognizerMediantInitialState = (melodies: number[][]): MelodyRecognizerMediantState => ({
    startNote: 0,
    endNote: 0,
    error: 0,
    interval: 0,
    intervals: [],
    stage: 0,
    progress: 0,
    isDone: false,
    melodies: melodies.map((arr, targetIdx) => ({
        intervals: arr.map((interval) => ({ interval, duration: 0 })),
        score: 0,
        targetIdx
    })),
    orderedMelodies: melodies.map((arr, targetIdx) => ({
        intervals: arr.map((interval) => ({ interval, duration: 0 })),
        score: 0,
        targetIdx
    }))
});

// Record the durations of all items in the melodies, sort by the date.
// WARNING: this is inefficient and can easily be improved when necessary.
const getMelodiesWithProgress = (melodies: number[][], intervals: Interval[]): Melody[] => {
    return melodies.map((melody, targetIdx) => {
        let intervalPos = 0;
        const melIntervals = melody.map((melInterval) => {
            while (intervalPos < intervals.length && intervals[intervalPos].interval !== melInterval) intervalPos++;
            return {
                interval: melInterval,
                duration: intervalPos < intervals.length ? intervals[intervalPos].duration : 0
            };
        });
        return {
            targetIdx,
            intervals: melIntervals,
            score: melIntervals.reduce((acc: number, interval: Interval) => acc + interval.duration, 0)
        };
    });
};

const sortMelodies = (melodies: Melody[]) => [...melodies].sort((melody1, melody2) => melody2.score - melody1.score);

// TODO: rename this to be just a "melodyRecognizer" (doesn't matter what start note, it's a parameter)
export const melodyRecognizerMediant = (props: Props) => (
    source$: Observable<ReadableVocalState>
): Observable<MelodyRecognizerMediantState> => {
    const { sustainLength$, melodies } = props;
    const pitches$ = source$.pipe(pitchRecognizer({ sustainLength$ }));
    const done$ = source$.pipe(
        debounceTime(500),
        map(() => 0)
    );

    return merge(pitches$, done$).pipe(
        scan<PitchRecognizerState | number, MelodyRecognizerMediantState>((state, curr) => {
            // If we timed out, finish things up
            if (typeof curr === 'number') {
                const currMelodyIntervals = state.orderedMelodies[0].intervals;
                const finishedMelody = currMelodyIntervals[currMelodyIntervals.length - 1].duration !== 0;
                const intervals = state.stage === 1 && !finishedMelody ? [] : state.intervals;
                const melodyProgress = getMelodiesWithProgress(melodies, intervals);
                return {
                    ...state,
                    interval: 0,
                    stage: 0,
                    progress: 0,
                    intervals,
                    isDone: state.stage === 1 && finishedMelody,
                    melodies: melodyProgress,
                    orderedMelodies: sortMelodies(melodyProgress)
                };
            }

            const startNote = state.stage === 0 ? curr.noteNum : state.startNote;
            const endNote = curr.noteNum;
            const interval = endNote - startNote;

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

            const melodyProgress = getMelodiesWithProgress(melodies, intervals);

            // We're in stage 0 iff we were previously in stage 0 and [we're on the wrong note|we're not done]
            const stage = state.stage === 0 && (startNote % 12 !== props.startNote || !curr.isDone) ? 0 : 1;

            return {
                startNote,
                endNote,
                error: curr.error,
                interval,
                intervals,
                stage,
                progress: state.stage === 0 ? curr.progress : state.progress,
                isDone: false,
                melodies: melodyProgress,
                orderedMelodies: sortMelodies(melodyProgress)
            };
        }, getMelodyRecognizerMediantInitialState(melodies))
    );
};
