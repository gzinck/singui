import { VocalState } from '../../components/detector/VoiceDetector';
import { Observable } from 'rxjs';
import { convertHzToNoteNum } from '../pitchConverter';

export const delayUnlikely = () => (source: Observable<VocalState>): Observable<VocalState> => {
    let lastPitchDone: VocalState | undefined = undefined;
    let prev: VocalState | undefined = undefined;
    let prevDone = true;
    return new Observable((sub) => {
        source.subscribe({
            next: (state) => {
                if (!lastPitchDone || !prev) {
                    lastPitchDone = state;
                    prev = state;
                    prevDone = true;
                    sub.next(state);
                } else if (Math.abs(convertHzToNoteNum(state.pitch) - convertHzToNoteNum(lastPitchDone.pitch)) > 12) {
                    // If we are 12 semitones off, delay this one, unless we already delayed one, in which case undelay it
                    if (prevDone) {
                        prev = state;
                        prevDone = false;
                    } else {
                        lastPitchDone = state;
                        prevDone = true;
                        sub.next(prev);
                        prev = state;
                        sub.next(state);
                    }
                } else {
                    // Otherwise, we are golden! Just keep going.
                    // Note: this might skip the previous delayed item because it was unlikely to be good
                    lastPitchDone = state;
                    prev = state;
                    prevDone = true;
                    sub.next(state);
                }
            }
        });
    });
};
