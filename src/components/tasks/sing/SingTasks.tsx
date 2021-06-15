import React from 'react';
import { SingTaskResult } from '../../../utils/rxjs/taskProgress';
import { RecognizerMap } from '../../../utils/rxjs/recognizers/universalRecognizer';
import { TaskTarget } from './target';
import TargetBox from './progressIndicators/TargetBox';
import SuccessBar from './progressIndicators/SuccessBar';
import Page from '../../page/Page';
import { useSinging } from './useSinging';
import { getLetterStringForTarget, getNumberStringForTarget } from '../../../utils/targetConverter';
import PitchIndicatorFromState from './progressIndicators/PitchIndicatorFromState';
import useTonic from '../../audio/useTonic';

interface Props {
    header: string;
    targets: TaskTarget[];
    recognizers: RecognizerMap;
    withPrompts?: boolean;
    maxAttempts: number;
    hideFeedback?: boolean;
    hasBackground: boolean;
    numberLabels: boolean;
    // Called every time a task is completed
    onComplete?: (results: SingTaskResult<TaskTarget>[]) => void;
}

const SingTasks = (props: Props): React.ReactElement<Props> => {
    const { state, feedback } = useSinging(props);
    const [tonic] = useTonic();

    return (
        <Page header={props.header}>
            <TargetBox height="7rem">
                <h2>
                    {props.numberLabels ? getNumberStringForTarget(state.nextTarget) : getLetterStringForTarget(state.nextTarget, tonic)}
                </h2>
            </TargetBox>
            <PitchIndicatorFromState state={state} hideable={true} />
            {!props.hideFeedback && <SuccessBar items={feedback} />}
        </Page>
    );
};

SingTasks.defaultProps = {
    maxAttempts: 1,
    withPrompts: false,
    hasBackground: true,
    numberLabels: true
};

export default SingTasks;
