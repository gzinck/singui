import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../../../../theme';
import useTheme from '@material-ui/core/styles/useTheme';

interface MelodyDiagramProps {
    melody: number[]; // Numbers from -12 to +12
    done: boolean[]; // Whether the note has been sung already or not
    current: number;
}

const useStyles = makeStyles<Theme, MelodyDiagramProps>((theme) => ({
    root: {
        position: 'relative',
        width: '100%',
        height: '100%'
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
    })
}));

const MelodyDiagram = (props: MelodyDiagramProps) => {
    const classes = useStyles(props);
    const theme = useTheme<Theme>();

    return (
        <div className={classes.root}>
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
    );
};

export default MelodyDiagram;
