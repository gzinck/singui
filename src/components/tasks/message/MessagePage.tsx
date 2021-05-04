import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../../theme';
import Page from '../../page/Page';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { CircularProgress } from '@material-ui/core';

export interface MessageProps {
    header: string;
    text?: string;
    children?: React.ReactNode;
    onComplete?: () => void;
    isLoading?: boolean;
}

const useStyles = makeStyles<Theme>((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '90%',
        maxWidth: '40rem',
        margin: theme.spacing(2)
    },
    buttonBox: {
        margin: theme.spacing(2, 0, 0),
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        '& > *': {
            margin: theme.spacing(0, 2)
        }
    },
    loading: {
        marginRight: theme.spacing(1)
    }
}));

const MessagePage = ({ header, text, children, onComplete, isLoading }: MessageProps): React.ReactElement<MessageProps> => {
    const classes = useStyles();
    return (
        <Page header={header}>
            <div className={classes.root}>
                <Typography variant="h4" align="center" gutterBottom>
                    {header}
                </Typography>
                {text && (
                    <Typography align="center" gutterBottom>
                        {text}
                    </Typography>
                )}
                {children}
                <div className={classes.buttonBox}>
                    <Button onClick={onComplete} variant="contained" color="primary" disabled={isLoading}>
                        {isLoading && <CircularProgress className={classes.loading} size="1rem" />}
                        Next
                    </Button>
                </div>
            </div>
        </Page>
    );
};

export default MessagePage;
