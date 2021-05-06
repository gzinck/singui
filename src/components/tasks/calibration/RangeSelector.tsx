import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../../theme';
import React from 'react';
import Slider from '@material-ui/core/Slider';

interface Props {
    minNote: number;
    maxNote: number;
    note: number;
    setNote: (n: number) => void;
}

const useStyles = makeStyles<Theme>((theme) => ({
    root: {
        width: '100%',
        height: '1rem'
    }
}));

const RangeSelector = (props: Props): React.ReactElement<Props> => {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <Slider
                value={[props.note, props.note + 12]}
                onChange={(_, val) => {
                    if (!Array.isArray(val)) return;
                    if (val[0] === props.note) props.setNote(val[1] - 12);
                    else props.setNote(val[0]);
                }}
                step={1}
                min={props.minNote}
                max={props.maxNote}
            />
        </div>
    );
};

export default RangeSelector;
