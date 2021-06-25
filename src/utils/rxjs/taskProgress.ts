import { Observable } from 'rxjs';
import { map, scan } from 'rxjs/operators';

interface Props<RecognizerState, Target> {
    targets: Target[];
    checkCorrect: (state: RecognizerState, target: Target, targetIdx: number) => boolean;
    initialState: TaskProgressState<Target, RecognizerState>;
    getNextNote: (state: TaskProgressState<Target, RecognizerState>) => number | undefined;
    onComplete?: (completed: Target, next: Target, isRepeated: boolean) => void;
    maxAttempts: number;
}

export interface SingTaskResult<Target> {
    target: Target;
    success?: boolean;
    attempts: number;
    frequencies: { hz: number; time: number }[];
    start: number;
    stop?: number;
}

export interface State<Target> {
    isDone: boolean;
    isCorrect: boolean; // If current note is correct
    results: SingTaskResult<Target>[];
    currTargetIdx: number;
    currTarget: Target;
    nextTargetIdx: number;
    nextTarget: Target;
    nextNote: number | undefined;
}

export type TaskProgressState<Target, RecognizerState> = State<Target> & RecognizerState;

export function getTaskProgressInitialState<RecognizerState, Target>(
    initialTarget: Target,
    emptyState: RecognizerState,
    initialNote: number
): TaskProgressState<Target, RecognizerState> {
    return {
        ...emptyState,
        isDone: false,
        isCorrect: false,
        results: [
            {
                target: initialTarget,
                start: performance.now(),
                attempts: 1,
                frequencies: []
            }
        ],
        currTargetIdx: 0,
        currTarget: initialTarget,
        nextTargetIdx: 0,
        nextTarget: initialTarget,
        nextNote: initialNote
    };
}

export function taskProgress<RecognizerState extends { hz: number; isDone: boolean }, Target>({
    targets,
    checkCorrect,
    initialState,
    getNextNote,
    onComplete,
    maxAttempts
}: Props<RecognizerState, Target>) {
    return (source$: Observable<RecognizerState>): Observable<TaskProgressState<Target, RecognizerState>> => {
        return source$.pipe(
            scan<RecognizerState, TaskProgressState<Target, RecognizerState>>((state, curr) => {
                const currTargetIdx = curr.isDone && state.isDone ? state.currTargetIdx : state.nextTargetIdx;
                const currTarget = curr.isDone && state.isDone ? state.currTarget : state.nextTarget;
                let nextTargetIdx = state.nextTargetIdx;
                let nextTarget = state.nextTarget;
                const isCorrect = checkCorrect(curr, currTarget, currTargetIdx);

                const results: SingTaskResult<Target>[] = [...state.results];

                // Add on the current frequency IFF we're not done (because if we are done, this is just a duplicate)
                // AND this isn't a piece of garbage data at the start of the task.
                if (!curr.isDone && !state.isDone) {
                    // Add the frequency to the results
                    const oldResult = results[results.length - 1];
                    // Add the frequency if it's new (otherwise, it's just a duplicate of the previous and is not
                    // actually indicating a new sound being detected).
                    // This edge case comes up when we finish singing, but we are redoing the trial.
                    const frequencies =
                        oldResult.frequencies.length > 0 && oldResult.frequencies[oldResult.frequencies.length - 1].hz === curr.hz
                            ? oldResult.frequencies
                            : [...oldResult.frequencies, { hz: curr.hz, time: performance.now() }];
                    results[results.length - 1] = {
                        ...oldResult,
                        frequencies
                    };
                }

                if (curr.isDone && !state.isDone) {
                    // If we're done and it's right (or we maxed out our attempts), more forward
                    const attempts = results[results.length - 1].attempts;
                    let isRepeated = true;
                    if (isCorrect || attempts >= maxAttempts) {
                        isRepeated = false;
                        nextTargetIdx = results.length % targets.length;
                        nextTarget = targets[nextTargetIdx];
                        results[results.length - 1] = {
                            ...results[results.length - 1],
                            stop: performance.now(),
                            success: isCorrect
                        };
                        results.push({
                            target: targets[results.length % targets.length],
                            start: performance.now(),
                            attempts: 1,
                            frequencies: []
                        });
                    } else {
                        results[results.length - 1] = {
                            ...results[results.length - 1],
                            attempts: attempts + 1
                        };
                    }

                    // Notify that we're repeating
                    if (onComplete) onComplete(currTarget, nextTarget, isRepeated);
                }

                return {
                    ...curr,
                    isCorrect,
                    results,
                    currTargetIdx,
                    currTarget,
                    nextTargetIdx,
                    nextTarget,
                    nextNote: 0
                };
            }, initialState),
            map((state) => ({
                ...state,
                nextNote: getNextNote(state)
            }))
        );
    };
}
