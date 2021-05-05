import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../../theme';
import React from 'react';
import Page from '../../page/Page';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { CircularProgress, LinearProgress } from '@material-ui/core';
import { interval, Subscription } from 'rxjs';
import recordAudio from '../../audio/recordAudio';
import { take } from 'rxjs/operators';

export interface RecordProps {
    header?: string;
    onComplete?: (audio: Blob) => void;
}

const defaultHeader = 'Audio quality test';
const recordTime = 5000;

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
    progress: {
        width: '100%',
        margin: theme.spacing(2, 0)
    },
    loading: {
        marginRight: theme.spacing(1)
    }
}));

enum State {
    NOT_STARTED,
    LOADING,
    DONE,
    UPLOADING
}

const getButtonText = (state: State): string => {
    switch (state) {
        case State.NOT_STARTED:
            return 'Record';
        case State.LOADING:
            return 'In progress...';
        case State.DONE:
            return 'Next';
        case State.UPLOADING:
            return 'Loading...';
    }
};

const RecordPage = ({ header, onComplete }: RecordProps): React.ReactElement<RecordProps> => {
    const classes = useStyles();
    const [state, setState] = React.useState<State>(State.NOT_STARTED);
    const [progress, setProgress] = React.useState<number>(0);
    const subscriptions = React.useRef<Subscription[]>([]);
    const blob = React.useRef<Blob>();

    React.useEffect(() => {
        subscriptions.current = [];
        return () => subscriptions.current.forEach((sub) => sub.unsubscribe());
    }, []);

    const onClick = () => {
        if (state === State.NOT_STARTED) {
            subscriptions.current.push(
                recordAudio(recordTime).subscribe({
                    next: (recording) => {
                        blob.current = recording;
                        setState(State.DONE);
                    },
                    error: (e) => {
                        setState(State.NOT_STARTED);
                        console.error('Critical error recording audio:', e);
                    }
                }),
                interval(recordTime / 10)
                    .pipe(take(10))
                    .subscribe((n) => setProgress((n + 1) * 10))
            );
            setState(State.LOADING);
        } else {
            setState(State.UPLOADING);
            onComplete && blob.current && onComplete(blob.current);
        }
    };

    const isLoading = [State.LOADING, State.UPLOADING].includes(state);

    return (
        <Page header={header || defaultHeader}>
            <div className={classes.root}>
                <Typography variant="h4" align="center" gutterBottom>
                    {header}
                </Typography>
                <Typography align="center" gutterBottom>
                    In this step, we need to record {recordTime / 1000} seconds of audio to ensure there is minimal background noise.
                </Typography>
                <LinearProgress className={classes.progress} variant="determinate" value={progress} />
                <div className={classes.buttonBox}>
                    <Button onClick={onClick} variant="contained" color="primary" disabled={isLoading}>
                        {isLoading && <CircularProgress className={classes.loading} size="1rem" />}
                        {getButtonText(state)}
                    </Button>
                </div>
            </div>
        </Page>
    );
};

export default RecordPage;
