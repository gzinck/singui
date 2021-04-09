import React from 'react';
import TaskPage from './TaskPage';
import { convertHzToInterval, convertIntervalToString } from '../../utils/pitchConverter';
import IndicatorsContainer from './IndicatorsContainer';
import { voiceDetector } from '../detector/shared';
import { smoothPitch } from '../../utils/smoothPitch';
import StaticPitchMeter, { intervalsAscendingNotes } from '../pitchMeter/StaticPitchMeter';
import NoteProgressIndicator from '../progress/NoteProgressIndicator';
import { debounceTime } from 'rxjs/operators';

const IntervalTasks = (): React.ReactElement => {
    const [state, setState] = React.useState({
        startNum: 0,
        startHz: 0,
        endHz: 0,
        stage: 0,
        progress: 0,
        sustainLength: 5,
        intervalIdx: 0, // ID of the most recent update
        nextIntervalIdx: 0 // ID of the next interval
    });

    const intervals = [2, 7, 4, 12, 9, 11, 5];
    const interval = intervals[state.nextIntervalIdx % intervals.length];

    // Move on to the next stage once progress has maxed out for the current state
    // React.useEffect(() => {
    //     if (state.stage === 1 && state.progress >= state.sustainLength && state.intervalIdx === state.nextIntervalIdx) {
    //         setState((state) => ({ ...state, nextIntervalIdx: state.nextIntervalIdx + 1 }));
    //     }
    // }, [state]);

    React.useEffect(() => {
        const currPitch$ = voiceDetector.getState().pipe(smoothPitch());

        const sub1 = currPitch$.subscribe((nextState) =>
            setState((state) => {
                if (
                    // If in final stage and we have not moved on
                    (state.stage === 1 && state.intervalIdx === state.nextIntervalIdx) ||
                    // OR if in first stage and done and note is changed, continue
                    (state.stage === 0 && state.progress >= state.sustainLength && nextState.noteNum !== state.startNum)
                ) {
                    return {
                        startNum: state.startNum,
                        startHz: state.startHz,
                        endHz: nextState.hz,
                        stage: 1,
                        progress: state.sustainLength, // already done it, no extra time required
                        sustainLength: state.sustainLength,
                        intervalIdx: state.intervalIdx,
                        nextIntervalIdx: state.nextIntervalIdx
                    };
                }

                return {
                    startNum: nextState.noteNum,
                    startHz: nextState.hz,
                    endHz: nextState.hz,
                    stage: 0,
                    progress: state.startNum === nextState.noteNum ? state.progress + 1 : 0,
                    sustainLength: state.sustainLength,
                    intervalIdx: state.nextIntervalIdx,
                    nextIntervalIdx: state.nextIntervalIdx
                };
            })
        );

        const sub2 = currPitch$.pipe(debounceTime(500)).subscribe((nextState) =>
            setState((state) => {
                if (state.stage === 0) return state;
                return {
                    ...state,
                    nextIntervalIdx: state.intervalIdx + 1
                };
            })
        );

        return () => {
            sub1.unsubscribe();
            sub2.unsubscribe();
        };
    }, []);

    const intervalUnrounded = convertHzToInterval(state.startHz, state.endHz);
    const roundUp = intervalUnrounded % 1 >= 0.5;
    const endNum = roundUp ? Math.ceil(intervalUnrounded) : Math.floor(intervalUnrounded);
    const error = roundUp ? 1 - (intervalUnrounded % 1) : intervalUnrounded % 1;

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
                    startError={0}
                    startNum={1}
                    endError={error}
                    endNum={Math.max(0, Math.min(14, endNum + 1))}
                    target={1 + interval}
                />
                <NoteProgressIndicator
                    noteName={convertIntervalToString(endNum)}
                    isIncorrect={state.stage !== 0 && endNum !== intervals[state.intervalIdx % intervals.length]}
                    progress={Math.min(state.progress / state.sustainLength, 1)}
                />
            </IndicatorsContainer>
        </TaskPage>
    );
};

export default IntervalTasks;
