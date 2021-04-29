import { SingTaskProps } from '../tasks/possibleTasks';
import { FormProps } from '../form/Form';
import { MessageProps } from '../message/MessagePage';

export enum StudyTaskType {
    SING = 'SING',
    FORM = 'FORM',
    CALIBRATE = 'CALIBRATE',
    MESSAGE = 'MESSAGE'
}

interface TaskBase {
    id: string;
}

interface StudySingTask extends TaskBase {
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

export type StudyTask = StudySingTask | StudyFormTask | StudyCalibrateTask | StudyMessageTask;
