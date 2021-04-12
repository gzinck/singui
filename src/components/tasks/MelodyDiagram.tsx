import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Card from '@material-ui/core/Card';
import { Theme } from '../theme';

interface MelodyDiagramProps {
    melody: number[]; // Numbers from -12 to +12
}

const useStyles = makeStyles<Theme, MelodyDiagramProps>((theme) => ({
    root: {
        width: '90%',
        maxWidth: '50rem',
        padding: theme.spacing(3),
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
        width: `${100 / melody.length}%`,
        backgroundColor: theme.palette.primary.main
    })
}));

const MelodyDiagram = (props: MelodyDiagramProps) => {
    const classes = useStyles(props);

    return (
        <Card className={classes.root}>
            <div className={classes.noteBox}>
                {props.melody.map((note, idx) => (
                    <div
                        className={classes.note}
                        style={{
                            bottom: `${4 * (note + 12)}%`,
                            left: `${(100 / props.melody.length) * idx}%`
                        }}
                    />
                ))}
            </div>
        </Card>
    );
};

export default MelodyDiagram;
