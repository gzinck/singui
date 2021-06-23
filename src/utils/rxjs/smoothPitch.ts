import { VocalState } from '../../components/detector/VoiceDetector';
import { Observable } from 'rxjs';
import { convertHzToNoteNum, convertPitchToReadable, ReadableVocalState } from '../pitchConverter';
import { filter, map, scan } from 'rxjs/operators';

interface Options {
    pitchWeight?: number;
    minClarity?: number;
    minVolume?: number;
}

const breakTime = 500;

export const smoothPitch: (options?: Options) => (source$: Observable<VocalState>) => Observable<ReadableVocalState> = (
    opts: Options = {}
) => (source) => {
    const options = {
        pitchWeight: 0.5,
        minClarity: 0.95,
        minVolume: 0,
        ...opts
    };

    return source.pipe(
        filter((state) => convertHzToNoteNum(state.pitch) >= 0 && state.clarity >= options.minClarity && state.volume >= options.minVolume),
        scan(
            (state, curr) => {
                const time = performance.now();
                return {
                    ...curr,
                    // If it's been 500ms since last valid sound, don't do smoothing
                    pitch:
                        time - state.time >= breakTime
                            ? curr.pitch
                            : curr.pitch * options.pitchWeight + state.pitch * (1 - options.pitchWeight),
                    time
                };
            },
            {
                pitch: 0,
                clarity: 0,
                volume: 0,
                time: -breakTime
            }
        ),
        map((state) => convertPitchToReadable(state))
    );
};
