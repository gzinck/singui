import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../theme';
import { convertNoteToString } from '../../utils/pitchConverter';
import React from 'react';

interface StaticPitchMeterProps {
    noteNum: number;
    error: number;
    noteLabels: string[];
    target?: number;
}

const width = 9;
const useStyles = makeStyles<Theme, StaticPitchMeterProps>((theme) => ({
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
            '&:before': {
                content: '""',
                position: 'relative',
                top: '0.65rem',
                left: `${width - 2.5}rem`,
                height: 0,
                borderBottom: `0.2rem solid ${theme.palette.divider}`,
                width: '1rem'
            }
        }
    }),
    target: ({ target, noteLabels, noteNum }) => ({
        display: target !== undefined ? 'block' : 'none',
        position: 'absolute',
        height: `${100 / 12}%`,
        width: '0.5rem',
        backgroundColor: noteNum === target ? theme.palette.success.main : theme.palette.primary.main,
        left: `${width}rem`,
        top: target !== undefined ? `${(100 / noteLabels.length) * (noteLabels.length - 1 - target)}%` : 0
    }),
    currentBox: ({ target, noteLabels, noteNum, error }) => ({
        height: '75vh',
        boxSizing: 'border-box',
        width: '3rem',
        marginLeft: '1rem',
        position: 'relative',
        '& div': {
            width: '5vh',
            height: '5vh',
            borderRadius: '3rem',
            position: 'absolute',
            backgroundColor: noteNum === target ? theme.palette.success.main : theme.palette.primary.main,
            top: `calc(${(100 / noteLabels.length) * (noteLabels.length - 1 - noteNum - error + 0.5)}% - 2.5vh)`,
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
    'Leading Tone'
].reverse();

const StaticPitchMeter = (props: StaticPitchMeterProps): React.ReactElement<StaticPitchMeterProps> => {
    const noteLabels = props.noteLabels;
    const noteNum = props.noteNum % noteLabels.length;
    const classes = useStyles({ ...props, noteNum });

    return (
        <div className={classes.root}>
            <div className={classes.notes}>
                {noteLabels.map((note, idx) => (
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
