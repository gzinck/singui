import { Observable } from 'rxjs';
import { scan } from 'rxjs/operators';

interface Props<RecognizerState> {
    targets: number[];
    currKey: keyof RecognizerState;
    convertCurrent?: (n: any) => any;
    initialState: TaskProgressState & RecognizerState;
}

interface Result {
    target: number;
    success?: boolean;
    start: Date;
    stop?: Date;
}

interface TaskProgressState {
    isCorrect: boolean; // If current note is correct
    results: Result[];
    currTarget: number;
    nextTarget: number;
}

export function getTaskProgressInitialState<RecognizerState>(
    initialTarget: number,
    emptyState: RecognizerState
): TaskProgressState & RecognizerState {
    return {
        ...emptyState,
        isCorrect: false,
        results: [
            {
                target: initialTarget,
                start: new Date()
            }
        ],
        currTarget: initialTarget,
        nextTarget: initialTarget
    };
}

export function taskProgress<RecognizerState extends { isDone: boolean }>({
    targets,
    currKey,
    convertCurrent,
    initialState
}: Props<RecognizerState>) {
    return (source$: Observable<RecognizerState>): Observable<TaskProgressState & RecognizerState> => {
        return source$.pipe(
            scan<RecognizerState, TaskProgressState & RecognizerState>((state, curr) => {
                const currTarget = curr.isDone && state.isDone ? state.currTarget : state.nextTarget;
                let nextTarget = state.nextTarget;
                const isCorrect = (convertCurrent ? convertCurrent(curr[currKey]) : curr[currKey]) === currTarget;

                const results: Result[] = [...state.results];
                if (curr.isDone && !state.isDone) {
                    nextTarget = targets[results.length % targets.length];
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
                    currTarget,
                    nextTarget
                };
            }, initialState)
        );
    };
}
