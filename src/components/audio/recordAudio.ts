// @ts-ignore
import MicRecorder from 'mic-recorder-to-mp3';
import { from, Observable, timer } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';

const recorder = new MicRecorder({ bitRate: 128 });

// time should be in ms
const recordAudio = (time: number): Observable<Blob> => {
    return from(recorder.start()).pipe(
        concatMap(() => timer(time)),
        concatMap<number, [any, Blob]>(() => recorder.stop().getMp3()),
        map(([_, blob]: [any, Blob]) => blob)
    );
};

export default recordAudio;
