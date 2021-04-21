import { Observable, Subject } from 'rxjs';
import { intervalRecognizer, IntervalRecognizerTonicState } from './intervalRecognizer';
import { pitchRecognizer, pitchRecognizerInitialState, PitchRecognizerState } from './pitchRecognizer';
import { Melody, melodyRecognizer, MelodyRecognizerState } from './melodyRecognizer';
import { concatMap, debounceTime, map, shareReplay, startWith, takeUntil, withLatestFrom } from 'rxjs/operators';
import { finallyDone } from '../finallyDone';
import { ReadableVocalState } from '../../pitchConverter';

interface Props {
    recognizers: RecognizerMap;
    keyNumber: number;
    sustainLength$: Observable<number>;
}

interface Recognizer {
    type: TaskType.PITCH | TaskType.INTERVAL | undefined;
}

interface MelodyRecognizer {
    type: TaskType.MELODY;
    melodies: Melody[];
}

export type RecognizerMap = Record<number, Recognizer | MelodyRecognizer>;

export enum TaskType {
    PITCH = 'PITCH',
    INTERVAL = 'INTERVAL',
    MELODY = 'MELODY'
}

interface CommonState {
    isDone: boolean;
}

type IntervalState = IntervalRecognizerTonicState & CommonState & { type: TaskType.INTERVAL };
type PitchState = PitchRecognizerState & CommonState & { type: TaskType.PITCH };
type MelodyState = MelodyRecognizerState & CommonState & { type: TaskType.MELODY };
export type UniversalRecognizerState = IntervalState | PitchState | MelodyState;

/**
 *
 * @param sustainLength$
 * @param recognizers
 * @param keyNumber
 */
export const universalRecognizer = ({ sustainLength$, recognizers, keyNumber }: Props) => (
    source$: Observable<ReadableVocalState>
): Observable<UniversalRecognizerState> => {
    const mode$ = new Subject<TaskType>();
    const sourceWithReplay$ = source$.pipe(shareReplay(1));
    // Switch
    const state$ = mode$.pipe(
        // Must start with something to allow the processing to occur
        startWith(TaskType.PITCH),
        withLatestFrom(
            source$.pipe(pitchRecognizer({ sustainLength$, keyNumber }), startWith(pitchRecognizerInitialState)),
            (mode, currPitch) => ({ mode, currPitch })
        ),
        concatMap(({ mode, currPitch }) => {
            const recognizer = recognizers[currPitch.note];
            const startNote = currPitch.noteAbs;
            switch (mode) {
                case TaskType.PITCH:
                    return sourceWithReplay$.pipe(
                        pitchRecognizer({ sustainLength$, keyNumber }),
                        map<PitchRecognizerState, PitchState>((state) => ({
                            ...state,
                            type: TaskType.PITCH,
                            isDone: false
                        })),
                        takeUntil(mode$), // Continue until mode switches
                        // If we had a valid pitch AND we have NOT switched to a new mode AND we're supposed
                        // to be able to recognize pitch, signal done
                        withLatestFrom(mode$.pipe(startWith(TaskType.PITCH)), (state, mode) => ({ ...state, mode })),
                        finallyDone({
                            checkDone: (state) => state.isValid && state.mode === TaskType.PITCH && recognizer.type === TaskType.PITCH
                        })
                    );
                case TaskType.INTERVAL:
                    return source$.pipe(
                        pitchRecognizer({ sustainLength$, keyNumber }),
                        intervalRecognizer({ startNote, startNoteIdx: currPitch.note }),
                        map<IntervalRecognizerTonicState, IntervalState>((state) => ({
                            ...state,
                            type: TaskType.INTERVAL,
                            isDone: false
                        })),
                        takeUntil(mode$), // Continue until mode switches
                        finallyDone({ checkDone: (state) => state.isValid })
                    );
                case TaskType.MELODY:
                    return source$.pipe(
                        pitchRecognizer({ sustainLength$, keyNumber }),
                        melodyRecognizer({ startNote, startNoteIdx: currPitch.note, melodies: (recognizer as MelodyRecognizer).melodies }),
                        map<MelodyRecognizerState, MelodyState>((state) => ({
                            ...state,
                            type: TaskType.MELODY,
                            isDone: false
                        })),
                        takeUntil(mode$), // Continue until mode switches
                        finallyDone({ checkDone: (state) => state.isValid })
                    );
            }
        })
    );

    // After 500 ms, stop and switch to pitch again
    source$.pipe(debounceTime(500)).subscribe(() => mode$.next(TaskType.PITCH));

    // If we have a valid pitch task, if this note is mapped to interval/melody, switch modes
    state$.subscribe((state: UniversalRecognizerState) => {
        if (state.isValid && !state.isDone && state.type === TaskType.PITCH) {
            const recognizer = recognizers[state.note];
            switch (recognizer.type) {
                case TaskType.INTERVAL:
                    mode$.next(TaskType.INTERVAL);
                    break;
                case TaskType.MELODY:
                    mode$.next(TaskType.MELODY);
                    break;
            }
        }
    });

    return state$;
};
