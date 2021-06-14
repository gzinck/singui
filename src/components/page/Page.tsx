import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../theme';
import TopBar from './TopBar';

interface TaskPageProps {
    children?: React.ReactNode;
    header: string;
}

const useStyles = makeStyles<Theme>((theme) => ({
    root: {
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        overflow: 'hidden',
        marginTop: '1rem',
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

// Add options using the <VolumeOptionsPopover /> if desired later on
const Page = (props: TaskPageProps): React.ReactElement<TaskPageProps> => {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <TopBar header={props.header} />
            <div className={classes.main}>{props.children}</div>
        </div>
    );
};

export default Page;
