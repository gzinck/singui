import { StudyProps } from '../Study';
import { StudyTaskType } from '../studyTasks';
import { PitchTaskTarget } from '../../tasks/sing/target';
import { RecognizerMap, TaskType } from '../../../utils/rxjs/recognizers/universalRecognizer';
import { FormTypes } from '../../tasks/form/formTypes';
import { studyId } from './studyId';
import { reorderLatinSquare, reorderRandom } from './variations/reorder';
import { varyBackgroundMusic } from './variations/backgroundMusic';

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
    dependencies: [], //[studyId.SETUP_STUDY],
    name: 'Pitch study',
    description: 'Sing individual pitches to control your computer',
    time: 10,
    getTasks: (latinSquare: number) => [
        {
            id: 'headphones',
            type: StudyTaskType.HEADPHONE_MESSAGE,
            props: {
                header: 'Headphones'
            }
        },
        {
            id: 'video',
            type: StudyTaskType.VIDEO,
            props: {
                header: 'Pitch task tutorial',
                text: 'Before you start performing the tasks, watch this short video demonstration.',
                embedID: 'LFsP4o6kpE0'
            }
        },
        {
            id: 'silence-pre-evaluation',
            type: StudyTaskType.RECORD,
            props: {}
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
        // Rearrangeable section for when there is(n't) background music
        ...reorderLatinSquare(
            varyBackgroundMusic({
                id: `pre-evaluation`,
                type: StudyTaskType.SING,
                props: {
                    header: 'Pitch task pre-evaluation',
                    // Should generate this randomly using the scripts/gen_pitches.py script
                    targets: toTargets(reorderRandom([9, 2, 0, 9, 11, 2, 5, 7, 0, 4, 7, 11, 4, 5])),
                    recognizers,
                    withPrompts: false,
                    hideFeedback: true,
                    maxAttempts: 1
                }
            }),
            latinSquare
        ),
        {
            id: 'performance-pre-evaluation-without-music',
            type: StudyTaskType.PERFORMANCE_MESSAGE,
            props: {
                header: 'Results without music',
                multiAttempt: false,
                studyID: studyId.PITCH_STUDY,
                taskID: 'pre-evaluation-without-music'
            }
        },
        {
            id: 'performance-pre-evaluation-with-music',
            type: StudyTaskType.PERFORMANCE_MESSAGE,
            props: {
                header: 'Results with music',
                multiAttempt: false,
                studyID: studyId.PITCH_STUDY,
                taskID: 'pre-evaluation-with-music'
            }
        },
        {
            id: 'silence-training-I',
            type: StudyTaskType.RECORD,
            props: {}
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
                targets: toTargets(reorderRandom([7, 5, 2, 4, 2, 0, 11, 0, 5, 9, 11, 7, 9, 4])),
                recognizers,
                withPrompts: true,
                maxAttempts: 10
            }
        },
        {
            id: 'silence-training-II',
            type: StudyTaskType.RECORD,
            props: {}
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
                targets: toTargets(
                    reorderRandom([
                        0,
                        9,
                        2,
                        9,
                        11,
                        2,
                        7,
                        9,
                        4,
                        7,
                        2,
                        0,
                        4,
                        0,
                        9,
                        5,
                        9,
                        7,
                        5,
                        2,
                        5,
                        11,
                        7,
                        9,
                        11,
                        0,
                        5,
                        0,
                        11,
                        4,
                        11,
                        4,
                        7,
                        2,
                        4,
                        5,
                        11,
                        5,
                        2,
                        7,
                        0,
                        4
                    ])
                ),
                recognizers,
                withPrompts: false,
                maxAttempts: 10
            }
        },
        {
            id: 'silence-post-evaluation',
            type: StudyTaskType.RECORD,
            props: {}
        },
        {
            id: 'msg-post-evaluation',
            type: StudyTaskType.MESSAGE,
            props: {
                header: 'Pitch task post-evaluation',
                text: 'The final block of tasks evaluates your performance with no audio prompts and no repeats.'
            }
        },
        // Rearrangeable section for when there is(n't) background music
        ...reorderLatinSquare(
            varyBackgroundMusic({
                id: 'post-evaluation',
                type: StudyTaskType.SING,
                props: {
                    header: 'Pitch task post-evaluation',
                    targets: toTargets(reorderRandom([7, 0, 4, 0, 4, 7, 5, 2, 9, 4, 2, 7, 9, 5, 11, 0, 7, 4, 11, 0])),
                    recognizers,
                    withPrompts: false,
                    maxAttempts: 1
                }
            }),
            latinSquare
        ),
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
                    // Technical
                    {
                        type: FormTypes.RADIO,
                        id: 'recognizePitchEffectiveness',
                        header: 'How often did the application correctly recognize the pitches you sang?',
                        text: 'Your response should not consider your own ability to perform the tasks.',
                        options: [
                            '0-20% of the time',
                            '20-40% of the time',
                            '40-60% of the time',
                            '60-80% of the time',
                            '80-100% of the time'
                        ],
                        getError: radioButtonValidator
                    },
                    {
                        type: FormTypes.RADIO,
                        id: 'recognizePitchEffectiveness2',
                        header: 'To what extent was the application successful at recognizing the pitches you sang?',
                        text: 'Your response should not consider your own ability to perform the tasks.',
                        options: [
                            'Very unsuccessful',
                            'Unsuccessful',
                            'Somewhat unsuccessful',
                            'Neither successful nor unsuccessful',
                            'Somewhat successful',
                            'Successful',
                            'Very successful'
                        ],
                        variant: 'horizontal',
                        getError: radioButtonValidator
                    },
                    {
                        type: FormTypes.TEXT_FIELD,
                        id: 'technicalProblems',
                        header: 'Were there any technical problems you encountered when using the application?',
                        label: 'Add any technical problems here...'
                    },
                    // Perceived task difficulty & learnability
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
                        id: 'satisfactionBeforeTraining',
                        header: 'How satisfied were you with your performance before the two training stages?',
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
                        type: FormTypes.RADIO,
                        id: 'satisfactionAfterTraining',
                        header: 'How satisfied were you with your performance after the two training stages?',
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
                        type: FormTypes.RADIO,
                        id: 'practiceTime',
                        header:
                            'Relative to the amount of practice time provided, how much practice time would you have needed to consistently perform the tasks successfully?',
                        options: ['Much less', 'Less', 'Slightly less', 'The same amount', 'Slightly more', 'More', 'Much more'],
                        variant: 'horizontal',
                        getError: radioButtonValidator
                    },
                    // Enjoyability
                    {
                        type: FormTypes.RADIO,
                        id: 'enjoyability',
                        header: 'To what extent did you find the tasks enjoyable?',
                        options: [
                            'Very unenjoyable',
                            'Unenjoyable',
                            'Slightly unenjoyable',
                            'Neither enjoyable nor unenjoyable',
                            'Slightly enjoyable',
                            'Enjoyable',
                            'Very enjoyable'
                        ],
                        variant: 'horizontal',
                        getError: radioButtonValidator
                    },
                    // Use cases
                    {
                        type: FormTypes.CHECKBOX,
                        id: 'useCases',
                        header: 'For what use cases would you consider using these interactions, if any?',
                        options: [
                            'Switching tools in a photo or drawing application like Photoshop',
                            'Performing shortcuts in word processors, like Microsoft Word, or text editors, like Notepad or vim',
                            'Switching slides in a slideshow',
                            'Other'
                        ]
                    },
                    {
                        type: FormTypes.TEXT_FIELD,
                        id: 'useCasesOther',
                        header: 'If you chose "other", describe your use case(s) for pitch-based interactions',
                        label: 'Add any other use cases here...'
                    },
                    // Extra
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
