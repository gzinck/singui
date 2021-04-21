import { Observable } from 'rxjs';
import { PitchRecognizerState } from './pitchRecognizer';
import { scan } from 'rxjs/operators';

export interface Melody {
    intervals: number[];
    id: string;
}

interface Props {
    melodies: Melody[];
    startNote: number;
    startNoteIdx: number; // If startNote is 4th note in scale, it's 4.
}

interface Interval {
    interval: number;
    duration: number;
}

export interface MelodyState {
    intervals: Interval[];
    score: number; // Higher score when good
    id: string; // Index of the melody
}

export interface MelodyRecognizerState {
    startNote: number;
    note: number;
    error: number;
    interval: number;
    intervals: Interval[];
    isValid: boolean;
    melodies: MelodyState[]; // ordered from highest to lowest score
}

const getMelodyRecognizerInitialState = (melodies: Melody[]): MelodyRecognizerState => ({
    startNote: 0,
    note: 0,
    interval: 0,
    error: 0,
    intervals: [
        {
            interval: 0,
            duration: 1
        }
    ],
    isValid: false,
    melodies: melodies.map((melody) => ({
        intervals: melody.intervals.map((interval) => ({ interval, duration: 0 })),
        score: 0,
        id: melody.id
    }))
});

// Record the durations of all items in the melodies, sort by the date.
// WARNING: this is inefficient and can easily be improved when necessary.
const getMelodiesWithProgress = (melodies: Melody[], intervals: Interval[]): MelodyState[] => {
    return melodies.map((melody) => {
        let intervalPos = 0;
        const melIntervals = melody.intervals.map((interval) => {
            while (intervalPos < intervals.length && intervals[intervalPos].interval !== interval) intervalPos++;
            return {
                interval: interval,
                duration: intervalPos < intervals.length ? intervals[intervalPos].duration : 0
            };
        });
        return {
            id: melody.id,
            intervals: melIntervals,
            score: melIntervals.reduce((acc: number, interval: Interval) => acc + interval.duration, 0)
        };
    });
};

const sortMelodies = (melodies: MelodyState[]) => [...melodies].sort((melody1, melody2) => melody2.score - melody1.score);

export const melodyRecognizer = ({ melodies, startNote, startNoteIdx }: Props) => (
    source$: Observable<PitchRecognizerState>
): Observable<MelodyRecognizerState> => {
    return source$.pipe(
        scan<PitchRecognizerState, MelodyRecognizerState>((state, curr) => {
            const interval = curr.noteAbs - startNote;

            // Extend the previous interval or start the next one
            const intervals = [...state.intervals];
            if (intervals.length > 0 && intervals[intervals.length - 1].interval === interval) {
                intervals[intervals.length - 1] = {
                    ...intervals[intervals.length - 1],
                    duration: intervals[intervals.length - 1].duration + 1
                };
            } else {
                intervals.push({
                    interval,
                    duration: 1
                });
            }

            const sortedMelodies = sortMelodies(getMelodiesWithProgress(melodies, intervals));

            return {
                startNote,
                note: interval + startNoteIdx,
                error: curr.error,
                interval,
                intervals,
                isValid: sortedMelodies[0].intervals[sortedMelodies[0].intervals.length - 1].duration !== 0,
                melodies: sortedMelodies
            };
        }, getMelodyRecognizerInitialState(melodies))
    );
};
