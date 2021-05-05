import React from 'react';
import { StudySingTask, StudyTask, StudyTaskType } from './studyTasks';
import MessagePage from '../tasks/message/MessagePage';
import { useHistory } from 'react-router-dom';
import { DASHBOARD_ROUTE, SIGNIN_ROUTE } from '../../routes';
import SingTasks from '../tasks/sing/SingTasks';
import Calibration from '../tasks/calibration/Calibration';
import Form from '../tasks/form/Form';
import { from } from 'rxjs';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytes } from 'firebase/storage';
import { currUser$ } from '../auth/observableUser';
import { mergeMap, timeout } from 'rxjs/operators';
import { studyId } from './studyProps/studyId';
import ProgressBar from './progress/ProgressBar';
import { SingTaskResult } from '../../utils/rxjs/taskProgress';
import { TaskTarget } from '../tasks/sing/target';
import HeadphoneMessagePage from '../tasks/message/HeadphoneMessagePage';
import VideoPage from '../tasks/video/VideoPage';
import RecordPage from '../tasks/record/RecordPage';

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
    const [progress, setProgress] = React.useState(0);

    // These callbacks should not trigger refreshes of the child components, so we need to useCallback
    const onComplete = React.useCallback(
        (details: any) => {
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
            setProgress(((taskIdx + 2) / (tasks.length + 1)) * 100);
            setTaskIdx(taskIdx + 1);
            setResults(newResults);
        },
        [id, results, taskIdx, tasks]
    );

    const recordOnComplete = React.useCallback(
        (blob: Blob) => {
            const user = getAuth().currentUser;
            const storage = getStorage();
            if (user) {
                const path = `users/${user.uid}/study-${id}/${tasks[taskIdx].id}.mp3`;
                const docRef = ref(storage, path);
                uploadBytes(docRef, blob).then(() => onComplete(path));
            }
        },
        [onComplete, id, taskIdx, tasks]
    );

    const singOnComplete = React.useCallback(
        (results: SingTaskResult<TaskTarget>[]) => {
            const task = tasks[taskIdx] as StudySingTask;
            if (results.length >= task.props.targets.length) onComplete(results);
            else {
                const done = results.length / task.props.targets.length;
                setProgress(((taskIdx + 1 + done) / (tasks.length + 1)) * 100);
            }
        },
        [tasks, taskIdx, onComplete]
    );

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

    let page;

    if (taskIdx === -1) {
        const text = isLoading
            ? 'The study is loading...'
            : startIdx === 0
            ? 'Click "Next" to start the study'
            : 'Click "Next" to resume the study';
        page = (
            <MessagePage
                header={name}
                text={text}
                isLoading={isLoading}
                onComplete={() => {
                    setTaskIdx(startIdx);
                    setProgress(((startIdx + 1) / (tasks.length + 1)) * 100);
                }}
            />
        );
    } else if (taskIdx >= tasks.length) {
        page = (
            <MessagePage
                header="All done!"
                text={`You've completed the study! Click "Next" to return to the dashboard`}
                isLoading={isLoading}
                onComplete={() => history.push(DASHBOARD_ROUTE)}
            />
        );
    } else {
        const task = tasks[taskIdx];
        switch (task.type) {
            case StudyTaskType.SING:
                page = <SingTasks {...task.props} onComplete={singOnComplete} />;
                break;
            case StudyTaskType.CALIBRATE:
                page = <Calibration onComplete={onComplete} />;
                break;
            case StudyTaskType.FORM:
                page = <Form {...task.props} onComplete={onComplete} />;
                break;
            case StudyTaskType.MESSAGE:
                page = <MessagePage {...task.props} onComplete={() => onComplete('confirmed')} />;
                break;
            case StudyTaskType.HEADPHONE_MESSAGE:
                page = <HeadphoneMessagePage {...task.props} onComplete={() => onComplete('confirmed')} />;
                break;
            case StudyTaskType.VIDEO:
                page = <VideoPage {...task.props} onComplete={() => onComplete('confirmed')} />;
                break;
            case StudyTaskType.RECORD:
                page = <RecordPage {...task.props} onComplete={recordOnComplete} />;
                break;
        }
    }

    return (
        <>
            {page}
            <ProgressBar progress={progress} />
        </>
    );
};

export default Study;
