import { MessageProps } from '../message/MessagePage';
import { FormProps } from '../form/Form';
import { RangeSelectionProps } from './rangeSelection/RangeSelectionPage';
import { CalibrationSingProps } from './CalibrationSingPage';

export enum CalibrationTaskType {
    SING = 'SING',
    FORM = 'FORM',
    MESSAGE = 'MESSAGE',
    RANGE_SELECTION = 'RANGE_SELECTION'
}

export interface CalibrationSingTask {
    type: CalibrationTaskType.SING;
    props: CalibrationSingProps;
}

export interface CalibrationMessageTask {
    type: CalibrationTaskType.MESSAGE;
    props: MessageProps;
}

export interface CalibrationFormTask {
    type: CalibrationTaskType.FORM;
    props: FormProps;
}

export interface CalibrationRangeTask {
    type: CalibrationTaskType.RANGE_SELECTION;
    props: RangeSelectionProps;
}

export type CalibrationTask = CalibrationSingTask | CalibrationMessageTask | CalibrationFormTask | CalibrationRangeTask;
