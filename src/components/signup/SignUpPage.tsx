import React from 'react';
import ConsentPage from './ConsentPage';
import AudioTestPage from '../audioTest/AudioTestPage';
import MessagePage from '../tasks/message/MessagePage';
import LoginPage from '../auth/LoginPage';
import ProgressBar from '../study/progress/ProgressBar';
import { SingTaskResult } from '../../utils/rxjs/taskProgress';
import { TaskTarget } from '../tasks/sing/target';
import { setSetupData } from '../../utils/clients/setupClient';
import { useHistory } from 'react-router-dom';
import { DASHBOARD_ROUTE } from '../../routes';

const maxStage = 4;

const SignUpPage = (): React.ReactElement => {
    const history = useHistory();
    const [stage, setStage] = React.useState(0);
    const [audioTest, setAudioTest] = React.useState<SingTaskResult<TaskTarget>[]>([]);
    const [consent, setConsent] = React.useState<Record<string, string | string[]>>({});

    const onComplete = () => {
        // First, submit the new user consent record
        setSetupData({ audioTest, consent }).subscribe({ complete: () => history.push(DASHBOARD_ROUTE) });
    };

    let page;
    switch (stage) {
        case 0:
            page = (
                <MessagePage
                    header="Sign Up"
                    text="In the following three steps, you will perform a one-minute system test, sign a consent form, and create your user credentials."
                    onComplete={() => setStage((s) => s + 1)}
                />
            );
            break;
        case 1:
            page = (
                <AudioTestPage
                    onComplete={(data) => {
                        setAudioTest(data);
                        setStage((s) => s + 1);
                    }}
                />
            );
            break;
        case 2:
            page = (
                <ConsentPage
                    onComplete={(answers) => {
                        setConsent(answers);
                        setStage((s) => s + 1);
                    }}
                />
            );
            break;
        default:
            page = <LoginPage userExists={false} onComplete={onComplete} />;
    }
    return (
        <>
            {page}
            <ProgressBar progress={(stage / maxStage) * 100} />
        </>
    );
};

export default SignUpPage;
