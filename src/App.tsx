import React from 'react';
import { ThemeProvider } from '@material-ui/core/styles';
import { theme } from './components/theme';
import { BrowserRouter as Router, Switch, Redirect, Route } from 'react-router-dom';
import {
    CALIBRATE_ROUTE,
    INTERVAL_TASKS_ROUTE,
    SIGNIN_ROUTE,
    MELODY_TASKS_ROUTE,
    RELATIVE_PITCH_TASKS_ROUTE,
    SIGNUP_ROUTE,
    TEST_FORM_ROUTE,
    TUNER_ROUTE,
    UNIVERSAL_TASKS_ROUTE
} from './routes';
import Tuner from './components/tasks/Tuner';
import UnsupportedBrowserAlert from './components/UnsupportedBrowserAlert';
import AllTasks from './components/tasks/AllTasks';
import { allTasksProps, intervalTaskProps, melodyTaskProps, pitchTaskProps } from './components/tasks/possibleTasks';
import { audioContext, defaultAudioContext } from './components/audio/audioContext';
import Calibration from './components/tasks/calibration/Calibration';
import Form from './components/form/Form';
import { firebaseConfig } from './firebaseConfig';
import { getApps, initializeApp } from 'firebase/app';
import LoginPage from './components/auth/LoginPage';

if (getApps().length === 0) initializeApp(firebaseConfig);

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
                        <Route path={TEST_FORM_ROUTE}>
                            <Form header="Test form" />
                        </Route>
                        <Route path={SIGNUP_ROUTE}>
                            <LoginPage />
                        </Route>
                        <Route path={SIGNIN_ROUTE}>
                            <LoginPage />
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
