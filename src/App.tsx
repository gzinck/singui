import React from 'react';
import { ThemeProvider } from '@material-ui/core/styles';
import { theme } from './components/theme';
import { BrowserRouter as Router, Switch, Redirect, Route } from 'react-router-dom';
import { TUNER_ROUTE } from './routes';
import Tuner from './components/Tuner';

function App() {
    return (
        <ThemeProvider theme={theme}>
            <Router>
                <Switch>
                    <Route path={TUNER_ROUTE} component={Tuner} />
                    <Redirect to={TUNER_ROUTE} />
                </Switch>
            </Router>
        </ThemeProvider>
    );
}

export default App;
