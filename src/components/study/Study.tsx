import React from 'react';
import { StudySingTask, StudyTask, StudyTaskType } from './studyTasks';
import MessagePage from '../tasks/message/MessagePage';
import { useHistory } from 'react-router-dom';
import { DASHBOARD_ROUTE, SIGNIN_ROUTE } from '../../routes';
import SingTasks from '../tasks/sing/SingTasks';
import Calibration from '../tasks/calibration/Calibration';
import Form from '../tasks/form/Form';
import { studyId } from './studyProps/studyId';
import ProgressBar from './progress/ProgressBar';
import { SingTaskResult } from '../../utils/rxjs/taskProgress';
import { TaskTarget } from '../tasks/sing/target';
import HeadphoneMessagePage from '../tasks/message/HeadphoneMessagePage';
import VideoPage from '../tasks/video/VideoPage';
import RecordPage from '../tasks/record/RecordPage';
import PerformanceMessagePage from '../tasks/performance/PerformanceMessagePage';
import { getParticipant } from '../../utils/clients/participantsClient';
import { getStudyStatus, saveAudioFile, setStudyStatus, setStudyTaskResults, StudyResult } from '../../utils/clients/studyClient';

export interface StudyProps {
    getTasks: (latinSquare: number) => StudyTask[];
    name: string;
    id: studyId;
    dependencies: studyId[];
    description: string;
    time: number;
}

const Study = ({ getTasks, name, id }: StudyProps): React.ReactElement<StudyProps> => {
    const history = useHistory();
    const [tasks, setTasks] = React.useState<StudyTask[]>([]);
    const [taskIdx, setTaskIdx] = React.useState(-1);
    const [progress, setProgress] = React.useState(0);

    const onComplete = React.useCallback(
        (details: any) => {
            // Update status of the study
            setStudyStatus(id, {
                isDone: taskIdx === tasks.length - 1,
                nextIdx: taskIdx + 1,
                // Conditionally add the end time fi we reachedd the end
                ...(taskIdx === tasks.length - 1 ? { end: new Date() } : {})
            }).subscribe({
                error: (err) => console.error('Critical error saving study status to database:', err)
            });

            // Send results to database
            const results: StudyResult = {
                type: tasks[taskIdx].type,
                studyId: id,
                taskIdx,
                taskId: tasks[taskIdx].id,
                details,
                doneAt: new Date()
            };
            setStudyTaskResults(id, tasks[taskIdx].id, results).subscribe({
                complete: () => {
                    // Move to next task
                    setProgress(((taskIdx + 2) / (tasks.length + 1)) * 100);
                    setTaskIdx(taskIdx + 1);
                },
                error: (err) => console.error('Critical error saving study task results to database:', err)
            });
        },
        [id, taskIdx, tasks]
    );

    const recordOnComplete = React.useCallback(
        (blob: Blob) => {
            saveAudioFile(id, tasks[taskIdx].id, blob).subscribe((result) => onComplete(result.metadata.fullPath));
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

    const onError = React.useCallback(
        (err: any) => {
            if (err.name === 'TimeoutError') history.push(`${SIGNIN_ROUTE}?next=${history.location.pathname}`);
            else console.error('Critical error retrieving data from database:', err);
        },
        [history]
    );

    // Get the latin square so we can get the ordered tasks
    React.useEffect(() => {
        setTasks([]);
        const sub = getParticipant().subscribe({
            next: (participant) => setTasks(getTasks(participant.idx)),
            error: onError
        });

        return () => sub.unsubscribe();
    }, [onError, getTasks]);

    // Get our starting point by reading the past study results
    const [isLoading, setIsLoading] = React.useState(true);
    const [startIdx, setStartIdx] = React.useState(0);

    // Get the study progress
    React.useEffect(() => {
        setTaskIdx(-1);
        setIsLoading(true);

        const sub = getStudyStatus(id).subscribe({
            next: (data) => {
                setIsLoading(false);
                if (data) {
                    setStartIdx(data.nextIdx);
                }
            },
            error: onError
        });

        return () => sub.unsubscribe();
    }, [id, onError]);

    let page;

    if (taskIdx === -1) {
        const text =
            isLoading || tasks.length === 0
                ? 'The study is loading...'
                : startIdx === 0
                ? 'Click "Next" to start the study'
                : 'Click "Next" to resume the study';
        page = (
            <MessagePage
                header={name}
                text={text}
                isLoading={isLoading || tasks.length === 0}
                onComplete={() => {
                    setTaskIdx(startIdx);
                    setProgress(((startIdx + 1) / (tasks.length + 1)) * 100);
                    setStudyStatus(id, {
                        isDone: false,
                        nextIdx: 0,
                        start: new Date()
                    }).subscribe({
                        error: (err) => console.error('Critical error saving study status to database:', err)
                    });
                }}
            />
        );
    } else if (taskIdx >= tasks.length) {
        page = (
            <MessagePage
                header={name}
                title="Tasks complete"
                text={`Congrats! You have completed this set of tasks. Click "Next" to return to the dashboard.`}
                isLoading={isLoading}
                onComplete={() => history.push(DASHBOARD_ROUTE)}
            />
        );
    } else {
        const task = tasks[taskIdx];
        switch (task.type) {
            case StudyTaskType.SING:
                page = <SingTasks {...task.props} header={name} onComplete={singOnComplete} />;
                break;
            case StudyTaskType.CALIBRATE:
                page = <Calibration header={name} onComplete={onComplete} />;
                break;
            case StudyTaskType.FORM:
                page = <Form {...task.props} header={name} onComplete={onComplete} />;
                break;
            case StudyTaskType.MESSAGE:
                page = <MessagePage {...task.props} header={name} onComplete={() => onComplete('confirmed')} />;
                break;
            case StudyTaskType.HEADPHONE_MESSAGE:
                page = <HeadphoneMessagePage {...task.props} header={name} onComplete={() => onComplete('confirmed')} />;
                break;
            case StudyTaskType.PERFORMANCE_MESSAGE:
                page = <PerformanceMessagePage {...task.props} header={name} onComplete={() => onComplete('confirmed')} />;
                break;
            case StudyTaskType.VIDEO:
                page = <VideoPage {...task.props} header={name} onComplete={() => onComplete('confirmed')} />;
                break;
            case StudyTaskType.RECORD:
                page = <RecordPage {...task.props} header={name} onComplete={recordOnComplete} />;
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
