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
    UNIVERSAL_TASKS_ROUTE,
    DASHBOARD_ROUTE,
    STUDY_ROUTE
} from './routes';
import Tuner from './components/tasks/tuner/Tuner';
import { allTasksProps, intervalTaskProps, melodyTaskProps, pitchTaskProps } from './components/tasks/sing/possibleTasks';
import { audioContext, defaultAudioContext } from './components/audio/audioContext';
import Form from './components/tasks/form/Form';
import { firebaseConfig } from './firebaseConfig';
import { getApps, initializeApp } from 'firebase/app';
import LoginPage from './components/auth/LoginPage';
import Dashboard from './components/dashboard/Dashboard';
import { testForm } from './components/tasks/form/testForm';
import RoutedStudy from './components/study/RoutedStudy';
import RoutedSingTasks from './components/tasks/sing/RoutedSingTasks';
import RecordPage from './components/tasks/record/RecordPage';
import Calibration from './components/tasks/calibration/Calibration';

if (getApps().length === 0) initializeApp(firebaseConfig);

function App() {
    return (
        <audioContext.Provider value={defaultAudioContext}>
            <ThemeProvider theme={theme}>
                <Router>
                    <Switch>
                        <Route path={TUNER_ROUTE} component={Tuner} />
                        <Route path={RELATIVE_PITCH_TASKS_ROUTE}>
                            <RoutedSingTasks {...pitchTaskProps} />
                        </Route>
                        <Route path={INTERVAL_TASKS_ROUTE}>
                            <RoutedSingTasks {...intervalTaskProps} />
                        </Route>
                        <Route path={MELODY_TASKS_ROUTE}>
                            <RoutedSingTasks {...melodyTaskProps} />
                        </Route>
                        <Route path={UNIVERSAL_TASKS_ROUTE}>
                            <RoutedSingTasks {...allTasksProps} />
                        </Route>
                        <Route path={CALIBRATE_ROUTE}>
                            <Calibration />
                        </Route>
                        <Route path={TEST_FORM_ROUTE}>
                            <Form header="Test form" form={testForm} />
                        </Route>
                        <Route path={SIGNUP_ROUTE}>
                            <LoginPage />
                        </Route>
                        <Route path={SIGNIN_ROUTE}>
                            <LoginPage />
                        </Route>
                        <Route path={DASHBOARD_ROUTE}>
                            <Dashboard />
                        </Route>
                        <Route path="/record">
                            <RecordPage />
                        </Route>
                        <Route path={STUDY_ROUTE} component={RoutedStudy} />
                        <Redirect to={SIGNIN_ROUTE} />
                    </Switch>
                </Router>
            </ThemeProvider>
        </audioContext.Provider>
    );
}

export default App;
