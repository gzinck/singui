import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../theme';
import { convertNoteToString } from '../../utils/pitchConverter';
import React from 'react';

interface StaticPitchMeterProps {
    noteNum: number;
    error: number;
    target?: number;
}

const useStyles = makeStyles<Theme, StaticPitchMeterProps>((theme) => ({
    root: {
        backgroundColor: theme.palette.background.default,
        position: 'relative'
    },
    notes: {
        height: '75vh',
        width: '4.5rem',
        clear: 'none',
        float: 'left',
        '& div': {
            height: `${100 / 12}%`,
            width: '1.3rem',
            textAlign: 'right',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: theme.spacing(0, 3),
            borderRight: `0.2rem solid ${theme.palette.divider}`,
            '&:before': {
                content: '""',
                position: 'relative',
                top: '0.65rem',
                left: '2rem',
                height: 0,
                borderBottom: `0.2rem solid ${theme.palette.divider}`,
                width: '1rem'
            }
        }
    },
    target: ({ target, noteNum }) => ({
        display: target !== undefined ? 'block' : 'none',
        position: 'absolute',
        height: `${100 / 12}%`,
        width: '0.5rem',
        backgroundColor: noteNum === target ? theme.palette.success.main : theme.palette.primary.main,
        left: '4.3rem',
        top: target !== undefined ? `${(100 / 12) * (11 - target)}%` : 0
    }),
    currentBox: ({ target, noteNum, error }) => ({
        height: '75vh',
        width: '3rem',
        marginLeft: '1.5rem',
        clear: 'none',
        float: 'left',
        position: 'relative',
        '& div': {
            width: '5vh',
            height: '5vh',
            borderRadius: '3rem',
            position: 'absolute',
            backgroundColor: noteNum === target ? theme.palette.success.main : theme.palette.primary.main,
            top: `calc(${(100 / 12) * (11 - noteNum - error + 0.5)}% - 2.5vh)`,
            left: 0,
            transition: 'top 0.1s'
        }
    })
}));

const allNotes = new Array<string>(12).fill('').map((_, id) => convertNoteToString(11 - id, false));

const StaticPitchMeter = (props: StaticPitchMeterProps): React.ReactElement<StaticPitchMeterProps> => {
    const noteNum = props.noteNum % 12;
    const classes = useStyles({ ...props, noteNum });

    return (
        <div className={classes.root}>
            <div className={classes.notes}>
                {allNotes.map((note, idx) => (
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

export default StaticPitchMeter;
