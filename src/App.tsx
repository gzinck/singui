import React from 'react';
import { ThemeProvider } from '@material-ui/core/styles';
import { theme } from './components/theme';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import {
    CALIBRATE_ROUTE,
    DASHBOARD_ROUTE,
    HOME_ROUTE,
    INTERVAL_TASKS_ROUTE,
    MELODY_TASKS_ROUTE,
    RELATIVE_PITCH_TASKS_ROUTE,
    UNIVERSAL_TASKS_ROUTE
} from './routes';
import { allTasksProps, intervalTaskProps, melodyTaskProps, pitchTaskProps } from './components/tasks/sing/possibleTasks';
import { audioContext, defaultAudioContext } from './components/audio/audioContext';
import Dashboard from './components/dashboard/Dashboard';
import RoutedSingTasks from './components/tasks/sing/routed/RoutedSingTasks';
import Calibration from './components/tasks/calibration/Calibration';
import HomePage from './components/home/HomePage';
import { setupFirebase } from './setup';
import { SingType } from './components/tasks/sing/routed/singCookies';

setupFirebase();

function App() {
    return (
        <audioContext.Provider value={defaultAudioContext}>
            <ThemeProvider theme={theme}>
                <Router>
                    <Switch>
                        <Route exact path={HOME_ROUTE} component={HomePage} />
                        <Route path={RELATIVE_PITCH_TASKS_ROUTE}>
                            <RoutedSingTasks {...pitchTaskProps} id={SingType.PITCH} />
                        </Route>
                        <Route path={INTERVAL_TASKS_ROUTE}>
                            <RoutedSingTasks {...intervalTaskProps} id={SingType.INTERVAL} />
                        </Route>
                        <Route path={MELODY_TASKS_ROUTE}>
                            <RoutedSingTasks {...melodyTaskProps} id={SingType.MELODY} />
                        </Route>
                        <Route path={UNIVERSAL_TASKS_ROUTE}>
                            <RoutedSingTasks {...allTasksProps} id={SingType.ALL} />
                        </Route>
                        <Route path={CALIBRATE_ROUTE}>
                            <Calibration />
                        </Route>
                        <Route path={DASHBOARD_ROUTE}>
                            <Dashboard />
                        </Route>
                        <Redirect to={HOME_ROUTE} />
                    </Switch>
                </Router>
            </ThemeProvider>
        </audioContext.Provider>
    );
}

export default App;
