import React from 'react';
import Page from '../page/Page';
import ButtonBox from '../common/ButtonBox';
import Button from '@material-ui/core/Button';
import { useSinging } from '../tasks/sing/useSinging';
import { pitchTaskProps } from '../tasks/sing/possibleTasks';
import { SingTaskResult } from '../../utils/rxjs/taskProgress';
import { notesToTestAudio } from './constants';
import { PitchTaskTarget } from '../tasks/sing/target';
import { TaskType } from '../../utils/rxjs/recognizers/universalRecognizer';
import TargetBox from '../tasks/sing/progressIndicators/TargetBox';
import PitchIndicatorFromState from '../tasks/sing/PitchIndicatorFromState';
import SuccessBar from '../tasks/sing/progressIndicators/SuccessBar';

const targets = notesToTestAudio.map<PitchTaskTarget>((value) => ({ type: TaskType.PITCH, value }));

const AudioTestPage = (): React.ReactElement => {
    const onSing = React.useCallback((results: SingTaskResult<any>[]) => {
        // Do something
    }, []);

    const { state, feedback } = useSinging({
        targets,
        octaveDependent: true,
        recognizers: pitchTaskProps.recognizers,
        withPrompts: false,
        hasBackground: true,
        maxAttempts: 1,
        onComplete: onSing
    });

    return (
        <Page header="Audio Test">
            <TargetBox>
                <h2>{state.results.length > 0 && state.results[state.results.length - 1].success}</h2>
            </TargetBox>
            <PitchIndicatorFromState state={state} />
            <ButtonBox>
                <Button>Restart test</Button>
            </ButtonBox>
            <SuccessBar items={feedback} />
        </Page>
    );
};

export default AudioTestPage;
