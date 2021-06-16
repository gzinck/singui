import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../../theme';
import Page from '../../page/Page';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CircularProgress from '@material-ui/core/CircularProgress';

export interface MessageProps {
    header: string;
    text?: string;
    children?: React.ReactNode;
    onComplete?: () => void;
    isLoading?: boolean;
    buttons?: React.ReactNode;
}

const useStyles = makeStyles<Theme>((theme) => ({
    root: {
        position: 'relative',
        height: 'calc(100vh - 8rem)',
        width: '100%'
    },
    messageBox: {
        margin: '0 max(1rem, calc(50% - 15rem))',
        maxWidth: '30rem',
        padding: theme.spacing(3),
        marginBottom: theme.spacing(2),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
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

const MessagePage = ({ header, text, children, onComplete, isLoading, buttons }: MessageProps): React.ReactElement<MessageProps> => {
    const classes = useStyles();
    return (
        <Page header={header}>
            <div className={classes.root}>
                <Card className={classes.messageBox}>
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
                        {buttons}
                        <Button onClick={onComplete} variant="contained" color="primary" disabled={isLoading}>
                            {isLoading && <CircularProgress className={classes.loading} size="1rem" />}
                            Next
                        </Button>
                    </div>
                </Card>
            </div>
        </Page>
    );
};

export default MessagePage;
