import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../../theme';
import { convertNoteToString } from '../../../utils/pitchConverter';
import React from 'react';

interface StaticPitchMeterProps {
    startNum: number;
    startError: number;
    endNum?: number;
    endError?: number;
    noteLabels: string[];
    target?: number;
}

interface StyleProps {
    topNum: number;
    topError: number;
    bottNum: number;
    bottError: number;
    endNum: number;
    noteLabels: string[];
    target?: number;
}

const width = 9;
const useStyles = makeStyles<Theme, StyleProps>((theme) => ({
    root: {
        backgroundColor: theme.palette.background.default,
        position: 'relative',
        display: 'flex',
        flexWrap: 'nowrap'
    },
    notes: ({ noteLabels }) => ({
        height: '75vh',
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
    currentBox: ({ target, noteLabels, topNum, topError, bottNum, bottError }) => ({
        height: '75vh',
        boxSizing: 'border-box',
        width: '3rem',
        marginLeft: '1rem',
        position: 'relative',
        '& div': {
            width: '5vh',
            height: `calc(${(100 / noteLabels.length) * (topNum - bottNum + topError - bottError)}% + 5vh)`,
            borderRadius: '3rem',
            position: 'absolute',
            backgroundColor: topNum === target ? theme.palette.success.main : theme.palette.primary.main,
            bottom: `calc(${(100 / noteLabels.length) * (bottNum + bottError + 0.5)}% - 2.5vh)`,
            left: 0,
            transition: 'top 0.1s'
        }
    })
}));

export const named12Notes = new Array<string>(12).fill('').map((_, id) => convertNoteToString(11 - id, false));
export const scale12Notes = [
    'Tonic',
    '',
    'Supertonic',
    '',
    'Mediant',
    'Subdominant',
    '',
    'Dominant',
    '',
    'Submediant',
    '',
    'Leading tone'
].reverse();
export const intervalsAscendingNotes = [
    '⬆',
    'Perfect octave',
    'Major seventh',
    'Minor seventh',
    'Major sixth',
    'Minor sixth',
    'Perfect fifth',
    'Augmented fourth',
    'Perfect fourth',
    'Major third',
    'Minor third',
    'Major second',
    'Minor second',
    'Perfect unison',
    '⬇'
];

const StaticPitchMeter = (props: StaticPitchMeterProps): React.ReactElement<StaticPitchMeterProps> => {
    const classes = useStyles({
        ...props,
        topNum: props.startNum,
        topError: props.startError,
        bottNum: props.startNum,
        bottError: props.startError,
        endNum: props.endNum || props.startNum,
        ...(props.endNum !== undefined && props.endError !== undefined
            ? props.startNum > props.endNum || (props.startNum === props.endNum && props.startError > props.endError)
                ? {
                      bottNum: props.endNum,
                      bottError: props.endError
                  }
                : {
                      topNum: props.endNum,
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
                <div />
            </div>
        </div>
    );
};

StaticPitchMeter.defaultProps = {
    noteLabels: named12Notes
};

export default StaticPitchMeter;
