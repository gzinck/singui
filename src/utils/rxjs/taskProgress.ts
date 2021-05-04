import { Observable } from 'rxjs';
import { map, scan } from 'rxjs/operators';

interface Props<RecognizerState, Target> {
    targets: Target[];
    checkCorrect: (state: RecognizerState, target: Target, targetIdx: number) => boolean;
    initialState: TaskProgressState<Target, RecognizerState>;
    getNextNote: (state: TaskProgressState<Target, RecognizerState>) => number | undefined;
    onComplete?: (completed: Target, next: Target) => void;
    maxAttempts: number;
}

export interface SingTaskResult<RecognizerState, Target> {
    target: Target;
    success?: boolean;
    attempts: number;
    recognized: (RecognizerState & { time: number })[];
    start: number;
    stop?: number;
}

export interface State<RecognizerState, Target> {
    isDone: boolean;
    isCorrect: boolean; // If current note is correct
    results: SingTaskResult<RecognizerState, Target>[];
    currTargetIdx: number;
    currTarget: Target;
    nextTargetIdx: number;
    nextTarget: Target;
    nextNote: number | undefined;
}

export type TaskProgressState<Target, RecognizerState> = State<RecognizerState, Target> & RecognizerState;

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
                recognized: []
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

                const results: SingTaskResult<RecognizerState, Target>[] = [...state.results];
                // Add on the current frequency
                if (!curr.isDone) {
                    // Add the frequency to the results
                    const oldResult = results[results.length - 1];
                    results[results.length - 1] = {
                        ...oldResult,
                        recognized: [...oldResult.recognized, { ...curr, time: performance.now() }]
                    };
                }

                if (curr.isDone && !state.isDone) {
                    // If we're done and it's right (or we maxed out our attempts), more forward
                    const attempts = results[results.length - 1].attempts;
                    if (isCorrect || attempts >= maxAttempts) {
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
                            recognized: []
                        });
                    } else {
                        results[results.length - 1] = {
                            ...results[results.length - 1],
                            attempts: attempts + 1
                        };
                    }

                    // Notify completion if needed
                    if (onComplete) onComplete(currTarget, nextTarget);
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
