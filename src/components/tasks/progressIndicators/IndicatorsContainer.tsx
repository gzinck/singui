import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../../theme';

interface IndicatorsContainerProps {
    children?: React.ReactNode;
}

const useStyles = makeStyles<Theme>((theme) => ({
    root: {
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'center',
        flexDirection: 'column-reverse',
        width: '100%',
        height: '75vh',
        [theme.breakpoints.up('sm')]: {
            flexDirection: 'row'
        }
    }
}));

const IndicatorsContainer = ({ children }: IndicatorsContainerProps): React.ReactElement<IndicatorsContainerProps> => {
    const classes = useStyles();
    return <div className={classes.root}>{children}</div>;
};

export default IndicatorsContainer;
