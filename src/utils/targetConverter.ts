// Gets the string representing the currently recognized interaction
import { TaskType, UniversalRecognizerState } from './rxjs/recognizers/universalRecognizer';
import { convertNoteToString } from './pitchConverter';
import { TaskTarget } from '../components/tasks/sing/target';

export const getCurrentStringForState = (state: UniversalRecognizerState, includeOctave = true): string => {
    switch (state.type) {
        case TaskType.PITCH:
            return convertNoteToString(state.noteAbs, includeOctave);
        case TaskType.INTERVAL:
            return `${convertNoteToString(state.startNote, includeOctave)}–${convertNoteToString(state.noteAbs, includeOctave)}`;
        case TaskType.MELODY:
            return state.melodies[0].intervals.reduce((acc, next) => {
                const note = convertNoteToString(next + state.startNote, includeOctave);
                return acc.length > 0 ? `${acc}–${note}` : note;
            }, '');
    }
};

export const getStringForTarget = (target: TaskTarget, key: number, includeOctave = true): string => {
    const adjust = (n: number) => n + key;
    switch (target.type) {
        case TaskType.PITCH:
            return convertNoteToString(adjust(target.value), includeOctave);
        case TaskType.INTERVAL:
            return `${convertNoteToString(adjust(target.startNote), includeOctave)}–${convertNoteToString(
                adjust(target.value),
                includeOctave
            )}`;
        case TaskType.MELODY:
            return target.value.reduce((acc, next) => {
                const note = convertNoteToString(adjust(next + target.startNote), includeOctave);
                return acc.length > 0 ? `${acc}–${note}` : note;
            }, '');
    }
};
