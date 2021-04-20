import { concat, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

interface State {
    isDone: boolean;
    inProgress: boolean;
}

export function finallyDone<S extends State>() {
    return (source$: Observable<S>): Observable<S> => {
        const srcWithReplay$ = source$.pipe(shareReplay(1));
        return concat(
            srcWithReplay$,
            // Take the last replay and convert the isDone
            srcWithReplay$.pipe(map((state) => ({ ...state, isDone: true, inProgress: false })))
        );
    };
}
