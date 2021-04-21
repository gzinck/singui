import React from 'react';
import { ThemeProvider } from '@material-ui/core/styles';
import { theme } from './components/theme';
import { BrowserRouter as Router, Switch, Redirect, Route } from 'react-router-dom';
import { INTERVAL_TASKS_ROUTE, MELODY_TASKS_ROUTE, RELATIVE_PITCH_TASKS_ROUTE, TUNER_ROUTE, UNIVERSAL_TASKS_ROUTE } from './routes';
import Tuner from './components/tasks/Tuner';
import UnsupportedBrowserAlert from './components/UnsupportedBrowserAlert';
import AllTasks from './components/tasks/AllTasks';
import { allTasksProps, intervalTaskProps, melodyTaskProps, pitchTaskProps } from './components/tasks/possibleTasks';

function App() {
    return (
        <ThemeProvider theme={theme}>
            <Router>
                <Switch>
                    <Route path={TUNER_ROUTE} component={Tuner} />
                    <Route path={RELATIVE_PITCH_TASKS_ROUTE}>
                        <AllTasks keyNumber={7} {...pitchTaskProps} />
                    </Route>
                    <Route path={INTERVAL_TASKS_ROUTE}>
                        <AllTasks keyNumber={7} {...intervalTaskProps} />
                    </Route>
                    <Route path={MELODY_TASKS_ROUTE}>
                        <AllTasks keyNumber={7} {...melodyTaskProps} />
                    </Route>
                    <Route path={UNIVERSAL_TASKS_ROUTE}>
                        <AllTasks keyNumber={7} {...allTasksProps} />
                    </Route>
                    <Redirect to={TUNER_ROUTE} />
                </Switch>
            </Router>
            <UnsupportedBrowserAlert />
        </ThemeProvider>
    );
}

export default App;
