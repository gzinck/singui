import React from 'react';
import { ThemeProvider } from '@material-ui/core/styles';
import { theme } from './components/theme';
import { BrowserRouter as Router, Switch, Redirect, Route } from 'react-router-dom';
import { PITCH_TASKS_ROUTE, TUNER_ROUTE } from './routes';
import Tuner from './components/tuner/Tuner';
import PitchTasks from './components/pitchTasks/PitchTasks';

function App() {
    return (
        <ThemeProvider theme={theme}>
            <Router>
                <Switch>
                    <Route path={TUNER_ROUTE} component={Tuner} />
                    <Route path={PITCH_TASKS_ROUTE} component={PitchTasks} />
                    <Redirect to={TUNER_ROUTE} />
                </Switch>
            </Router>
        </ThemeProvider>
    );
}

export default App;
