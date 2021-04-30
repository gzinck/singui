import React from 'react';
import { StudyTask, StudyTaskType } from './studyTasks';
import MessagePage from '../message/MessagePage';
import { useHistory } from 'react-router-dom';
import { DASHBOARD_ROUTE, SIGNIN_ROUTE } from '../../routes';
import SingTasks from '../tasks/SingTasks';
import Calibration from '../tasks/calibration/Calibration';
import Form from '../form/Form';
import { from } from 'rxjs';
import { doc, getFirestore, setDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { currUser$ } from '../auth/observableUser';
import { mergeMap, timeout } from 'rxjs/operators';
import { studyId } from './studyProps/studyId';

export interface StudyProps {
    tasks: StudyTask[];
    name: string;
    id: studyId;
    dependencies: studyId[];
    description: string;
    time: number;
}

const Study = ({ tasks, name, id }: StudyProps): React.ReactElement<StudyProps> => {
    const history = useHistory();
    const [taskIdx, setTaskIdx] = React.useState(-1);
    const [results, setResults] = React.useState<Record<number, {}>>({});

    const onComplete = (details: any) => {
        const user = getAuth().currentUser;
        const db = getFirestore();

        const type = tasks[taskIdx].type;
        // Send results to database
        const newResults = { ...results, [taskIdx]: { type, id, details, doneAt: new Date() } };
        const isDone = taskIdx === tasks.length - 1;
        const nextIdx = taskIdx + 1;
        if (user) {
            from(setDoc(doc(db, 'users', user.uid, 'studies', id), { isDone, nextIdx, results: newResults })).subscribe({
                error: (err) => console.error('Critical error saving to database:', err)
            });
        }
        // Move to next task
        setTaskIdx(taskIdx + 1);
        setResults(newResults);
    };

    // Get our starting point by reading the past study results
    const [isLoading, setIsLoading] = React.useState(true);
    const [startIdx, setStartIdx] = React.useState(0);

    React.useEffect(() => {
        const db = getFirestore();

        // Clean things up
        setTaskIdx(-1);
        setResults({});
        setIsLoading(true);

        // Get the study progress first
        const sub = currUser$
            .pipe(
                timeout(1000),
                mergeMap((user) => getDoc(doc(db, 'users', user.uid, 'studies', id)))
            )
            .subscribe({
                next: (doc) => {
                    setIsLoading(false);
                    if (doc.exists()) {
                        const data = doc.data();
                        setResults(data.results);
                        setStartIdx(data.nextIdx);
                    }
                },
                error: (err) => {
                    if (err.name === 'TimeoutError') history.push(`${SIGNIN_ROUTE}?next=${history.location.pathname}`);
                    else console.error('Critical error retrieving data from database:', err);
                }
            });
        return () => sub.unsubscribe();
    }, [id, history]);

    if (taskIdx === -1) {
        const text = isLoading
            ? 'The study is loading...'
            : startIdx === 0
            ? 'Click "Next" to start the study'
            : 'Click "Next" to resume the study';
        return <MessagePage header={name} text={text} isLoading={isLoading} onComplete={() => setTaskIdx(startIdx)} />;
    }

    if (taskIdx >= tasks.length) {
        return (
            <MessagePage
                header="All done!"
                text={`You've completed the study! Click "Next" to return to the dashboard`}
                isLoading={isLoading}
                onComplete={() => history.push(DASHBOARD_ROUTE)}
            />
        );
    }

    const task = tasks[taskIdx];
    switch (task.type) {
        case StudyTaskType.SING:
            return <SingTasks {...task.props} onComplete={onComplete} />;
        case StudyTaskType.CALIBRATE:
            return <Calibration onComplete={onComplete} />;
        case StudyTaskType.MESSAGE:
            return <MessagePage {...task.props} onComplete={() => onComplete('confirmed')} />;
        case StudyTaskType.FORM:
            return <Form {...task.props} onComplete={onComplete} />;
    }
};

export default Study;
