import React from 'react';
import { StudyTask, StudyTaskType } from './studyTasks';
import MessagePage from '../message/MessagePage';
import { useHistory } from 'react-router-dom';
import { DASHBOARD_ROUTE } from '../../routes';
import AllTasks from '../tasks/AllTasks';
import Calibration from '../tasks/calibration/Calibration';
import Form from '../form/Form';
import { timer } from 'rxjs';

export interface StudyProps {
    tasks: StudyTask[];
    studyName: string;
    studyID: string;
}

const Study = ({ tasks, studyName, studyID }: StudyProps): React.ReactElement<StudyProps> => {
    const history = useHistory();
    const [taskIdx, setTaskIdx] = React.useState(-1);
    const [results, setResults] = React.useState<Record<number, {}>>({});

    const onComplete = (result: any) => {
        const type = tasks[taskIdx].type;
        // TODO: send results to the database
        setResults({ ...results, [taskIdx]: { type, result, done: true, doneAt: new Date() } });
        setTaskIdx(taskIdx + 1);
    };

    // Get our starting point by reading the past study results
    const [isLoading, setIsLoading] = React.useState(true);
    const [startIdx, setStartIdx] = React.useState(0);

    React.useEffect(() => {
        // Clean things up
        setTaskIdx(-1);
        setResults({});

        console.log('Starting');
        // TODO: query the database regarding progress
        const sub = timer(1000).subscribe(() => {
            console.log('WOOOOO');
            setIsLoading(false);
            setStartIdx(0);
            setResults({});
        });
        return () => sub.unsubscribe();
    }, [studyID]);

    if (taskIdx === -1) {
        const text = isLoading
            ? 'The study is loading...'
            : startIdx === 0
            ? 'Click "Next" to start the study'
            : 'Click "Next" to resume the study';
        return <MessagePage header={studyName} text={text} isLoading={isLoading} onComplete={() => setTaskIdx(startIdx)} />;
    }

    if (taskIdx >= tasks.length) {
        return (
            <MessagePage
                header="All done!"
                text={`You've completed the study! Click "Next" to return to the dasboard`}
                isLoading={isLoading}
                onComplete={() => history.push(DASHBOARD_ROUTE)}
            />
        );
    }

    const task = tasks[taskIdx];
    switch (task.type) {
        case StudyTaskType.SING:
            return <AllTasks {...task.props} />;
        case StudyTaskType.CALIBRATE:
            return <Calibration onComplete={onComplete} />;
        case StudyTaskType.MESSAGE:
            return <MessagePage {...task.props} onComplete={() => onComplete('confirmed')} />;
        case StudyTaskType.FORM:
            return <Form {...task.props} onComplete={onComplete} />;
    }
};

export default Study;
