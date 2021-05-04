import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../../../theme';
import React from 'react';
import clsx from 'clsx';

interface Props {
    size: number | string;
    progress: number; // between 0 and 1
    variant: 'success' | 'error' | '';
    children?: React.ReactNode;
}

const strokeSize = 4;
const radius = 50;
const normalizedRadius = radius - strokeSize * 2;
const circumference = normalizedRadius * 2 * Math.PI;

const useStyles = makeStyles<Theme, Props>((theme) => ({
    root: ({ size }) => ({
        width: size,
        height: size,
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }),
    svg: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        zIndex: 0
    },
    circle: ({ progress }) => ({
        transition: 'stroke-dashoffset 0.35s, fill 0.35s',
        transform: 'rotate(-90deg)',
        transformOrigin: '50% 50%',
        stroke: theme.palette.primary.main,
        fill: progress === 1 ? theme.palette.primary.main : theme.palette.background.paper,
        strokeWidth: strokeSize,
        strokeDasharray: `${circumference}% ${circumference}%`,
        strokeDashoffset: `${(1 - progress) * circumference}%`,
        zIndex: 0
    }),
    success: ({ progress }) => ({
        stroke: theme.palette.success.main,
        fill: progress === 1 ? theme.palette.success.main : theme.palette.background.paper
    }),
    error: ({ progress }) => ({
        stroke: theme.palette.error.main,
        fill: progress === 1 ? theme.palette.error.main : theme.palette.background.paper
    })
}));

const Circle = (props: Props): React.ReactElement<Props> => {
    const classes = useStyles(props);
    return (
        <div className={classes.root}>
            <svg className={classes.svg}>
                <circle
                    className={clsx(classes.circle, classes[props.variant])}
                    cx={`${radius}%`}
                    cy={`${radius}%`}
                    r={`${normalizedRadius}%`}
                />
            </svg>
            {props.children}
        </div>
    );
};

Circle.defaultProps = {
    size: '100%',
    progress: 1,
    variant: ''
};

export default Circle;
