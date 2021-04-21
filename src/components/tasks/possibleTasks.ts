import { Melody } from '../../utils/rxjs/recognizers/melodyRecognizer';
import { RecognizerMap, TaskType } from '../../utils/rxjs/recognizers/universalRecognizer';
import { IntervalTaskTarget, MelodyTaskTarget, PitchTaskTarget, TaskTarget } from './target';

function shuffle<T>(inArr: T[]): T[] {
    const arr = [...inArr];
    let currIdx = arr.length;
    while (--currIdx > 0) {
        const randIdx = Math.floor(Math.random() * (currIdx + 1));
        const temp = arr[currIdx];
        arr[currIdx] = arr[randIdx];
        arr[randIdx] = temp;
    }

    return arr;
}

const mediantMelodies: Melody[] = [
    [0, 3, -4], // 3 - 5 - 1
    [0, 3, 5], // 3 - 5 - 6
    [0, -2, 3], // 3 - 2 - 5
    [0, -4, 0], // 3 - 1 - 3
    [0, 3, 8], // 3 - 5 - 8
    [0, -4, 8], // 3 - 1 - 8
    [0, -4, -2], // 3 - 1 - 2
    [0, 3, 0] // 3 - 5 - 3
].map((intervals, id) => ({ intervals, id: `${id}` }));

interface TaskProps {
    targets: TaskTarget[];
    recognizers: RecognizerMap;
}

export const allTasksProps: TaskProps = {
    targets: shuffle([
        ...mediantMelodies.map<MelodyTaskTarget>((melody) => ({
            type: TaskType.MELODY,
            value: melody.intervals,
            id: melody.id,
            startNote: 4
        })),
        ...[2, 5, 7, 9, 11].map<PitchTaskTarget>((value) => ({ type: TaskType.PITCH, value })),
        ...[2, 4, 5, 7, 9, 11, 12].map<IntervalTaskTarget>((value) => ({ type: TaskType.INTERVAL, value, startNote: 0 }))
    ]),
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

export const pitchTaskProps: TaskProps = {
    targets: shuffle([...[0, 2, 4, 5, 7, 9, 11].map<PitchTaskTarget>((value) => ({ type: TaskType.PITCH, value }))]),
    recognizers: {
        0: { type: TaskType.PITCH },
        1: { type: TaskType.PITCH },
        2: { type: TaskType.PITCH },
        3: { type: TaskType.PITCH },
        4: { type: TaskType.PITCH },
        5: { type: TaskType.PITCH },
        6: { type: TaskType.PITCH },
        7: { type: TaskType.PITCH },
        8: { type: TaskType.PITCH },
        9: { type: TaskType.PITCH },
        10: { type: TaskType.PITCH },
        11: { type: TaskType.PITCH }
    }
};

export const intervalTaskProps: TaskProps = {
    targets: shuffle([...[2, 4, 5, 7, 9, 11, 12].map<IntervalTaskTarget>((value) => ({ type: TaskType.INTERVAL, value, startNote: 0 }))]),
    recognizers: {
        0: { type: TaskType.INTERVAL },
        1: { type: undefined },
        2: { type: undefined },
        3: { type: undefined },
        4: { type: undefined },
        5: { type: undefined },
        6: { type: undefined },
        7: { type: undefined },
        8: { type: undefined },
        9: { type: undefined },
        10: { type: undefined },
        11: { type: undefined }
    }
};

const tonicMelodies: Melody[] = [
    [0, 4, 2],
    [0, 4, 7],
    [0, 7, 4],
    [0, 7, 12],
    [0, 2, 4],
    [0, 5, 0],
    [0, 7, 0],
    [0, 12, 7]
].map((intervals, id) => ({ intervals, id: `${id}` }));

export const melodyTaskProps: TaskProps = {
    targets: shuffle([
        ...tonicMelodies.map<MelodyTaskTarget>((melody) => ({
            type: TaskType.MELODY,
            value: melody.intervals,
            id: melody.id,
            startNote: 0
        }))
    ]),
    recognizers: {
        0: { type: TaskType.MELODY, melodies: tonicMelodies },
        1: { type: undefined },
        2: { type: undefined },
        3: { type: undefined },
        4: { type: undefined },
        5: { type: undefined },
        6: { type: undefined },
        7: { type: undefined },
        8: { type: undefined },
        9: { type: undefined },
        10: { type: undefined },
        11: { type: undefined }
    }
};
