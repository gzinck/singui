import { StudyProps } from '../Study';
import { StudyTaskType } from '../studyTasks';
import { shuffleArray } from '../../tasks/possibleTasks';
import { PitchTaskTarget } from '../../tasks/target';
import { RecognizerMap, TaskType } from '../../../utils/rxjs/recognizers/universalRecognizer';
import { FormTypes } from '../../form/formTypes';
import { studyId } from './studyId';

const pitches = [0, 2, 4, 5, 7, 9, 11];
const recognizers: RecognizerMap = {
    0: { type: TaskType.PITCH },
    1: { type: TaskType.PITCH },
    2: { type: TaskType.PITCH },
    3: { type: TaskType.PITCH },
    4: { type: TaskType.PITCH },
    5: { type: TaskType.PITCH },
    6: { type: TaskType.PITCH },
    7: { type: TaskType.PITCH },
    8: { type: TaskType.PITCH },
    9: { type: TaskType.PITCH },
    10: { type: TaskType.PITCH },
    11: { type: TaskType.PITCH }
};
const toTargets = (arr: number[]): PitchTaskTarget[] => {
    return arr.map<PitchTaskTarget>((value) => ({
        type: TaskType.PITCH,
        value
    }));
};
const radioButtonValidator = (val: any) => (typeof val === 'string' ? undefined : 'Select a radio button');
// const textFieldValidator = (val: any) => (typeof val === 'string' ? undefined : 'This field is required')

export const pitchStudyProps: StudyProps = {
    id: studyId.PITCH_STUDY,
    dependencies: [studyId.SETUP_STUDY],
    name: 'Pitch study',
    description: 'Sing individual pitches to control your computer',
    time: 10,
    tasks: [
        {
            id: 'video',
            type: StudyTaskType.MESSAGE,
            props: {
                header: 'Pitch task tutorial',
                text: 'Insert a tutorial video here!'
            }
        },
        {
            id: 'msg-pre-evaluation',
            type: StudyTaskType.MESSAGE,
            props: {
                header: 'Pitch task pre-evaluation',
                text:
                    "To get a baseline for your performance, the first block of tasks do not have audio prompts. Don't worry, you'll have a chance to practice afterwards."
            }
        },
        {
            id: 'pre-evaluation',
            type: StudyTaskType.SING,
            props: {
                header: 'Pitch task pre-evaluation',
                targets: shuffleArray(toTargets([...pitches])),
                recognizers,
                withPrompts: false,
                maxAttempts: 1
            }
        },
        {
            id: 'msg-training-I',
            type: StudyTaskType.MESSAGE,
            props: {
                header: 'Pitch task training I',
                text:
                    'Your baseline performance has been recorded. The next block of tasks are nearly identical, but feature audio prompts for what notes to sing. Repeats are allowed for failed tasks.'
            }
        },
        {
            id: 'training-I',
            type: StudyTaskType.SING,
            props: {
                header: 'Pitch task training I',
                targets: shuffleArray(toTargets([...pitches])),
                recognizers,
                withPrompts: true,
                maxAttempts: 10
            }
        },
        {
            id: 'msg-training-II',
            type: StudyTaskType.MESSAGE,
            props: {
                header: 'Pitch task training II',
                text: 'The next block of tasks remove the audio prompts. Repeats are still allowed for failed tasks.'
            }
        },
        {
            id: 'training-II',
            type: StudyTaskType.SING,
            props: {
                header: 'Pitch task training II',
                targets: shuffleArray(toTargets([...pitches])),
                recognizers,
                withPrompts: false,
                maxAttempts: 10
            }
        },
        {
            id: 'msg-post-evaluation',
            type: StudyTaskType.MESSAGE,
            props: {
                header: 'Pitch task post-evaluation',
                text: 'The final block of tasks evaluates your performance with no audio prompts and no repeats.'
            }
        },
        {
            id: 'post-evaluation',
            type: StudyTaskType.SING,
            props: {
                header: 'Pitch task post-evaluation',
                targets: shuffleArray(toTargets([...pitches])),
                recognizers,
                withPrompts: false,
                maxAttempts: 1
            }
        },
        {
            id: 'msg-participant-rating',
            type: StudyTaskType.MESSAGE,
            props: {
                header: 'Pitch task rating',
                text:
                    'Now that you have experience singing pitches to interact with your computer, we want to know what you think. Fill out the form on the next page.'
            }
        },
        {
            id: 'participant-rating',
            type: StudyTaskType.FORM,
            props: {
                header: 'Pitch task rating',
                form: [
                    {
                        type: FormTypes.TEXT,
                        id: 'title',
                        header: 'Pitch task rating',
                        text:
                            'Now that you have experience singing pitches to interact with your computer, let us know what your thoughts are.'
                    },
                    {
                        type: FormTypes.RADIO,
                        id: 'recognizePitchEffectiveness',
                        header: 'How often did the application correctly recognize the pitches you sang?',
                        text: 'Your response should not consider your own ability to perform the tasks.',
                        options: [
                            '0-25% of the time',
                            '25-50% of the time',
                            '50-75% of the time',
                            '75-90% of the time',
                            '90-100% of the time'
                        ],
                        getError: radioButtonValidator
                    },
                    {
                        type: FormTypes.RADIO,
                        id: 'challengeBeforeTraining',
                        header: 'How challenging were the tasks before the two training stages?',
                        options: [
                            'Very challenging',
                            'Challenging',
                            'Somewhat challenging',
                            'Neutral',
                            'Somewhat easy',
                            'Easy',
                            'Very easy'
                        ],
                        variant: 'horizontal',
                        getError: radioButtonValidator
                    },
                    {
                        type: FormTypes.RADIO,
                        id: 'challengeAfterTraining',
                        header: 'How challenging were the tasks after the two training stages?',
                        options: [
                            'Very challenging',
                            'Challenging',
                            'Somewhat challenging',
                            'Neutral',
                            'Somewhat easy',
                            'Easy',
                            'Very easy'
                        ],
                        variant: 'horizontal',
                        getError: radioButtonValidator
                    },
                    {
                        type: FormTypes.RADIO,
                        id: 'performanceSatisfaction',
                        header: 'How satisfied were you with your performance?',
                        options: [
                            'Very unsatisfied',
                            'Unsatisfied',
                            'Somewhat unsatisfied',
                            'Neutral',
                            'Somewhat satisfied',
                            'Satisfied',
                            'Very satisfied'
                        ],
                        variant: 'horizontal',
                        getError: radioButtonValidator
                    },
                    {
                        type: FormTypes.TEXT_FIELD,
                        id: 'technicalProblems',
                        header: 'Were there any technical issues when you were performing the tasks?',
                        label: 'Add any technical problems here...'
                    },
                    {
                        type: FormTypes.CHECKBOX,
                        id: 'useCases',
                        header: 'What use cases, if any, would you consider using pitch-based interaction for?',
                        options: [
                            'Switching tools in Photoshop',
                            'Switching editing modes in a text editor/word processor',
                            'Navigating a powerpoint presentation',
                            'Other'
                        ]
                    },
                    {
                        type: FormTypes.TEXT_FIELD,
                        id: 'useCasesOther',
                        header: 'If you chose "other", describe your use case(s) for pitch-based interactions',
                        label: 'Add any other use cases here...'
                    },
                    {
                        type: FormTypes.TEXT_FIELD,
                        id: 'thoughts',
                        header: 'Anything else to say?',
                        multiline: true,
                        label: 'Add your thoughts on pitch-based interactions...'
                    }
                ]
            }
        }
    ]
};
