import { Observable } from 'rxjs';
import { TaskType, UniversalRecognizerState } from './recognizers/universalRecognizer';
import { MelodyTaskTarget, TaskTarget } from '../../components/tasks/sing/target';
import { getTaskProgressInitialState, taskProgress, TaskProgressState } from './taskProgress';
import { pitchRecognizerInitialState } from './recognizers/pitchRecognizer';
import { mod12 } from '../math';
import { getAudioURL } from '../../components/audio/getAudioURL';

interface Props {
    targets: TaskTarget[];
    keyNumber: number;
    octave: number;
    play?: (url: string) => void;
    maxAttempts: number;
}

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
            return; // We can't get the next note for most algorithms
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
    return getTaskProgressInitialState<UniversalRecognizerState, TaskTarget>(
        target,
        {
            ...pitchRecognizerInitialState,
            type: TaskType.PITCH,
            isDone: false
        },
        initialTarget
    );
};

export const universalTaskProgress = ({ targets, keyNumber, octave, play, maxAttempts }: Props) => (
    source$: Observable<UniversalRecognizerState>
): Observable<TaskProgressState<TaskTarget, UniversalRecognizerState>> => {
    // Uncomment to play before the start of the first trial
    // if (play) play(getAudioURL({ target: targets[0], keyNumber, octave }));

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
            getNextNote: (state) => getNextNote(state, keyNumber),
            onComplete: (_, target, isRepeated) => {
                // Remove isRepeated logic to play before every note
                if (play && isRepeated) {
                    play(getAudioURL({ target, keyNumber, octave }));
                }
            },
            maxAttempts
        })
    );
};
