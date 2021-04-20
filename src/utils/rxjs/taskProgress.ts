import { Observable } from 'rxjs';
import { scan } from 'rxjs/operators';

interface Props<RecognizerState, Target> {
    targets: Target[];
    checkCorrect: (state: RecognizerState, target: Target, targetIdx: number) => boolean;
    initialState: TaskProgressState<Target> & RecognizerState;
}

interface Result<Target> {
    target: Target;
    success?: boolean;
    start: Date;
    stop?: Date;
}

export interface TaskProgressState<Target> {
    isCorrect: boolean; // If current note is correct
    results: Result<Target>[];
    currTargetIdx: number;
    currTarget: Target;
    nextTargetIdx: number;
    nextTarget: Target;
}

export function getTaskProgressInitialState<RecognizerState, Target>(
    initialTarget: Target,
    emptyState: RecognizerState
): TaskProgressState<Target> & RecognizerState {
    return {
        ...emptyState,
        isCorrect: false,
        results: [
            {
                target: initialTarget,
                start: new Date()
            }
        ],
        currTargetIdx: 0,
        currTarget: initialTarget,
        nextTargetIdx: 0,
        nextTarget: initialTarget
    };
}

export function taskProgress<RecognizerState extends { isDone: boolean }, Target>({
    targets,
    checkCorrect,
    initialState
}: Props<RecognizerState, Target>) {
    return (source$: Observable<RecognizerState>): Observable<TaskProgressState<Target> & RecognizerState> => {
        return source$.pipe(
            scan<RecognizerState, TaskProgressState<Target> & RecognizerState>((state, curr) => {
                const currTargetIdx = curr.isDone && state.isDone ? state.currTargetIdx : state.nextTargetIdx;
                const currTarget = curr.isDone && state.isDone ? state.currTarget : state.nextTarget;
                let nextTargetIdx = state.nextTargetIdx;
                let nextTarget = state.nextTarget;
                const isCorrect = checkCorrect(curr, currTarget, currTargetIdx);

                const results: Result<Target>[] = [...state.results];
                if (curr.isDone && !state.isDone) {
                    nextTargetIdx = results.length % targets.length;
                    nextTarget = targets[nextTargetIdx];
                    results[results.length - 1] = {
                        ...results[results.length - 1],
                        stop: new Date(),
                        success: isCorrect
                    };
                    results.push({
                        target: targets[results.length % targets.length],
                        start: new Date()
                    });
                }

                return {
                    ...curr,
                    isCorrect,
                    results,
                    currTargetIdx,
                    currTarget,
                    nextTargetIdx,
                    nextTarget
                };
            }, initialState)
        );
    };
}
