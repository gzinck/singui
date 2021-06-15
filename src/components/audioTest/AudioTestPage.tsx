import React from 'react';
import Page from '../page/Page';
import ButtonBox from '../common/ButtonBox';
import Button from '@material-ui/core/Button';
import { useSinging } from '../tasks/sing/useSinging';
import { pitchTaskProps } from '../tasks/sing/possibleTasks';
import { SingTaskResult, TaskProgressState } from '../../utils/rxjs/taskProgress';
import { notesToTestAudio } from './constants';
import { PitchTaskTarget, TaskTarget } from '../tasks/sing/target';
import { TaskType, UniversalRecognizerState } from '../../utils/rxjs/recognizers/universalRecognizer';
import TargetBox from '../tasks/sing/progressIndicators/TargetBox';
import PitchIndicatorFromState from '../tasks/sing/PitchIndicatorFromState';
import SuccessBar from '../tasks/sing/progressIndicators/SuccessBar';
import { convertNoteToString } from '../../utils/pitchConverter';
import { timer } from 'rxjs';
import { AUDIO_TEST_PHONE_ROUTE } from '../../routes';
import QRCode from './QRCode';

interface Props {
    onComplete: () => void;
}

const targets = notesToTestAudio.map<PitchTaskTarget>((value) => ({ type: TaskType.PITCH, value }));

const suggestedFixes = [
    'If the phone is not producing any sound, try increasing the volume, refreshing the page, and pressing the button again.',
    'If this page is not responding to any sound, make sure you are using Chrome on your desktop and try refreshing the page.',
    'Make sure you are wearing headphones in a quiet room.',
    'If you are still having difficulties, move to a quieter room, turn off fans, and increase the volume of your phone'
];

const stateToMessage = (state: TaskProgressState<TaskTarget, UniversalRecognizerState>): string => {
    const currNote = convertNoteToString(state.currTarget.value as number);
    if (state.isValid) {
        if (state.isCorrect) return `Wait quietly...`;
        return `The current note is not ${currNote}`;
    }
    return `On your phone, press the button ${currNote}`;
};

enum Status {
    PENDING,
    IN_PROGRESS,
    SUCCESS,
    FAIL
}

const AudioTestPage = ({ onComplete }: Props): React.ReactElement => {
    const [status, setStatus] = React.useState(Status.PENDING);
    const onSing = React.useCallback((results: SingTaskResult<any>[]) => {
        if (!results[results.length - 1].success) setStatus((s) => (s === Status.IN_PROGRESS ? Status.FAIL : s));
        if (results.length === targets.length) setStatus((s) => (s === Status.IN_PROGRESS ? Status.SUCCESS : s));
    }, []);

    const { state, feedback, reset } = useSinging({
        targets,
        octaveDependent: true,
        recognizers: pitchTaskProps.recognizers,
        withPrompts: false,
        hasBackground: false,
        maxAttempts: 1,
        onComplete: onSing
    });

    const [showError, setShowError] = React.useState(false);
    React.useEffect(() => {
        // If state does not change for X seconds, show error
        setShowError(false);
        const sub = timer(10000).subscribe(() => setShowError(true));
        return () => sub.unsubscribe();
    }, [state.results.length, state.isCorrect]);

    const resetTest = () => {
        setStatus(Status.IN_PROGRESS);
        reset();
    };

    let contents, button;
    switch (status) {
        case Status.PENDING:
            contents = (
                <>
                    <h2>Before you begin</h2>
                    <p>Make sure you are in a quiet environment.</p>
                    <p>Wear headphones. Make sure they are connected to your computer and not your phone.</p>
                    <p>On your phone, go to https://vox-sandboxx.web.app{AUDIO_TEST_PHONE_ROUTE} by scanning the QR Code below.</p>
                    <QRCode />
                    <p>Position your phone's speaker close to your computer's mic and turn up the phone's volume.</p>
                </>
            );
            button = (
                <Button variant="contained" color="primary" onClick={resetTest}>
                    Start test
                </Button>
            );
            break;
        case Status.FAIL:
            contents = (
                <>
                    <h2>Test failed</h2>
                    <p>Make sure you press the right button, remain silent, and have a quiet room</p>
                    <p>When you are ready, click the restart button</p>
                </>
            );
            button = (
                <Button variant="contained" color="primary" onClick={resetTest}>
                    Restart test
                </Button>
            );
            break;
        case Status.SUCCESS:
            contents = <h2>Test successful</h2>;
            button = (
                <Button variant="contained" color="primary" onClick={onComplete}>
                    Next
                </Button>
            );
            break;
        default:
            contents = (
                <>
                    <h2>{stateToMessage(state)}</h2>
                    {showError && suggestedFixes.map((fix) => <p key={fix}>{fix}</p>)}
                </>
            );
    }

    return (
        <Page header="Audio Test">
            <TargetBox>{contents}</TargetBox>
            {status === Status.IN_PROGRESS && <PitchIndicatorFromState state={state} />}
            {button && <ButtonBox>{button}</ButtonBox>}
            {status === Status.IN_PROGRESS && <SuccessBar items={feedback} />}
        </Page>
    );
};

export default AudioTestPage;
