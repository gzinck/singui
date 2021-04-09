import { VocalState } from '../components/detector/VoiceDetector';

const notes: Record<number, string> = {
    0: 'A',
    1: 'A#',
    2: 'B',
    3: 'C',
    4: 'C#',
    5: 'D',
    6: 'D#',
    7: 'E',
    8: 'F',
    9: 'F#',
    10: 'G',
    11: 'G#'
};

export const convertNoteToString = (noteNum: number, includeOctave: boolean = true): string => {
    const octave = Math.floor(noteNum / 12);
    while (noteNum < 0) noteNum += 12;
    const noteName = notes[noteNum % 12];
    return `${noteName}${includeOctave ? octave : ''}`;
};

const intervals: Record<number, string> = {
    '-1': '⬇',
    0: 'Perfect unison',
    1: 'Minor second',
    2: 'Major second',
    3: 'Minor third',
    4: 'Major third',
    5: 'Perfect fourth',
    6: 'Augmented fourth',
    7: 'Perfect fifth',
    8: 'Minor sixth',
    9: 'Major sixth',
    10: 'Minor seventh',
    11: 'Major seventh',
    12: 'Perfect octave',
    13: '⬆'
};

export const convertIntervalToString = (intervalSize: number): string => {
    const interval = Math.max(-1, Math.min(13, intervalSize));
    return intervals[interval];
};

export interface ReadableVocalState {
    error: number; // between -0.5 and +0.5
    note: string;
    noteNum: number;
    hz: number; // frequency hz
    volume: number;
    time: Date;
}

const a4Frequency = 440;
const multiplier = Math.pow(2, 1 / 12);

export const convertHzToNoteNum = (hz: number): number => Math.log(hz / a4Frequency) / Math.log(multiplier) + 48;

export const convertPitchToReadable = (state: VocalState): ReadableVocalState => {
    const rawNoteNum = convertHzToNoteNum(state.pitch);
    const roundUp = rawNoteNum >= 0 && rawNoteNum % 1 >= 0.5;
    const noteNum = roundUp ? Math.ceil(rawNoteNum) : Math.floor(rawNoteNum);
    return {
        error: roundUp ? -1 + (rawNoteNum % 1) : rawNoteNum % 1,
        note: convertNoteToString(noteNum),
        hz: state.pitch,
        volume: state.volume,
        noteNum,
        time: new Date()
    };
};
