import React from 'react';
import TaskPage from './TaskPage';
import { convertIntervalToString } from '../../utils/pitchConverter';
import IndicatorsContainer from './IndicatorsContainer';
import { voiceDetector } from '../detector/shared';
import { smoothPitch } from '../../utils/smoothPitch';
import StaticPitchMeter, { intervalsAscendingNotes } from '../pitchMeter/StaticPitchMeter';
import NoteProgressIndicator from '../progress/NoteProgressIndicator';

const IntervalTasks = (): React.ReactElement => {
    const [state, setState] = React.useState({
        startNum: 0,
        endNum: 0,
        startError: 0,
        endError: 0,
        stage: 0,
        progress: 0,
        intervalIdx: 0, // ID of the most recent update
        sustainLength: 5
    });
    const [intervalIdx, setIntervalIdx] = React.useState(0); // ID of the current status

    const intervals = [2, 7, 4, 12, 9, 11, 5];
    const interval = intervals[intervalIdx % intervals.length];

    // Move on to the next stage once progress has maxed out for the current state
    React.useEffect(() => {
        if (state.stage === 1 && state.progress >= state.sustainLength && state.intervalIdx === intervalIdx) {
            setIntervalIdx((idx) => idx + 1);
        }
    }, [state, intervalIdx]);

    React.useEffect(() => {
        const currPitch$ = voiceDetector.getState().pipe(smoothPitch());

        const subscription = currPitch$.subscribe((nextState) =>
            setState((state) => {
                if (
                    // If in final stage and not done OR note is unchanged, continue
                    (state.stage === 1 && (state.progress < state.sustainLength || nextState.noteNum === state.endNum)) ||
                    // OR if in first stage and done and note is changed, continue
                    (state.stage === 0 && state.progress >= state.sustainLength && nextState.noteNum !== state.endNum)
                ) {
                    return {
                        startNum: state.startNum,
                        endNum: nextState.noteNum,
                        startError: state.startError,
                        endError: nextState.error,
                        stage: 1,
                        progress: state.endNum === nextState.noteNum ? state.progress + 1 : 0,
                        intervalIdx: state.intervalIdx,
                        sustainLength: state.sustainLength
                    };
                }

                return {
                    startNum: nextState.noteNum,
                    endNum: nextState.noteNum,
                    startError: nextState.error,
                    endError: nextState.error,
                    stage: 0,
                    progress: state.startNum === nextState.noteNum ? state.progress + 1 : 0,
                    intervalIdx: state.stage === 0 || state.endNum === nextState.noteNum ? state.intervalIdx : state.intervalIdx + 1,
                    sustainLength: state.sustainLength
                };
            })
        );

        return () => subscription.unsubscribe();
    }, []);

    return (
        <TaskPage
            header="Interval tasks"
            subheader={`Interval to sing: ${convertIntervalToString(interval)}`}
            sustainLength={state.sustainLength}
            setSustainLength={(sustainLength) => setState((state) => ({ ...state, sustainLength }))}
        >
            <IndicatorsContainer>
                <StaticPitchMeter
                    noteLabels={intervalsAscendingNotes}
                    startError={state.startError}
                    startNum={1}
                    endError={state.endError}
                    endNum={Math.max(-1, Math.min(13, state.endNum - state.startNum)) + 1}
                    target={1 + interval}
                />
                <NoteProgressIndicator
                    noteNum={state.endNum}
                    isIncorrect={state.stage !== 0 && state.endNum - state.startNum !== intervals[state.intervalIdx % intervals.length]}
                    progress={Math.min(state.progress / state.sustainLength, 1)}
                />
            </IndicatorsContainer>
        </TaskPage>
    );
};

export default IntervalTasks;
