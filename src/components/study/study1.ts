import { StudyProps } from './Study';
import { StudyTaskType } from './studyTasks';

export const study1Props: StudyProps = {
    studyID: 'pitch-tasks-05-01',
    studyName: 'Son-of-a-pitch study',
    tasks: [
        {
            id: 'calibrate',
            type: StudyTaskType.CALIBRATE
        }
    ]
};
