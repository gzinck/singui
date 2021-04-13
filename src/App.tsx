import React from 'react';
import { ThemeProvider } from '@material-ui/core/styles';
import { theme } from './components/theme';
import { BrowserRouter as Router, Switch, Redirect, Route } from 'react-router-dom';
import { INTERVAL_TASKS_ROUTE, MELODY_TASKS_ROUTE, PERFECT_PITCH_TASKS_ROUTE, RELATIVE_PITCH_TASKS_ROUTE, TUNER_ROUTE } from './routes';
import Tuner from './components/tasks/Tuner';
import PitchTasks from './components/tasks/PitchTasks';
import { scale12Notes } from './components/tasks/progressIndicators/StaticPitchMeter';
import IntervalTasks from './components/tasks/IntervalTasks';
import MelodyTasks from './components/tasks/MelodyTasks';
import UnsupportedBrowserAlert from './components/UnsupportedBrowserAlert';

function App() {
    return (
        <ThemeProvider theme={theme}>
            <Router>
                <Switch>
                    <Route path={TUNER_ROUTE} component={Tuner} />
                    <Route path={PERFECT_PITCH_TASKS_ROUTE} component={PitchTasks} />
                    <Route path={RELATIVE_PITCH_TASKS_ROUTE}>
                        <PitchTasks noteLabels={scale12Notes} keyNumber={7} />
                    </Route>
                    <Route path={INTERVAL_TASKS_ROUTE} component={IntervalTasks} />
                    <Route path={MELODY_TASKS_ROUTE} component={MelodyTasks} />
                    <Redirect to={TUNER_ROUTE} />
                </Switch>
            </Router>
            <UnsupportedBrowserAlert />
        </ThemeProvider>
    );
}

export default App;
