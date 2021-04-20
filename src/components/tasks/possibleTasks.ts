import { Melody } from '../../utils/rxjs/recognizers/melodyRecognizer';
import { RecognizerMap, TaskType } from '../../utils/rxjs/recognizers/universalRecognizer';
import { IntervalTaskTarget, MelodyTaskTarget, PitchTaskTarget, TaskTarget } from './target';

const mediantMelodies: Melody[] = [
    [0, 3, 1], // 3 - 5 - 4
    [0, 3, 5], // 3 - 5 - 6
    [0, -2, 3], // 3 - 2 - 5
    [0, -4, 0], // 3 - 1 - 3
    [0, 3, 8], // 3 - 5 - 8
    [0, -4, 8], // 3 - 1 - 8
    [0, -4, -2], // 3 - 1 - 2
    [0, 3, 0] // 3 - 5 - 3
].map((intervals, id) => ({ intervals, id: `${id}` }));

export const allTasksProps: { targets: TaskTarget[]; recognizers: RecognizerMap } = {
    targets: [
        ...mediantMelodies.map<MelodyTaskTarget>((melody) => ({
            type: TaskType.MELODY,
            value: melody.intervals,
            id: melody.id,
            startNote: 4
        })),
        ...[2, 5, 7, 9, 11].map<PitchTaskTarget>((value) => ({ type: TaskType.PITCH, value })),
        ...[2, 4, 5, 7, 9, 11, 12].map<IntervalTaskTarget>((value) => ({ type: TaskType.INTERVAL, value, startNote: 0 }))
    ],
    recognizers: {
        0: { type: TaskType.INTERVAL },
        1: { type: TaskType.PITCH },
        2: { type: TaskType.PITCH },
        3: { type: TaskType.PITCH },
        4: { type: TaskType.MELODY, melodies: mediantMelodies },
        5: { type: TaskType.PITCH },
        6: { type: TaskType.PITCH },
        7: { type: TaskType.PITCH },
        8: { type: TaskType.PITCH },
        9: { type: TaskType.PITCH },
        10: { type: TaskType.PITCH },
        11: { type: TaskType.PITCH }
    }
};
