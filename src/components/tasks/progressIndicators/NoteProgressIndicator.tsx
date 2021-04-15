import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../../theme';
import Circle from './Circle';

interface NoteProgressIndicatorProps {
    noteName: string;
    progress: number; // Between 0 and 1
    isIncorrect?: boolean; // Default to being "correct"
}

const useStyles = makeStyles<Theme, NoteProgressIndicatorProps>((theme) => ({
    noteName: {
        fontSize: '3rem',
        zIndex: 1,
        width: '100%',
        textAlign: 'center'
    }
}));

const NoteProgressIndicator = (props: NoteProgressIndicatorProps): React.ReactElement<NoteProgressIndicatorProps> => {
    const classes = useStyles(props);
    return (
        <Circle progress={props.progress} variant={props.isIncorrect ? 'error' : 'success'}>
            <h4 className={classes.noteName}>{props.noteName}</h4>
        </Circle>
    );
};

export default NoteProgressIndicator;
