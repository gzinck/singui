import { VocalState } from '../../components/detector/VoiceDetector';
import { Observable } from 'rxjs';
import { convertHzToNoteNum, convertPitchToReadable, ReadableVocalState } from '../pitchConverter';
import { filter, map, scan } from 'rxjs/operators';

interface Options {
    pitchWeight?: number;
    minClarity?: number;
    minVolume?: number;
}

export const smoothPitch: (options?: Options) => (source: Observable<VocalState>) => Observable<ReadableVocalState> = (
    opts: Options = {}
) => (source) => {
    const options = {
        pitchWeight: 0.65,
        minClarity: 0.95,
        minVolume: 2,
        ...opts
    };

    return source.pipe(
        filter((state) => convertHzToNoteNum(state.pitch) >= 0 && state.clarity >= options.minClarity && state.volume >= options.minVolume),
        scan(
            (state, curr) => {
                return {
                    ...curr,
                    pitch: state.pitch === 0 ? curr.pitch : curr.pitch * options.pitchWeight + state.pitch * (1 - options.pitchWeight),
                    time: new Date()
                };
            },
            {
                pitch: 0,
                clarity: 0,
                volume: 0,
                time: new Date(0)
            }
        ),
        map((state) => convertPitchToReadable(state))
    );
};
