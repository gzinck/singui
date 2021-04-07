import React from 'react';
import { ThemeProvider } from '@material-ui/core/styles';
import { theme } from './components/theme';
import { BrowserRouter as Router, Switch, Redirect, Route } from 'react-router-dom';
import { PERFECT_PITCH_TASKS_ROUTE, RELATIVE_PITCH_TASKS_ROUTE, TUNER_ROUTE } from './routes';
import Tuner from './components/tuner/Tuner';
import PitchTasks from './components/pitchTasks/PitchTasks';
import { scale12Notes } from './components/pitchMeter/StaticPitchMeter';

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
                    <Redirect to={TUNER_ROUTE} />
                </Switch>
            </Router>
        </ThemeProvider>
    );
}

export default App;
