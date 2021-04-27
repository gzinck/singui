import React from 'react';
import { ThemeProvider } from '@material-ui/core/styles';
import { theme } from './components/theme';
import { BrowserRouter as Router, Switch, Redirect, Route } from 'react-router-dom';
import {
    CALIBRATE_ROUTE,
    INTERVAL_TASKS_ROUTE,
    MELODY_TASKS_ROUTE,
    RELATIVE_PITCH_TASKS_ROUTE,
    TUNER_ROUTE,
    UNIVERSAL_TASKS_ROUTE
} from './routes';
import Tuner from './components/tasks/Tuner';
import UnsupportedBrowserAlert from './components/UnsupportedBrowserAlert';
import AllTasks from './components/tasks/AllTasks';
import { allTasksProps, intervalTaskProps, melodyTaskProps, pitchTaskProps } from './components/tasks/possibleTasks';
import { audioContext, defaultAudioContext } from './components/audio/audioContext';
import Calibration from './components/tasks/calibration/Calibration';

function App() {
    return (
        <audioContext.Provider value={defaultAudioContext}>
            <ThemeProvider theme={theme}>
                <Router>
                    <Switch>
                        <Route path={TUNER_ROUTE} component={Tuner} />
                        <Route path={RELATIVE_PITCH_TASKS_ROUTE}>
                            <AllTasks title="Pitch tasks" {...pitchTaskProps} />
                        </Route>
                        <Route path={INTERVAL_TASKS_ROUTE}>
                            <AllTasks title="Interval tasks" {...intervalTaskProps} />
                        </Route>
                        <Route path={MELODY_TASKS_ROUTE}>
                            <AllTasks title="Melody tasks" {...melodyTaskProps} />
                        </Route>
                        <Route path={UNIVERSAL_TASKS_ROUTE}>
                            <AllTasks title="All tasks" {...allTasksProps} />
                        </Route>
                        <Route path={CALIBRATE_ROUTE}>
                            <Calibration />
                        </Route>
                        <Redirect to={TUNER_ROUTE} />
                    </Switch>
                </Router>
                <UnsupportedBrowserAlert />
            </ThemeProvider>
        </audioContext.Provider>
    );
}

export default App;
