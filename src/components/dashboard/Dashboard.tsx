import React from 'react';
import Page from '../page/Page';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../theme';
import StudyCard, { StudyStatus } from './StudyCard';
import { StudyProps } from '../study/Study';
import Skeleton from '@material-ui/lab/Skeleton';
import { generatePath, useHistory } from 'react-router-dom';
import { HOME_ROUTE, SIGNIN_ROUTE, STUDY_ROUTE } from '../../routes';
import { allStudies } from '../study/studyProps/allStudies';
import Button from '@material-ui/core/Button';
import { getAuth } from 'firebase/auth';
import { getAllStudies } from '../../utils/clients/studyClient';
import { combineLatest } from 'rxjs';
import { getParticipant } from '../../utils/clients/participantsClient';
import { numMusicalParticipants, numNonmusicalParticipants } from '../study/eligibility';

const useStyles = makeStyles<Theme>((theme) => ({
    desc: {
        marginBottom: theme.spacing(5)
    },
    skeleton: {
        width: '100%',
        height: '9rem',
        margin: theme.spacing(2, 0)
    }
}));

const defaultStatus = (status: StudyStatus): Record<string, StudyStatus> =>
    allStudies.reduce((acc, study) => ({ ...acc, [study.id]: status }), {});

const Dashboard = (): React.ReactElement => {
    const classes = useStyles();
    const history = useHistory();
    const [loading, setLoading] = React.useState(true);
    const [isEligible, setIsEligible] = React.useState(true);
    const [status, setStatus] = React.useState<Record<string, StudyStatus>>(defaultStatus(StudyStatus.LOCKED));

    React.useEffect(() => {
        const sub = combineLatest([getParticipant(), getAllStudies()]).subscribe({
            next: ([participant, studies]) => {
                if (
                    (participant.isMusical && participant.idx >= numMusicalParticipants) ||
                    (!participant.isMusical && participant.idx >= numNonmusicalParticipants)
                ) {
                    setIsEligible(false);
                    setStatus(defaultStatus(StudyStatus.LOCKED));
                } else {
                    setIsEligible(true);
                    const newStatus = defaultStatus(StudyStatus.AVAILABLE);
                    studies.forEach((study) => {
                        newStatus[study.studyId] = study.isDone ? StudyStatus.COMPLETED : StudyStatus.IN_PROGRESS;
                    });

                    // Deal with dependencies. We assume allStudies has already been top-sorted.
                    allStudies.forEach((study) => {
                        if (newStatus[study.id] === StudyStatus.COMPLETED) return;
                        study.dependencies.forEach((depId) => {
                            if (newStatus[depId] !== StudyStatus.COMPLETED) {
                                newStatus[study.id] = StudyStatus.LOCKED;
                            }
                        });
                    });
                    setStatus(newStatus);
                }

                setLoading(false);
            },
            error: (err) => {
                if (err.name === 'TimeoutError') history.push(`${SIGNIN_ROUTE}?next=${history.location.pathname}`);
                else console.error('Critical error retrieving data from database:', err);
            }
        });

        return () => sub.unsubscribe();
    }, [history]);

    const startStudy = (studyId: string) => {
        const path = generatePath(STUDY_ROUTE, { studyId });
        history.push(path);
    };

    const renderStudies = (studies: StudyProps[]) =>
        studies.map((study) => <StudyCard key={study.id} {...study} status={status[study.id]} onStart={() => startStudy(study.id)} />);

    const inProgressStudies = allStudies.filter((s) => status[s.id] === StudyStatus.IN_PROGRESS);
    const availableStudies = allStudies.filter((s) => status[s.id] === StudyStatus.AVAILABLE);
    const lockedStudies = allStudies.filter((s) => status[s.id] === StudyStatus.LOCKED);
    const completedStudies = allStudies.filter((s) => status[s.id] === StudyStatus.COMPLETED);

    const signOutButton = (
        <Button
            onClick={() => {
                getAuth().signOut();
                history.push(HOME_ROUTE);
            }}
        >
            Sign Out
        </Button>
    );

    return (
        <Page header="Dashboard" buttons={signOutButton} title="Dashboard">
            <Typography className={classes.desc}>Continue the study with the tasks below.</Typography>
            {loading ? (
                <>
                    <Typography variant="h5" gutterBottom>
                        Loading...
                    </Typography>
                    {allStudies.map((study) => (
                        <Skeleton key={study.id} variant="rect" className={classes.skeleton} />
                    ))}
                </>
            ) : (
                <>
                    {!isEligible ? (
                        <>
                            <Typography variant="h5" gutterBottom>
                                Sorry!
                            </Typography>
                            <Typography className={classes.desc}>
                                As mentioned when you signed up, we are not recruiting participants in your demographic right now. You'll
                                receive an email when you are eligible.
                            </Typography>
                        </>
                    ) : (
                        <>
                            <Typography variant="h5" gutterBottom>
                                Up next
                            </Typography>
                            {inProgressStudies.length > 0 || availableStudies.length > 0 ? (
                                <>
                                    {renderStudies(inProgressStudies)}
                                    {renderStudies(availableStudies)}
                                </>
                            ) : (
                                <Typography className={classes.desc}>
                                    Woohoo! You have completed the study. If you have not been contacted by an experiment facilitator within
                                    one week, email <a href="mailto:graeme.zinck@gmail.com?subject = Sing UI">graeme.zinck@gmail.com</a> to
                                    arrange your remuneration.
                                </Typography>
                            )}
                        </>
                    )}
                    {lockedStudies.length > 0 && (
                        <>
                            <Typography variant="h5" gutterBottom>
                                Locked
                            </Typography>
                            {renderStudies(lockedStudies)}
                        </>
                    )}
                    {completedStudies.length > 0 && (
                        <>
                            <Typography variant="h5" gutterBottom>
                                Completed
                            </Typography>
                            {renderStudies(completedStudies)}
                        </>
                    )}
                </>
            )}
        </Page>
    );
};

export default Dashboard;
