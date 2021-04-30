import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../../theme';
import Page from '../../page/Page';

interface TaskPageProps {
    children?: React.ReactNode;
    header: string;
}

const useStyles = makeStyles<Theme>(() => ({
    root: {
        padding: '2rem',
        boxSizing: 'border-box',
        height: '100%',
        width: '100%',
        maxWidth: '60rem',
        position: 'relative',
        overflowY: 'hidden'
    }
}));

const TaskPage = (props: TaskPageProps): React.ReactElement<TaskPageProps> => {
    const classes = useStyles();

    return (
        <Page header={props.header}>
            <div className={classes.root}>{props.children}</div>
        </Page>
    );
};

export default TaskPage;
