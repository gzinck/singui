import React from 'react';
import Typography from '@material-ui/core/Typography';
import useAudio from '../../audio/useAudio';
import { getAudioURL } from '../../audio/getAudioURL';
import { TaskType } from '../../../utils/rxjs/recognizers/universalRecognizer';
import { TaskTarget } from '../target';
import Button from '@material-ui/core/Button';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../../theme';
import Slider from '@material-ui/core/Slider';
import Card from '@material-ui/core/Card';
import { tonic$ } from '../../detector/shared';
import Page from '../../page/Page';

const useStyles = makeStyles<Theme>((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
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
    spinner: {
        marginRight: '0.3rem'
    },
    card: {
        maxWidth: '100vw',
        marginTop: theme.spacing(3),
        padding: theme.spacing(4, 8)
    }
}));

const target: TaskTarget = {
    type: TaskType.INTERVAL,
    value: 12,
    startNote: 0
};

const maxNoteNum = 60;
const minNoteNum = 12;
const defaultNoteNum = 44;

const clamp = (n: number): number => Math.max(minNoteNum, Math.min(maxNoteNum, n));

const Calibration = (): React.ReactElement => {
    const classes = useStyles();
    const [startNote, setStartNote] = React.useState(defaultNoteNum);
    const [sliderVal, setSliderVal] = React.useState(0);
    const [isDone, setIsDone] = React.useState(false);
    const { play } = useAudio({ keyNumber: 0 });
    const currAudioURL = getAudioURL({ target, keyNumber: startNote % 12, octave: Math.floor(startNote / 12) });

    React.useEffect(() => {
        play(currAudioURL);
    }, [currAudioURL, play]);

    const onNext = () => {
        if (sliderVal !== 0) {
            setStartNote(clamp(startNote - sliderVal));
            setSliderVal(0);
        } else {
            tonic$.next(startNote);
            setIsDone(true);
        }
    };

    return (
        <Page header="Calibration">
            <div className={classes.root}>
                <Typography variant="h4" align="center" gutterBottom>
                    {isDone ? 'All done!' : 'Sing the two notes being played.'}
                </Typography>
                {!isDone && (
                    <Card className={classes.card}>
                        <Typography id="calibration-feedback-slider">How do the two notes sit in your vocal range?</Typography>
                        <Slider
                            track={false}
                            aria-labelledby="calibration-feedback-slider"
                            marks={[
                                {
                                    value: -8,
                                    label: 'Very low'
                                },
                                {
                                    value: 0,
                                    label: 'Perfect'
                                },
                                {
                                    value: 8,
                                    label: 'Very high'
                                }
                            ]}
                            min={-8}
                            max={8}
                            step={1}
                            value={sliderVal}
                            onChange={(_, val) => setSliderVal(val as number)}
                        />
                        <div className={classes.buttonBox}>
                            <Button onClick={() => play(currAudioURL)}>Replay sound</Button>
                            <Button onClick={onNext} variant="contained" color="primary">
                                Next
                            </Button>
                        </div>
                    </Card>
                )}
            </div>
        </Page>
    );
};

export default Calibration;
