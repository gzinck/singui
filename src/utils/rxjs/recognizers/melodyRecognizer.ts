import { Observable } from 'rxjs';
import { PitchRecognizerState } from './pitchRecognizer';
import { scan } from 'rxjs/operators';
import { scoreMelodyDTW } from './melodyScoring/scoreMelodyDTW';

export interface Melody {
    intervals: number[];
    id: string;
}

export interface MelodyState extends Melody {
    score: number; // Higher score when good
}

interface Props {
    melodies: Melody[];
    // Function to score the melody with highest score for closest match (negatives allowed).
    // Defaults to DTW algorithm.
    scoreMelody?: (melodies: Melody[], intervals: number[]) => MelodyState[];
    startNote: number;
    startNoteIdx: number; // If startNote is 4th note in scale, it's 4.
}

export interface MelodyRecognizerState {
    startNote: number;
    hz: number;
    note: number;
    noteAbs: number;
    error: number;
    interval: number;
    intervals: number[];
    isValid: boolean;
    melodies: MelodyState[]; // ordered from highest to lowest score
}

const getMelodyRecognizerInitialState = (melodies: Melody[]): MelodyRecognizerState => ({
    startNote: 0,
    hz: 0,
    note: 0,
    noteAbs: 0,
    interval: 0,
    error: 0,
    intervals: [0],
    isValid: false,
    melodies: melodies.map((melody) => ({
        intervals: melody.intervals,
        score: 0,
        id: melody.id
    }))
});

const sortMelodies = (melodies: MelodyState[]) => [...melodies].sort((melody1, melody2) => melody2.score - melody1.score);

export const melodyRecognizer = ({ melodies, startNote, startNoteIdx, scoreMelody }: Props) => (
    source$: Observable<PitchRecognizerState>
): Observable<MelodyRecognizerState> => {
    return source$.pipe(
        scan<PitchRecognizerState, MelodyRecognizerState>((state, curr) => {
            const interval = curr.noteAbs - startNote;

            const intervals = [...state.intervals, interval];

            const sortedMelodies = sortMelodies((scoreMelody || scoreMelodyDTW)(melodies, intervals));

            return {
                startNote,
                hz: curr.hz,
                note: interval + startNoteIdx,
                noteAbs: curr.noteAbs,
                error: curr.error,
                interval,
                intervals,
                isValid: intervals.length > 5, // Must have sung for at least 500 ms to register
                melodies: sortedMelodies
            };
        }, getMelodyRecognizerInitialState(melodies))
    );
};
