import React from 'react';
import Page from '../page/Page';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../theme';
import StudyCard, { StudyStatus } from './StudyCard';
import { useHistory } from 'react-router-dom';
import { CALIBRATE_ROUTE, HOME_ROUTE, INTERVAL_TASKS_ROUTE, MELODY_TASKS_ROUTE, RELATIVE_PITCH_TASKS_ROUTE } from '../../routes';
import Button from '@material-ui/core/Button';
import { tonicWasSet$ } from '../detector/shared';
import { getDidSing, SingType } from '../tasks/sing/routed/singCookies';

const useStyles = makeStyles<Theme>((theme) => ({
    header: {
        margin: theme.spacing(5, 0, 2)
    }
}));

const Dashboard = (): React.ReactElement => {
    const classes = useStyles();
    const history = useHistory();
    const [hasTonic, setHasTonic] = React.useState(false);

    React.useEffect(() => {
        const sub = tonicWasSet$.subscribe((wasSet) => setHasTonic(wasSet));
        return () => sub.unsubscribe();
    }, []);

    const homeButton = <Button onClick={() => history.push(HOME_ROUTE)}>Exit</Button>;

    return (
        <Page header="Dashboard" buttons={homeButton} title="Dashboard">
            <StudyCard
                name="Calibration"
                description={
                    hasTonic
                        ? 'You can optionally recalibrate the system here.'
                        : 'Before you begin, you need to calibrate the system to suit your vocal range.'
                }
                time={3}
                onStart={() => history.push(CALIBRATE_ROUTE)}
                status={StudyStatus.AVAILABLE}
            />
            <Typography className={classes.header} variant="h4" gutterBottom>
                Techniques
            </Typography>
            <Typography>Try out the interaction techniques below.</Typography>
            <StudyCard
                name="Pitch technique"
                description="The pitch technique involves singing a single note."
                time={3}
                onStart={() => history.push(RELATIVE_PITCH_TASKS_ROUTE)}
                status={!hasTonic ? StudyStatus.LOCKED : getDidSing(SingType.PITCH) ? StudyStatus.IN_PROGRESS : StudyStatus.AVAILABLE}
            />
            <StudyCard
                name="Interval technique"
                description="The interval technique involves singing two notes in sequence."
                time={3}
                onStart={() => history.push(INTERVAL_TASKS_ROUTE)}
                status={!hasTonic ? StudyStatus.LOCKED : getDidSing(SingType.INTERVAL) ? StudyStatus.IN_PROGRESS : StudyStatus.AVAILABLE}
            />
            <StudyCard
                name="Melody technique"
                description="The melody technique involves singing three notes in sequence."
                time={3}
                onStart={() => history.push(MELODY_TASKS_ROUTE)}
                status={!hasTonic ? StudyStatus.LOCKED : getDidSing(SingType.MELODY) ? StudyStatus.IN_PROGRESS : StudyStatus.AVAILABLE}
            />
        </Page>
    );
};

export default Dashboard;
