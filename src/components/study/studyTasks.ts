import { SingTaskProps } from '../tasks/sing/possibleTasks';
import { FormProps } from '../tasks/form/Form';
import { MessageProps } from '../tasks/message/MessagePage';
import { VideoProps } from '../tasks/video/VideoPage';
import { RecordProps } from '../tasks/record/RecordPage';
import { PerformanceMessageProps } from '../tasks/message/PerformanceMessagePage';

export enum StudyTaskType {
    SING = 'SING',
    FORM = 'FORM',
    CALIBRATE = 'CALIBRATE',
    MESSAGE = 'MESSAGE',
    HEADPHONE_MESSAGE = 'HEADPHONE_MESSAGE',
    PERFORMANCE_MESSAGE = 'PERFORMANCE_MESSAGE',
    VIDEO = 'VIDEO',
    RECORD = 'RECORD'
}

interface TaskBase {
    id: string;
}

export interface StudySingTask extends TaskBase {
    type: StudyTaskType.SING;
    props: SingTaskProps;
}

interface StudyFormTask extends TaskBase {
    type: StudyTaskType.FORM;
    props: FormProps;
}

interface StudyCalibrateTask extends TaskBase {
    type: StudyTaskType.CALIBRATE;
}

interface StudyMessageTask extends TaskBase {
    type: StudyTaskType.MESSAGE;
    props: MessageProps;
}

interface StudyHeadphoneMessageTask extends TaskBase {
    type: StudyTaskType.HEADPHONE_MESSAGE;
    props: MessageProps;
}

interface StudyPerformanceMessageTask extends TaskBase {
    type: StudyTaskType.PERFORMANCE_MESSAGE;
    props: PerformanceMessageProps;
}

interface StudyVideoTask extends TaskBase {
    type: StudyTaskType.VIDEO;
    props: VideoProps;
}

interface StudyRecordTask extends TaskBase {
    type: StudyTaskType.RECORD;
    props: RecordProps;
}

export type StudyTask =
    | StudySingTask
    | StudyFormTask
    | StudyCalibrateTask
    | StudyMessageTask
    | StudyHeadphoneMessageTask
    | StudyPerformanceMessageTask
    | StudyVideoTask
    | StudyRecordTask;
