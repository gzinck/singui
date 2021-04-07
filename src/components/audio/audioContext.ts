import { fromEvent } from 'rxjs';
import { map, shareReplay, take } from 'rxjs/operators';

// Get a single AudioContext for our entire application. We use subscriptions to make
// sure it loads properly.
export const context$ = fromEvent(document, 'DOMContentLoaded').pipe(
    take(1),
    map(() => new window.AudioContext()),
    shareReplay(1)
);
