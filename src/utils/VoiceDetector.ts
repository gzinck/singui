import { PitchDetector } from 'pitchy';
import { fromEvent, interval, Observable, Subject } from 'rxjs';
import { shareReplay, startWith, take } from 'rxjs/operators';

export interface VocalState {
    pitch: number;
    clarity: number;
}

class VoiceDetector {
    private readonly events$: Subject<VocalState> = new Subject();
    private readonly state$: Observable<VocalState>;
    private audioContext: AudioContext | undefined;
    constructor() {
        this.state$ = this.events$.pipe(startWith({ pitch: 0, clarity: 0 }), shareReplay(1));

        fromEvent(document, 'DOMContentLoaded')
            .pipe(take(1))
            .subscribe(() => {
                const audioContext = new window.AudioContext();
                this.audioContext = audioContext; // separate for type safety reasons
                navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
                    // Build the graph
                    const sourceNode = audioContext.createMediaStreamSource(stream);
                    const analyserNode = audioContext.createAnalyser();
                    analyserNode.fftSize = 4096; // Double the fftSize to smooth it out
                    sourceNode.connect(analyserNode);

                    // For processing the pitch
                    const detector = PitchDetector.forFloat32Array(analyserNode.fftSize);
                    const input = new Float32Array(detector.inputLength);
                    audioContext.resume();

                    // Do this every 100 ms
                    interval(100).subscribe(() => {
                        analyserNode.getFloatTimeDomainData(input);
                        const [pitch, clarity] = detector.findPitch(input, audioContext.sampleRate);
                        this.events$.next({ pitch, clarity });
                    });
                });
            });
    }

    public resume(): void {
        if (this.audioContext) this.audioContext.resume();
    }

    public getState(): Observable<VocalState> {
        return this.state$;
    }
}

export default VoiceDetector;
