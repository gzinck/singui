import { Observable, Subject } from 'rxjs';
import { intervalRecognizer, IntervalRecognizerState } from './intervalRecognizer';
import { pitchRecognizer, PitchRecognizerState } from './pitchRecognizer';
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

type IntervalState = IntervalRecognizerState & CommonState & { type: TaskType.INTERVAL };
type PitchState = PitchRecognizerState & CommonState & { type: TaskType.PITCH };
type MelodyState = MelodyRecognizerState & CommonState & { type: TaskType.MELODY };
export type UniversalRecognizerState = IntervalState | PitchState | MelodyState;

interface Mode {
    type: TaskType;
    noteAbs: number;
    note: number;
}

const initialMode: Mode = { type: TaskType.PITCH, noteAbs: 0, note: 0 };

export const universalRecognizer = ({ sustainLength$, recognizers, keyNumber }: Props) => (
    source$: Observable<ReadableVocalState>
): Observable<UniversalRecognizerState> => {
    const mode$ = new Subject<Mode>();
    const sourceWithReplay$ = source$.pipe(shareReplay(1));
    // Switch
    const state$ = mode$.pipe(
        // Must start with something to allow the processing to occur
        startWith(initialMode),
        concatMap(({ type, noteAbs, note }) => {
            const recognizer = recognizers[note];
            switch (type) {
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
                        withLatestFrom(mode$.pipe(startWith(initialMode)), (state, mode: Mode) => ({ ...state, mode })),
                        finallyDone({
                            checkDone: (state) => {
                                return (
                                    state.isValid && state.mode.type === TaskType.PITCH && recognizers[state.note].type === TaskType.PITCH
                                );
                            }
                        })
                    );
                case TaskType.INTERVAL:
                    return source$.pipe(
                        pitchRecognizer({ sustainLength$, keyNumber }),
                        intervalRecognizer({ startNote: noteAbs, startNoteIdx: note }),
                        map<IntervalRecognizerState, IntervalState>((state) => ({
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
                        melodyRecognizer({ startNote: noteAbs, startNoteIdx: note, melodies: (recognizer as MelodyRecognizer).melodies }),
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
    source$.pipe(debounceTime(500)).subscribe(() => mode$.next(initialMode));

    // If we have a valid pitch task, if this note is mapped to interval/melody, switch modes
    state$.subscribe((state: UniversalRecognizerState) => {
        if (state.isValid && !state.isDone && state.type === TaskType.PITCH) {
            const recognizer = recognizers[state.note];
            switch (recognizer.type) {
                case TaskType.INTERVAL:
                    mode$.next({ type: TaskType.INTERVAL, noteAbs: state.noteAbs, note: state.note });
                    break;
                case TaskType.MELODY:
                    mode$.next({ type: TaskType.MELODY, noteAbs: state.noteAbs, note: state.note });
                    break;
            }
        }
    });

    return state$;
};
