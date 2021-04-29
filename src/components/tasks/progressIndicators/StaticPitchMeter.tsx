import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../../theme';
import {
    convertIntervalToString,
    convertNoteToString,
    convertNumericNoteToString,
    convertScalePitchToString
} from '../../../utils/pitchConverter';
import React from 'react';
import Circle from './Circle';

interface StaticPitchMeterProps {
    startNum: number; // The note number. For an elongating current number, use start and end (but not progress)
    startError: number;
    endNum?: number;
    endError?: number;
    noteLabels: string[];
    target?: number;
    progress?: number; // Between 0 and 1, showing the task progress. Only one position is shown if this is set.
    isCorrect?: boolean;
}

interface StyleProps {
    topNum: number;
    topError: number;
    bottNum: number;
    bottError: number;
    endNum: number;
    endError: number;
    noteLabels: string[];
    target?: number;
    isCorrect?: boolean;
}

const width = 9;
const circleSize = 4;
const useStyles = makeStyles<Theme, StyleProps>((theme) => ({
    root: {
        backgroundColor: theme.palette.background.default,
        height: '100%',
        position: 'relative',
        display: 'flex',
        flexWrap: 'nowrap'
    },
    notes: ({ noteLabels }) => ({
        height: '100%',
        width: `${width}rem`,
        '& div': {
            height: `${100 / noteLabels.length}%`,
            width: `${width - 3}rem`,
            textAlign: 'right',
            fontSize: '1rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: theme.spacing(0, 3),
            borderRight: `0.2rem solid ${theme.palette.divider}`,
            position: 'relative',
            '&:before': {
                content: '""',
                position: 'absolute',
                top: 'calc(50% - 0.1rem)',
                right: 0,
                height: 0,
                borderBottom: `0.2rem solid ${theme.palette.divider}`,
                width: '1rem'
            }
        }
    }),
    target: ({ target, noteLabels, endNum }) => ({
        display: target !== undefined ? 'block' : 'none',
        position: 'absolute',
        height: `${100 / noteLabels.length}%`,
        width: '0.5rem',
        backgroundColor: endNum === target ? theme.palette.success.main : theme.palette.primary.main,
        left: `${width}rem`,
        top: target !== undefined ? `${(100 / noteLabels.length) * (noteLabels.length - 1 - target)}%` : 0
    }),
    currentBox: {
        height: '100%',
        boxSizing: 'border-box',
        width: '3rem',
        marginLeft: '1rem',
        position: 'relative'
    },
    currentIndicator: ({ isCorrect, noteLabels, topNum, topError, bottNum, bottError }) => ({
        width: '5vh',
        height: `calc(${(100 / noteLabels.length) * (topNum - bottNum + topError - bottError)}% + 5vh)`,
        borderRadius: '3rem',
        position: 'absolute',
        backgroundColor:
            isCorrect === undefined ? theme.palette.primary.main : isCorrect ? theme.palette.success.main : theme.palette.error.main,
        bottom: `calc(${(100 / noteLabels.length) * (bottNum + bottError + 0.5)}% - 2.5vh)`,
        left: 0,
        transition: 'top 0.1s'
    }),
    circle: ({ noteLabels, endError, endNum }) => ({
        left: 0,
        position: 'absolute',
        width: `${circleSize}rem`,
        height: `${circleSize}rem`,
        bottom: `calc(${(100 / noteLabels.length) * (endNum + endError + 0.5)}% - ${circleSize / 2}rem)`
    })
}));

export const named12Notes = new Array<string>(12).fill('').map((_, id) => convertNoteToString(11 - id, false));
export const scale12Notes = new Array<string>(12).fill('').map((_, id) => convertScalePitchToString(id));
export const numeric15Notes = new Array<string>(15).fill('').map((_, id) => convertNumericNoteToString(13 - id));
export const scale15Notes = new Array<string>(15).fill('').map((_, id) => convertScalePitchToString(13 - id));
export const intervalsAscendingNotes = new Array<string>(15).fill('').map((_, id) => convertIntervalToString(13 - id));

const StaticPitchMeter = (props: StaticPitchMeterProps): React.ReactElement<StaticPitchMeterProps> => {
    const clamp = (n: number) => Math.max(0, Math.min(n, props.noteLabels.length));
    const classes = useStyles({
        ...props,
        topNum: clamp(props.startNum),
        topError: props.startError,
        bottNum: clamp(props.startNum),
        bottError: props.startError,
        endNum: clamp(props.endNum || props.startNum),
        endError: props.endError || props.startError,
        ...(props.endNum !== undefined && props.endError !== undefined
            ? props.startNum > props.endNum || (props.startNum === props.endNum && props.startError > props.endError)
                ? {
                      bottNum: clamp(props.endNum),
                      bottError: props.endError
                  }
                : {
                      topNum: clamp(props.endNum),
                      topError: props.endError
                  }
            : {})
    });

    return (
        <div className={classes.root}>
            <div className={classes.notes}>
                {props.noteLabels.map((note, idx) => (
                    <div key={`${note}-${idx}`}>{note}</div>
                ))}
            </div>
            <div className={classes.target} />
            <div className={classes.currentBox}>
                {props.progress !== undefined ? (
                    <div className={classes.circle}>
                        <Circle
                            progress={props.progress}
                            variant={props.isCorrect === undefined ? '' : props.isCorrect ? 'success' : 'error'}
                            size={`${circleSize}rem`}
                        />
                    </div>
                ) : (
                    <div className={classes.currentIndicator} />
                )}
            </div>
        </div>
    );
};

StaticPitchMeter.defaultProps = {
    noteLabels: named12Notes
};

export default StaticPitchMeter;
