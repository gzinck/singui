import { Theme } from '../theme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React from 'react';
import StaticPitchMeter from '../pitchMeter/StaticPitchMeter';
import { voiceDetector } from '../detector/shared';
import { smoothPitch } from '../../utils/smoothPitch';
import { convertNoteToString } from '../../utils/pitchConverter';
import NoteProgressIndicator from '../progress/NoteProgressIndicator';
import useAudio from '../audio/useAudio';
import Slider from '@material-ui/core/Slider';
import OptionsPopover from '../options/OptionsPopover';

interface PitchTasksProps {
    noteLabels?: string[];
    keyNumber: number;
}

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
        color: theme.palette.text.primary,
        overflow: 'hidden',
        '& h1': {
            textAlign: 'center'
        }
    },
    indicators: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column-reverse',
        [theme.breakpoints.up('sm')]: {
            flexDirection: 'row'
        }
    },
    progressIndicator: {
        display: 'flex',
        flexShrink: 1,
        overflow: 'hidden'
    }
}));

const PitchTasks = (props: PitchTasksProps): React.ReactElement<PitchTasksProps> => {
    const classes = useStyles();
    const [state, setState] = React.useState({
        noteNum: 0,
        progress: 0,
        error: 0,
        targetIdx: 0,
        sustainLength: 5
    });
    const [targetIdx, setTargetIdx] = React.useState(0);

    const possibleTargets = [0, 2, 4, 5, 7, 9, 11];
    const targets = [0, 3, 5, 4, 1, 2, 1, 6, 0, 6, 2, 4, 3, 5].map((n) => possibleTargets[n]);

    const target = targets[targetIdx % targets.length] + props.keyNumber;
    console.log(targets);
    console.log(target);

    const setGain = useAudio();

    React.useEffect(() => {
        console.log(state);
        if (state.progress >= state.sustainLength && state.targetIdx === targetIdx) {
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
                    sustainLength: state.sustainLength,
                    progress: state.noteNum === nextState.noteNum ? state.progress + 1 : 0,
                    targetIdx:
                        state.noteNum === nextState.noteNum || state.progress < state.sustainLength ? state.targetIdx : state.targetIdx + 1
                }));
            });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <div className={classes.root}>
            <h1>Pitch tasks</h1>
            <h2>Pitch to sing: {convertNoteToString(target, false)}</h2>
            <div className={classes.indicators}>
                <StaticPitchMeter
                    noteLabels={props.noteLabels}
                    noteNum={state.noteNum - props.keyNumber}
                    error={state.error}
                    target={(target + 12 - props.keyNumber) % 12}
                />
                <div className={classes.progressIndicator}>
                    <NoteProgressIndicator
                        noteNum={state.noteNum}
                        isIncorrect={state.noteNum % 12 !== (targets[state.targetIdx % targets.length] + props.keyNumber) % 12}
                        progress={Math.min(state.progress / state.sustainLength, 1)}
                    />
                </div>
            </div>
            <OptionsPopover>
                <h4>Audio volume</h4>
                <Slider
                    onChange={(_, val) => setGain(typeof val === 'number' ? val : val[0])}
                    min={0}
                    max={1}
                    step={0.05}
                    defaultValue={1}
                    valueLabelDisplay="auto"
                />
                <h4>Pitch selection time</h4>
                <p>Shorter is faster, but more challenging</p>
                <Slider
                    value={state.sustainLength}
                    onChange={(_, val) => setState((state) => ({ ...state, sustainLength: typeof val === 'number' ? val : val[0] }))}
                    min={2}
                    max={10}
                    step={1}
                    valueLabelDisplay="auto"
                />
            </OptionsPopover>
        </div>
    );
};

PitchTasks.defaultProps = {
    keyNumber: 0
};

export default PitchTasks;
