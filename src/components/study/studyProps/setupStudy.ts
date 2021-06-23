import { StudyProps } from '../Study';
import { StudyTaskType } from '../studyTasks';
import { FormTypes } from '../../tasks/form/formTypes';
import { studyId } from './studyId';
import { checkboxValidator, numberValidator, radioButtonValidator } from '../../tasks/form/formValidators';

export const setupStudyProps: StudyProps = {
    id: studyId.SETUP_STUDY,
    dependencies: [],
    name: '1. Setup',
    description: 'For collecting demographic information and calibrating the system.',
    time: 5,
    getTasks: () => [
        {
            id: 'demographics',
            type: StudyTaskType.FORM,
            props: {
                title: 'Demographics',
                form: [
                    {
                        type: FormTypes.TEXT_FIELD,
                        id: 'age',
                        header: 'What is your age?',
                        label: 'Age',
                        getError: numberValidator
                    },
                    {
                        type: FormTypes.RADIO,
                        id: 'gender',
                        header: 'What gender do you identify with?',
                        options: ['Male', 'Female', 'Non-binary', 'Other', 'Prefer not to say'],
                        getError: radioButtonValidator
                    },
                    {
                        type: FormTypes.RADIO,
                        id: 'laptop-hours-per-week',
                        header: 'How many hours per week do you use a laptop or desktop?',
                        options: ['0 hours', '<5 hours', '5-10 hours', '10-15 hours', '15-20 hours', '>20 hours'],
                        variant: 'horizontal',
                        getError: radioButtonValidator
                    },
                    {
                        type: FormTypes.CHECKBOX,
                        id: 'laptop-people-within-earshot',
                        header: 'How many people are typically within earshot when you use a laptop or desktop?',
                        options: ['0', '1', '2', '3', '4', '>5'],
                        getError: checkboxValidator
                    },
                    {
                        type: FormTypes.RADIO,
                        id: 'musical-experience-private',
                        header: 'How many years of private musical lessons have you had?',
                        text: 'These include weekly or biweekly vocal or instrument lessons with at most 3 students in the class.',
                        options: ['0 years', '<1 year', '1-2 years', '2-3 years', '3-4 years', '4-5 years', '>5 years'],
                        variant: 'horizontal',
                        getError: radioButtonValidator
                    },
                    {
                        type: FormTypes.RADIO,
                        id: 'musical-experience-group',
                        header: 'How many years of group musical lessons have you had?',
                        text:
                            'These include weekly or biweekly vocal or instrument lessons with 4 or more students in the class. These exclude mandatory grade school classes, but include extracurriculars.',
                        options: ['0 years', '<1 year', '1-2 years', '2-3 years', '3-4 years', '4-5 years', '>5 years'],
                        variant: 'horizontal',
                        getError: radioButtonValidator
                    },
                    {
                        type: FormTypes.RADIO,
                        id: 'singing-tendencies',
                        header: 'How often do you sing?',
                        text: 'This includes informally (while showering, cooking, etc) or formally (practicing, performing).',
                        options: ['Never', 'Once a month', 'Biweekly', 'Weekly', 'Every other day', 'Daily', 'Multiple times a day'],
                        variant: 'horizontal',
                        getError: radioButtonValidator
                    }
                ]
            }
        },
        {
            id: 'calibrate',
            type: StudyTaskType.CALIBRATE
        }
    ]
};
