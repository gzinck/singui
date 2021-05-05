import { StudyProps } from '../Study';
import { StudyTaskType } from '../studyTasks';
import { FormTypes } from '../../tasks/form/formTypes';
import { studyId } from './studyId';

const radioButtonValidator = (val: any) => (typeof val === 'string' ? undefined : 'Select a radio button');
// const textFieldValidator = (val: any) => (typeof val === 'string' ? undefined : 'This field is required')
const numberValidator = (val: any) => (typeof val === 'string' && !isNaN(+val) ? undefined : 'Your age should be a number');

export const setupStudyProps: StudyProps = {
    id: studyId.SETUP_STUDY,
    dependencies: [],
    name: 'Setup',
    description: 'For obtaining consent, collecting demographic information, and calibrating the system.',
    time: 10,
    tasks: [
        {
            id: 'msg-consent',
            type: StudyTaskType.MESSAGE,
            props: {
                header: 'Consent',
                text:
                    'Before we get started, we need your consent to collect your data. The big takeaway: your data will be used for academic research purposes only.'
            }
        },
        {
            id: 'consent',
            type: StudyTaskType.FORM,
            props: {
                header: 'Pitch task rating',
                form: [
                    {
                        type: FormTypes.TEXT,
                        id: 'title',
                        header: 'Consent',
                        text:
                            'This is a university-approved consent message about how we will use your data for research purposes only. Note that we collect audio data for select tasks (it will be explicitly indicated) to verify your audio quality.'
                    },
                    {
                        type: FormTypes.CHECKBOX,
                        id: 'consent',
                        header: 'Check the box below to consent to our data collection policy.',
                        options: ['I consent'],
                        getError: (val: any) =>
                            Array.isArray(val) && val.length > 0 ? undefined : 'This checkbox must be selected to continue the study'
                    }
                ]
            }
        },
        {
            id: 'demographics',
            type: StudyTaskType.FORM,
            props: {
                header: 'Demographics',
                form: [
                    {
                        type: FormTypes.TEXT,
                        id: 'title',
                        header: 'Demographics',
                        text: 'Tell us about yourself!'
                    },
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
                        header: 'What gender do you identify with??',
                        options: ['Male', 'Female', 'Non-binary', 'Other', 'Prefer not to say'],
                        getError: radioButtonValidator
                    },
                    {
                        type: FormTypes.TEXT_FIELD,
                        id: 'musicalExperiencePrivate',
                        header: 'How many years of private musical lessons have you had?',
                        text: 'These include weekly or biweekly vocal or instrument lessons with under 5 people in the class.',
                        label: 'Years of private lessons',
                        getError: numberValidator
                    },
                    {
                        type: FormTypes.TEXT_FIELD,
                        id: 'musicalExperienceGroup',
                        header: 'How many years of group musical lessons have you had, outside of K-12 education?',
                        text: 'These include weekly or biweekly vocal or instrument lessons with 5 or more people in the class.',
                        label: 'Years of group lessons',
                        getError: numberValidator
                    },
                    {
                        type: FormTypes.RADIO,
                        id: 'singingTendencies',
                        header: 'How often do you sing?',
                        text: 'This includes informally (while showering, cooking, etc) or formally (practicing, performing).',
                        options: ['Never', 'Once a month', 'Biweekly', 'Weekly', 'Every other day', 'Daily', 'Multiple times a day'],
                        variant: 'horizontal',
                        getError: radioButtonValidator
                    },
                    {
                        type: FormTypes.RADIO,
                        id: 'singingFifth',
                        header: 'Can you sing a perfect fifth interval on demand?',
                        text: 'If you do not understand this question, respond "Not sure".',
                        options: ['Yes', 'No', 'Not sure'],
                        getError: radioButtonValidator
                    },
                    {
                        type: FormTypes.RADIO,
                        id: 'singingSeventh',
                        header: 'Can you sing a major seventh interval on demand?',
                        text: 'If you do not understand this question, respond "Not sure".',
                        options: ['Yes', 'No', 'Not sure'],
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
