import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../theme';
import TopBar from './TopBar';

interface TaskPageProps {
    children?: React.ReactNode;
    header: string;
    topBar?: React.ReactNode;
}

const useStyles = makeStyles<Theme>((theme) => ({
    root: {
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        minHeight: '100vh',
        overflow: 'hidden',
        margin: 0,
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center'
    },
    main: {
        marginTop: '4rem',
        width: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    }
}));

const Page = (props: TaskPageProps): React.ReactElement<TaskPageProps> => {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <TopBar title={props.header}>{props.topBar}</TopBar>
            <div className={classes.main}>{props.children}</div>
        </div>
    );
};

export default Page;
