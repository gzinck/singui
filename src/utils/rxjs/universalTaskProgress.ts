import { Observable } from 'rxjs';
import { TaskType, UniversalRecognizerState } from './recognizers/universalRecognizer';
import { MelodyTaskTarget, TaskTarget } from '../../components/tasks/target';
import { getTaskProgressInitialState, taskProgress, TaskProgressState } from './taskProgress';
import { pitchRecognizerInitialState } from './recognizers/pitchRecognizer';
import { mod12 } from '../math';
import { MelodyRecognizerState, MelodyState } from './recognizers/melodyRecognizer';

interface Props {
    targets: TaskTarget[];
    keyNumber: number;
}

const getTargetMelody = (state: MelodyRecognizerState, id: string): MelodyState => {
    // Ignore when it's undefined; we assume that never happens
    return state.melodies.find((melody) => melody.id === id) as MelodyState;
};

const getNextNote = (state: TaskProgressState<TaskTarget, UniversalRecognizerState>, keyNumber: number): number | undefined => {
    if (state.type === TaskType.PITCH || state.nextTarget !== state.currTarget) {
        // It should be the first item of the nextTarget
        switch (state.nextTarget.type) {
            case TaskType.PITCH:
                return state.nextTarget.value;
            case TaskType.INTERVAL:
                return state.nextTarget.startNote;
            case TaskType.MELODY:
                return state.nextTarget.startNote;
        }
    }

    switch (state.currTarget.type) {
        case TaskType.PITCH:
            return state.currTarget.value;
        case TaskType.INTERVAL:
            if (state.type !== TaskType.INTERVAL) return; // won't happen
            return mod12(state.startNote - keyNumber) === state.currTarget.startNote
                ? state.currTarget.startNote + state.currTarget.value
                : undefined;
        case TaskType.MELODY:
            // If we're not at the right melody, return
            if (state.type !== TaskType.MELODY || mod12(state.startNote - keyNumber) !== state.currTarget.startNote) return;
            const intervals = getTargetMelody(state, (state.currTarget as MelodyTaskTarget).id).intervals;

            return (
                (intervals.find((interval) => interval.duration === 0) || intervals[intervals.length - 1]).interval +
                state.currTarget.startNote
            );
    }
};

export const getUniversalTaskProgressInitialState = (target: TaskTarget): TaskProgressState<TaskTarget, UniversalRecognizerState> => {
    let initialTarget = 0;
    switch (target.type) {
        case TaskType.PITCH:
            initialTarget = target.value;
            break;
        case TaskType.INTERVAL:
            initialTarget = target.startNote;
            break;
        case TaskType.MELODY:
            initialTarget = target.startNote;
            break;
    }
    return getTaskProgressInitialState(
        target,
        {
            ...pitchRecognizerInitialState,
            type: TaskType.PITCH,
            inProgress: false
        },
        initialTarget
    );
};

export const universalTaskProgress = ({ targets, keyNumber }: Props) => (
    source$: Observable<UniversalRecognizerState>
): Observable<TaskProgressState<TaskTarget, UniversalRecognizerState>> => {
    return source$.pipe(
        taskProgress<UniversalRecognizerState, TaskTarget>({
            targets,
            checkCorrect: (state, target) => {
                if (target.type !== state.type) return false;
                switch (state.type) {
                    case TaskType.PITCH:
                        return target.value === state.note;
                    case TaskType.INTERVAL:
                        return target.value === state.interval;
                    case TaskType.MELODY:
                        return (target as MelodyTaskTarget).id === state.melodies[0].id;
                }
            },
            initialState: getUniversalTaskProgressInitialState(targets[0]),
            getNextNote: (state) => getNextNote(state, keyNumber)
        })
    );
};
