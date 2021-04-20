import { Observable } from 'rxjs';
import { intervalRecognizer, IntervalRecognizerTonicState } from './intervalRecognizer';
import { PitchRecognizerState } from './pitchRecognizer';
import { Melody, melodyRecognizer, MelodyRecognizerState } from './melodyRecognizer';
import { debounceTime, filter, map, mergeMap, takeUntil, throttle } from 'rxjs/operators';
import { finallyDone } from '../finallyDone';

interface Recognizer {
    type: TaskType.PITCH | TaskType.INTERVAL;
}

interface MelodyRecognizer {
    type: TaskType.MELODY;
    melodies: Melody[];
}

export type RecognizerMap = Record<number, Recognizer | MelodyRecognizer>;

interface Props {
    recognizers: RecognizerMap;
    keyNumber: number;
}

export enum TaskType {
    PITCH = 'PITCH',
    INTERVAL = 'INTERVAL',
    MELODY = 'MELODY'
}

interface CommonState {
    inProgress: boolean;
}

type IntervalState = IntervalRecognizerTonicState & CommonState & { type: TaskType.INTERVAL };
type PitchState = PitchRecognizerState & CommonState & { type: TaskType.PITCH };
type MelodyState = MelodyRecognizerState & CommonState & { type: TaskType.MELODY };
export type UniversalRecognizerState = IntervalState | PitchState | MelodyState;

export const universalRecognizer = ({ recognizers, keyNumber }: Props) => (
    source$: Observable<PitchRecognizerState>
): Observable<UniversalRecognizerState> => {
    const done$ = source$.pipe(
        debounceTime(500),
        map(() => 0)
    );
    return source$.pipe(
        filter((state) => state.isDone), // Take the first one where pitch is recongized
        throttle(() => done$), // Stop accepting until we're done
        mergeMap((state) => {
            const startNote = state.noteAbs;
            const recognizer = recognizers[state.note];
            switch (recognizer.type) {
                case TaskType.PITCH:
                    // TODO: make it possible to switch to another mode after entering this mode.
                    return source$.pipe(
                        map<PitchRecognizerState, PitchState>((state) => ({
                            ...state,
                            type: TaskType.PITCH,
                            isDone: false, // Make sure it doesn't finish until the end
                            inProgress: true
                        })),
                        takeUntil(done$),
                        finallyDone()
                    );
                case TaskType.INTERVAL:
                    return source$.pipe(
                        intervalRecognizer({ startNote, startNoteIdx: state.note }),
                        map<IntervalRecognizerTonicState, IntervalState>((state) => ({
                            ...state,
                            type: TaskType.INTERVAL,
                            inProgress: true
                        })),
                        takeUntil(done$),
                        finallyDone()
                    );
                case TaskType.MELODY:
                    return source$.pipe(
                        melodyRecognizer({ startNote, startNoteIdx: state.note, melodies: recognizer.melodies }),
                        map<MelodyRecognizerState, MelodyState>((state) => ({ ...state, type: TaskType.MELODY, inProgress: true })),
                        takeUntil(done$),
                        finallyDone()
                    );
            }
        })
    );
};
