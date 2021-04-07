import { Theme } from '../theme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React from 'react';
import StaticPitchMeter from '../pitchMeter/StaticPitchMeter';
import { voiceDetector } from '../detector/shared';
import { smoothPitch } from '../../utils/smoothPitch';
import { convertNoteToString } from '../../utils/pitchConverter';
import NoteProgressIndicator from '../progress/NoteProgressIndicator';
import useAudio from "../audio/useAudio";

const useStyles = makeStyles<Theme>((theme) => ({
    root: {
        backgroundColor: theme.palette.background.default,
        minHeight: '100vh',
        boxSizing: 'border-box',
        margin: 0,
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.palette.text.primary
    },
    indicators: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
    },
    progressIndicator: {
        display: 'flex'
    }
}));

const key = 7;
const possibleTargets = [0, 2, 4, 5, 7, 9, 11].map(n => (n + key) % 12);
const targets = [0, 3, 5, 4, 1, 2, 1, 6, 0, 6, 2, 4, 3, 5].map(n => possibleTargets[n]);
const sustainLength = 10;

const PitchTasks = (): React.ReactElement => {
    const classes = useStyles();
    const [state, setState] = React.useState({
        noteNum: 0,
        progress: 0,
        error: 0,
        targetIdx: 0
    });
    const [targetIdx, setTargetIdx] = React.useState(0);
    const target = targets[targetIdx % targets.length];

    // const pause$ = React.useRef(new Subject());

    useAudio();

    React.useEffect(() => {
        if (state.progress >= sustainLength && state.targetIdx === targetIdx) {
            setTargetIdx((idx) => idx + 1);
        }
    }, [state, targetIdx]);

    // Get updates as the user sings
    React.useEffect(() => {
        const subscription = voiceDetector
            .getState()
            .pipe(smoothPitch())
            .subscribe((nextState) => {
                setState((state) => ({
                    ...nextState,
                    progress: state.noteNum === nextState.noteNum ? state.progress + 1 : 0,
                    targetIdx: state.noteNum === nextState.noteNum || state.progress < sustainLength ? state.targetIdx : state.targetIdx + 1
                }));
            });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <div className={classes.root}>
            <h1>Pitch Tasks</h1>
            <h2>{convertNoteToString(target, false)}</h2>
            <div className={classes.indicators}>
                <StaticPitchMeter noteNum={state.noteNum} error={state.error} target={target} />
                <div className={classes.progressIndicator}>
                    <NoteProgressIndicator
                        noteNum={state.noteNum}
                        isIncorrect={state.noteNum % 12 !== targets[state.targetIdx % targets.length]}
                        progress={Math.min(state.progress / sustainLength, 1)}
                    />
                </div>
            </div>
            {/*<AudioPlayerComponent/>*/}
        </div>
    );
};

export default PitchTasks;
