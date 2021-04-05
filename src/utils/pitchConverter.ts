import { VocalState } from './VoiceDetector';

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

export interface ReadableVocalState {
    error: number; // between -0.5 and +0.5
    note: string;
    noteNum: number;
    time: Date;
}

const memoryLength = 500;
const a4Frequency = 440;
const multiplier = Math.pow(2, 1 / 12);

export const convertPitchToReadable = (state: VocalState, lastResult?: ReadableVocalState): ReadableVocalState | null => {
    const rawNoteNum = Math.log(state.pitch / a4Frequency) / Math.log(multiplier) + 48;
    // Use last result if this one is poor
    if (state.clarity < 0.95 || rawNoteNum < 0) {
        if (lastResult && new Date().getMilliseconds() - lastResult.time.getMilliseconds() < memoryLength) {
            return lastResult;
        }
        return null;
    }

    // Otherwise, get the note
    const roundUp = rawNoteNum >= 0 && rawNoteNum % 1 >= 0.5;
    const noteNum = roundUp ? Math.ceil(rawNoteNum) : Math.floor(rawNoteNum);
    return {
        error: roundUp ? -1 + (rawNoteNum % 1) : rawNoteNum % 1,
        note: convertNoteToString(noteNum),
        noteNum,
        time: new Date()
    };
};
