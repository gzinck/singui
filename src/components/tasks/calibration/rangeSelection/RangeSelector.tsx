import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../../../theme';
import React from 'react';
import Slider from '@material-ui/core/Slider';

interface Props {
    minNote: number;
    maxNote: number;
    note: number;
    setNote: (n: number) => void;
}

const useStyles = makeStyles<Theme, Props>((theme) => ({
    root: {
        width: '100%',
        height: '1rem'
    },
    thumb: ({ minNote, maxNote }) => ({
        width: `${(13.5 / (maxNote - minNote + 1)) * 100}%`,
        borderRadius: 3
    })
}));

const RangeSelector = (props: Props): React.ReactElement<Props> => {
    const classes = useStyles(props);
    return (
        <div className={classes.root}>
            <Slider
                value={props.note}
                onChange={(e, val) => {
                    console.log(e);
                    if (Array.isArray(val)) return;
                    props.setNote(Math.max(props.minNote, Math.min(props.maxNote - 12, val)));
                }}
                step={1}
                track={false}
                min={props.minNote}
                max={props.maxNote}
                classes={{
                    thumb: classes.thumb
                }}
            />
        </div>
    );
};

export default RangeSelector;
