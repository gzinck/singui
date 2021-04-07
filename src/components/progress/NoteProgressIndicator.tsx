import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../theme';
import { convertNoteToString } from '../../utils/pitchConverter';

interface NoteProgressIndicatorProps {
    noteNum: number;
    progress: number; // Between 0 and 1
    isIncorrect?: boolean; // Default to being "correct"
}

const strokeSize = 4;
const radius = 25;
const normalizedRadius = radius - strokeSize * 2;
const circumference = normalizedRadius * 2 * Math.PI;

const useStyles = makeStyles<Theme, NoteProgressIndicatorProps>((theme) => ({
    root: {
        width: '50vw',
        height: '50vw',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    svg: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        zIndex: 0
    },
    circle: ({ progress, isIncorrect }) => ({
        transition: 'stroke-dashoffset 0.35s, fill 0.35s',
        transform: 'rotate(-90deg)',
        transformOrigin: '50% 50%',
        stroke: isIncorrect ? theme.palette.error.main : theme.palette.success.main,
        fill: progress === 1 ? (isIncorrect ? theme.palette.error.main : theme.palette.success.main) : 'transparent',
        strokeWidth: strokeSize,
        strokeDasharray: `${circumference}vw ${circumference}vw`,
        strokeDashoffset: `${(1 - progress) * circumference}vw`,
        r: `${normalizedRadius}vw`,
        cx: `${radius}vw`,
        cy: `${radius}vw`,
        zIndex: 0
    }),
    noteName: {
        fontSize: '3rem',
        zIndex: 1
    }
}));

const NoteProgressIndicator = (props: NoteProgressIndicatorProps): React.ReactElement<NoteProgressIndicatorProps> => {
    const classes = useStyles(props);
    return (
        <div className={classes.root}>
            <svg className={classes.svg}>
                <circle className={classes.circle} />
            </svg>
            <h4 className={classes.noteName}>{convertNoteToString(props.noteNum)}</h4>
        </div>
    );
};

export default NoteProgressIndicator;
