import React from 'react';
import clsx from 'clsx';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../theme';

interface Props {
    hidden: boolean;
    children: React.ReactNode;
}

const useStyles = makeStyles<Theme>(() => ({
    root: {
        opacity: 1,
        transition: 'opacity 0.2s'
    },
    hidden: {
        opacity: 0
    }
}));

const Hideable = ({ hidden, children }: Props): React.ReactElement => {
    const classes = useStyles();
    return <div className={clsx(classes.root, hidden && classes.hidden)}>{children}</div>;
};

export default Hideable;
