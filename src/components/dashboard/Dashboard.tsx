import React from 'react';
import Page from '../page/Page';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../theme';
import StudyCard, { StudyStatus } from './StudyCard';

const useStyles = makeStyles<Theme>((theme) => ({
    root: {
        margin: theme.spacing(5, 0),
        width: '90%',
        maxWidth: '40rem'
    },
    desc: {
        marginBottom: theme.spacing(5)
    }
}));

interface Study {
    id: string;
    name: string;
    description: string;
    time: number;
}

const studies: Study[] = [
    {
        id: 'consent',
        name: 'Consent & demographics',
        description: 'A preliminary study',
        time: 4
    },
    {
        id: 'study1',
        name: 'Study 1',
        description: 'Some study goes here',
        time: 9
    },
    {
        id: 'study2',
        name: 'Study 2',
        description: 'Some study goes here',
        time: 14
    }
];

const getStatus = (id: string): StudyStatus => {
    // TODO: add logic that queries the database for what's been done and determine status using that
    if (id === 'consent') return StudyStatus.AVAILABLE;
    else if (id === 'study1') return StudyStatus.COMPLETED;
    else return StudyStatus.LOCKED;
};

const Dashboard = (): React.ReactElement => {
    const classes = useStyles();

    const startStudy = (id: string) => {
        console.log(id);
    };

    const renderStudies = (studies: Study[]) =>
        studies.map((study) => <StudyCard key={study.id} {...study} status={getStatus(study.id)} onStart={() => startStudy(study.id)} />);

    return (
        <Page header="Dashboard">
            <div className={classes.root}>
                <Typography variant="h3" gutterBottom>
                    Dashboard
                </Typography>
                <Typography className={classes.desc}>To continue participating in this study, click "Start" on the next task.</Typography>
                <Typography variant="h5" gutterBottom>
                    Up next
                </Typography>
                {renderStudies(studies.filter((s) => getStatus(s.id) === StudyStatus.AVAILABLE))}
                <Typography variant="h5" gutterBottom>
                    Locked
                </Typography>
                {renderStudies(studies.filter((s) => getStatus(s.id) === StudyStatus.LOCKED))}
                <Typography variant="h5" gutterBottom>
                    Completed
                </Typography>
                {renderStudies(studies.filter((s) => getStatus(s.id) === StudyStatus.COMPLETED))}
            </div>
        </Page>
    );
};

export default Dashboard;
