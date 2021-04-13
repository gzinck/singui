import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Card from '@material-ui/core/Card';
import { Theme } from '../../theme';
import useTheme from '@material-ui/core/styles/useTheme';
import clsx from 'clsx';

interface MelodyDiagramProps {
    melody: number[]; // Numbers from -12 to +12
    done: boolean[]; // Whether the note has been sung already or not
    current: number;
    variant: '' | 'success' | 'failure';
}

const useStyles = makeStyles<Theme, MelodyDiagramProps>((theme) => ({
    root: {
        width: '90%',
        maxWidth: '50rem',
        padding: theme.spacing(3),
        marginBottom: theme.spacing(2),
        position: 'relative'
    },
    noteBox: {
        position: 'relative',
        width: '100%',
        height: '10rem'
    },
    note: ({ melody }) => ({
        position: 'absolute',
        height: '4%',
        width: `${100 / melody.length}%`
    }),
    current: ({ melody, done, current }) => ({
        position: 'absolute',
        height: '2%',
        width: `${50 / melody.length}%`,
        bottom: `${4 * (current + 12) + 1}%`,
        left: `${(100 / melody.length) * (done.reduce((acc, d) => acc + (d ? 1 : 0), 0) + 0.25)}%`,
        backgroundColor: theme.palette.success.main
    }),
    success: {
        backgroundColor: theme.palette.success.dark
    },
    failure: {
        backgroundColor: theme.palette.error.dark
    }
}));

const MelodyDiagram = (props: MelodyDiagramProps) => {
    const classes = useStyles(props);
    const theme = useTheme<Theme>();

    return (
        <Card className={clsx(classes.root, classes[props.variant])}>
            <div className={classes.noteBox}>
                {props.melody.map((note, idx) => (
                    <div
                        className={classes.note}
                        key={`${note}-${idx}`}
                        style={{
                            bottom: `${4 * (note + 12)}%`,
                            left: `${(100 / props.melody.length) * idx}%`,
                            backgroundColor: props.done[idx] ? theme.palette.success.main : theme.palette.primary.main
                        }}
                    />
                ))}
                <div className={classes.current} />
            </div>
        </Card>
    );
};

MelodyDiagram.defaultProps = {
    variant: ''
};

export default MelodyDiagram;
