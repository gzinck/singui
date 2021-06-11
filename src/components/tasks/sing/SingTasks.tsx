import React from 'react';
import { SingTaskResult, TaskProgressState } from '../../../utils/rxjs/taskProgress';
import { sustainLength$ } from '../../detector/shared';
import { smoothPitch } from '../../../utils/rxjs/smoothPitch';
import useAudio from '../../audio/useAudio';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../../theme';
import {
    RecognizerMap,
    TaskType,
    universalRecognizer,
    UniversalRecognizerState
} from '../../../utils/rxjs/recognizers/universalRecognizer';
import { TaskTarget } from './target';
import { getUniversalTaskProgressInitialState, universalTaskProgress } from '../../../utils/rxjs/universalTaskProgress';
import { convertNoteToString } from '../../../utils/pitchConverter';
import TargetBox from './progressIndicators/TargetBox';
import VoiceDetector from '../../detector/VoiceDetector';
import { audioContext } from '../../audio/audioContext';
import useSustainLength from '../../audio/useSustainLength';
import { useAudioCache } from '../../audio/useAudioCache';
import useTonic from '../../audio/useTonic';
import SuccessBar from './progressIndicators/SuccessBar';
import Page from '../../page/Page';
import CircularPitchMeter, { noteNamesFrom } from './progressIndicators/CircularPitchMeter';
import clsx from 'clsx';

interface Props {
    header: string;
    targets: TaskTarget[];
    recognizers: RecognizerMap;
    withPrompts?: boolean;
    maxAttempts: number;
    hideFeedback?: boolean;
    // Called every time a task is completed
    onComplete?: (results: SingTaskResult<TaskTarget>[]) => void;
}

const useStyles = makeStyles<Theme>(() => ({
    root: {
        width: '100%',
        position: 'relative',
        height: 'calc(100vh - 8rem)'
    },
    target: {
        maxWidth: '30rem',
        margin: '0 max(1rem, calc(50% - 15rem))'
    },
    pitchPopup: {
        margin: '1rem calc(50% - 8.5rem)',
        opacity: 0,
        transition: 'opacity 0.2s'
    },
    visible: {
        opacity: 1
    }
}));

// Gets the string representing the currently recognized interaction
const getCurrentString = (state: UniversalRecognizerState, includeOctave = true): string => {
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

const getTargetString = (target: TaskTarget, key: number, includeOctave = true): string => {
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

const SingTasks = ({
    header,
    targets,
    recognizers,
    withPrompts,
    maxAttempts,
    onComplete,
    hideFeedback
}: Props): React.ReactElement<Props> => {
    const [feedback, setFeedback] = React.useState<boolean[]>([]);
    const [tonic] = useTonic();
    const octave = Math.floor(tonic / 12);
    const keyNumber = tonic % 12;

    const noteLabels = React.useMemo(() => noteNamesFrom(keyNumber), [keyNumber]);

    const classes = useStyles();
    const ctx = React.useContext(audioContext);
    const [sustainLength] = useSustainLength();
    const [state, setState] = React.useState<TaskProgressState<TaskTarget, UniversalRecognizerState>>(
        getUniversalTaskProgressInitialState(targets[0])
    );
    useAudioCache({ keyNumber, octave, targets });
    const { play } = useAudio({ keyNumber, hasBackground: true });

    React.useEffect(() => {
        if (keyNumber === 0 && octave === 0) return;

        setState(getUniversalTaskProgressInitialState(targets[0]));
        const voiceDetector = new VoiceDetector(ctx.audioContext);
        const sub = voiceDetector
            .getState()
            .pipe(
                smoothPitch(),
                universalRecognizer({ sustainLength$, recognizers, keyNumber }),
                universalTaskProgress({ targets, keyNumber, octave, play: withPrompts ? play : undefined, maxAttempts })
            )
            .subscribe((nextState: TaskProgressState<TaskTarget, UniversalRecognizerState>) => {
                setState(nextState);
                if (nextState.isDone) {
                    setFeedback((feedback) => [...feedback, nextState.isCorrect]);
                    onComplete && onComplete(nextState.results.slice(0, nextState.results.length - 1));
                }
            });

        return () => sub.unsubscribe();
    }, [keyNumber, octave, withPrompts, recognizers, targets, ctx.audioContext, play, maxAttempts, onComplete]);

    console.log(tonic);
    console.log(state);

    return (
        <Page header={header}>
            <div className={classes.root}>
                <div className={classes.target}>
                    <TargetBox height="7rem">
                        <h2>{getTargetString(state.nextTarget, tonic)}</h2>
                    </TargetBox>
                </div>
                <div className={clsx(classes.pitchPopup, (state.type !== TaskType.PITCH || state.progress > 0) && classes.visible)}>
                    <CircularPitchMeter
                        noteLabels={noteLabels}
                        startNum={(state.type === TaskType.INTERVAL ? state.startNote : state.noteAbs) - keyNumber}
                        startError={state.type === TaskType.INTERVAL ? state.startError : state.error}
                        endNum={state.noteAbs - keyNumber}
                        endError={state.error}
                        progress={state.type === TaskType.PITCH ? Math.min(state.progress / sustainLength, 1) : 1}
                        label={getCurrentString(state)}
                    />
                </div>
                {!hideFeedback && <SuccessBar items={feedback} />}
            </div>
        </Page>
    );
};

SingTasks.defaultProps = {
    maxAttempts: 1,
    withPrompts: false
};

export default SingTasks;
