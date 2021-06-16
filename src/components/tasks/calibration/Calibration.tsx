import React from 'react';
import Form from '../form/Form';
import { FormItem, FormTypes } from '../form/formTypes';
import { CalibrationTask, CalibrationTaskType } from './calibrationTasks';
import CalibrationSingPage from './CalibrationSingPage';
import MessagePage from '../message/MessagePage';
import RangeSelectionPage from './rangeSelection/RangeSelectionPage';
import { convertNoteToString } from '../../../utils/pitchConverter';
import { tonic$ } from '../../detector/shared';

interface CalibrationProps {
    onComplete?: (result: { startNote: number; minNote: number; maxNote: number }) => void;
}

const getError = (val: any) => (val === undefined ? 'This question is required' : undefined);

const comfortFormID = 'comfort-2';
const comfortForm = (isHigh: boolean): FormItem[] => [
    {
        id: comfortFormID,
        header: `Can you comfortably sing ${isHigh ? 'higher' : 'lower'}?`,
        type: FormTypes.RADIO,
        options: ['Yes', 'No'],
        getError
    }
];

const Calibration = ({ onComplete }: CalibrationProps): React.ReactElement<CalibrationProps> => {
    const [currIdx, setCurrIdx] = React.useState(0);
    const [prvIdx, setPrvIdx] = React.useState(-1);
    const [minNote, setMinNote] = React.useState(0);
    const [maxNote, setMaxNote] = React.useState(0);
    const [startNote, setStartNote] = React.useState(0);

    const next = () => {
        setPrvIdx(currIdx);
        setCurrIdx((idx) => idx + 1);
    };
    const prev = () => {
        setPrvIdx(currIdx);
        setCurrIdx((idx) => idx - 1);
    };

    const calibrationTasks: CalibrationTask[] = [
        ...[false, true].reduce<CalibrationTask[]>(
            (acc, isHigh) => [
                ...acc,
                {
                    type: CalibrationTaskType.SING,
                    props: {
                        header: 'Calibration',
                        startMessage:
                            prvIdx - 1 === currIdx
                                ? `Let's try again. Sing a comfortable, ${isHigh ? 'high' : 'low'} pitch`
                                : `Sing a pitch that is ${isHigh ? 'high' : 'low'} but still comfortable`,
                        onComplete: (note: number) => {
                            isHigh ? setMaxNote(note) : setMinNote(note);
                            next();
                        }
                    }
                },
                {
                    type: CalibrationTaskType.FORM,
                    props: {
                        header: 'Calibration',
                        form: comfortForm(isHigh),
                        onComplete: (responses) => {
                            if (responses[comfortFormID] !== 'No') prev();
                            else next();
                        }
                    }
                }
            ],
            []
        ),
        {
            type: CalibrationTaskType.MESSAGE,
            props: {
                header: 'Calibration',
                text: `Your range is from ${convertNoteToString(minNote)} to ${convertNoteToString(maxNote)}. ${
                    maxNote - minNote < 12
                        ? `The minimum range required for this study is 1 octave and your range is ${
                              11 - (maxNote - minNote)
                          } semitones too small. If the following exercises are too challenging, you may withdraw from the study.`
                        : ''
                }`,
                onComplete: next
            }
        },
        {
            type: CalibrationTaskType.MESSAGE,
            props: {
                header: 'Calibration',
                text:
                    'On the next page, you will be selecting the range of pitches you will be singing during the study. Take your time to select the range that is most comfortable for you.',
                onComplete: next
            }
        },
        {
            type: CalibrationTaskType.RANGE_SELECTION,
            props: {
                header: 'Calibration',
                minNote,
                maxNote,
                onComplete: (start) => {
                    tonic$.next(start);
                    setStartNote(start);
                    onComplete ? onComplete({ minNote, maxNote, startNote }) : next();
                },
                restart: () => {
                    setPrvIdx(currIdx);
                    setCurrIdx(0);
                }
            }
        },
        {
            type: CalibrationTaskType.MESSAGE,
            props: {
                header: 'Calibration',
                text: 'Calibration complete!'
            }
        }
    ];

    const currTask = calibrationTasks[currIdx];
    switch (currTask.type) {
        case CalibrationTaskType.SING:
            return <CalibrationSingPage {...currTask.props} />;
        case CalibrationTaskType.FORM:
            return <Form {...currTask.props} />;
        case CalibrationTaskType.MESSAGE:
            return <MessagePage {...currTask.props} />;
        case CalibrationTaskType.RANGE_SELECTION:
            return <RangeSelectionPage {...currTask.props} />;
    }
};

export default Calibration;
