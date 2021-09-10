import React from 'react';
import { TaskTarget } from '../target';
import { RecognizerMap } from '../../../../utils/rxjs/recognizers/universalRecognizer';
import SingTasks from '../SingTasks';
import { useLocation } from 'react-router-dom';
import { defaultSustainLength } from '../../../detector/shared';
import { SingType, useDidSing } from './singCookies';
import FirstTimeSingPage from './FirstTimeSingPage';

interface Props {
    header: string;
    id: SingType;
    targets: TaskTarget[];
    recognizers: RecognizerMap;
}

const RoutedSingTasks = (props: Props): React.ReactElement<Props> => {
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const maxAttempts = +(query.get('maxAttempts') || '1');
    const withPrompts = query.get('withPrompts') === 'true';
    const withInitialPrompts = query.get('withInitialPrompts') === 'true' || (!query.get('withInitialPrompts') && withPrompts);
    const hideFeedback = query.get('hideFeedback') === 'true';
    const hasBackground = query.get('hasBackground') === 'true';
    const sustainLength = +(query.get('sustainLength') || `${defaultSustainLength}`);
    const didSing = useDidSing(props.id);
    return didSing ? (
        <SingTasks
            {...props}
            maxAttempts={maxAttempts}
            withPrompts={withPrompts}
            withInitialPrompts={withInitialPrompts}
            hideFeedback={hideFeedback}
            hasBackground={hasBackground}
            sustainLength={sustainLength}
        />
    ) : (
        <FirstTimeSingPage {...props} />
    );
};

export default RoutedSingTasks;
