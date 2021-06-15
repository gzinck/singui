import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../../../../theme';
import { convertNoteToString } from '../../../../../utils/pitchConverter';
import clsx from 'clsx';
import { rgbToHex } from '../../../../../utils/colours';
import { mod12 } from '../../../../../utils/math';

interface PopupPitchMeterProps {
    startNum: number;
    startError: number;
    endNum?: number;
    endError?: number;
    progress: number;
    label?: string;
    noteLabels: string[];
}

const radius = 250;
const noteLabelRadius = 0.85;
const strokeWidth = 24;
const center = radius + strokeWidth;

const useStyles = makeStyles<Theme, PopupPitchMeterProps>((theme) => ({
    root: {
        width: '15rem',
        height: '15rem',
        padding: '1rem',
        backgroundColor: theme.palette.background.paper,
        borderRadius: '50%',
        boxShadow: theme.shadows[1]
    },
    svg: {
        width: '100%',
        height: '100%'
    },
    circle: ({ progress }) => ({
        fill: progress >= 1 ? theme.palette.success.main : theme.palette.background.paper,
        stroke: '#FFF',
        strokeWidth: 4,
        transition: 'fill 0.2s'
    }),
    progress: ({ progress }) => ({
        stroke: rgbToHex((1 - progress) * 255, 255, (1 - progress) * 255),
        strokeWidth: 8
    }),
    arc: ({ progress }) => ({
        fill: rgbToHex(255 - progress * 179, 255 - progress * 80, 255 - progress * 175),
        transition: 'fill 0.2s'
    }),
    label: {
        fill: '#FFF',
        fontFamily: theme.typography.fontFamily,
        fontSize: radius / 8,
        dominantBaseline: 'middle',
        textAnchor: 'middle',
        fontWeight: 300,
        transition: 'font-weight 0.2s'
    },
    currentLabel: {
        fontWeight: 700
    },
    centerLabel: {
        fontWeight: 400,
        fontSize: radius / 5
    },
    mask: {
        fill: 'transparent',
        stroke: '#FFF',
        strokeWidth: 2 * radius,
        transition: 'all 0.2s'
    }
}));

export const noteNamesFrom = (start: number) => new Array<string>(12).fill('').map((_, id) => convertNoteToString(id + start, false));

// Remove partial eventually
const SimpleCircularPitchMeter = (props: PopupPitchMeterProps) => {
    const classes = useStyles(props);

    let lowNum = props.startNum,
        lowError = props.startError,
        highNum = props.endNum !== undefined ? props.endNum : props.startNum,
        highError = props.endError !== undefined ? props.endError : props.startError;

    // Make sure low is actually lower.
    if (props.endNum && props.startNum > props.endNum) {
        lowNum = props.endNum;
        lowError = props.endError || props.startError;
        highNum = props.startNum;
        highError = props.startError;
    }

    // Angles for the curr note
    const angleMagnitude = Math.min(highNum + highError - lowNum - lowError + 1, 12) / 12; // in [0, 1]
    const angle = (lowNum - 0.5 + lowError) * 30 - 90; // in degrees

    return (
        <div className={classes.root}>
            <svg viewBox={`0 0 ${center * 2} ${center * 2}`} className={classes.svg}>
                <mask id="currNoteMask">
                    <circle
                        r={radius}
                        cx={center}
                        cy={center}
                        className={classes.mask}
                        strokeDasharray={`${angleMagnitude * Math.PI * 2 * radius} ${Math.PI * 2 * radius}`}
                        transform={`rotate(${angle} ${center} ${center})`}
                    />
                </mask>

                <circle cx={center} cy={center} r={radius + strokeWidth} className={classes.arc} mask="url(#currNoteMask)" />
                <circle cx={center} cy={center} r={radius} className={classes.circle} />

                <text x={center} y={center} className={clsx(classes.label, classes.centerLabel)}>
                    {props.label}
                </text>
                {props.noteLabels.map((label, idx) => (
                    <text
                        x={center + Math.sin((idx * Math.PI) / 6) * radius * noteLabelRadius}
                        y={center - Math.cos((idx * Math.PI) / 6) * radius * noteLabelRadius}
                        key={label}
                        className={clsx(classes.label, (idx === mod12(lowNum) || idx === mod12(highNum)) && classes.currentLabel)}
                    >
                        {label}
                    </text>
                ))}
            </svg>
        </div>
    );
};

SimpleCircularPitchMeter.defaultProps = {
    noteLabels: noteNamesFrom(0),
    startNum: 0,
    startError: 0,
    progress: 0
};

export default SimpleCircularPitchMeter;
