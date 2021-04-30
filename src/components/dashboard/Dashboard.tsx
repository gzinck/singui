import React from 'react';
import Page from '../page/Page';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../theme';
import StudyCard, { StudyStatus } from './StudyCard';
import { StudyProps } from '../study/Study';
import { currUser$ } from '../auth/observableUser';
import { mergeMap, timeout } from 'rxjs/operators';
import { collection, getDocs, getFirestore, QueryDocumentSnapshot } from 'firebase/firestore';
import Skeleton from '@material-ui/lab/Skeleton';
import { generatePath, useHistory } from 'react-router-dom';
import { SIGNIN_ROUTE, STUDY_ROUTE } from '../../routes';
import { allStudies } from '../study/studyProps/allStudies';

const useStyles = makeStyles<Theme>((theme) => ({
    root: {
        margin: theme.spacing(5, 0),
        width: '90%',
        maxWidth: '40rem'
    },
    desc: {
        marginBottom: theme.spacing(5)
    },
    skeleton: {
        width: '100%',
        height: '9rem',
        margin: theme.spacing(2, 0)
    }
}));

const defaultStatus = allStudies.reduce((acc, study) => ({ ...acc, [study.id]: StudyStatus.AVAILABLE }), {});

const Dashboard = (): React.ReactElement => {
    const classes = useStyles();
    const history = useHistory();
    const [loading, setLoading] = React.useState(true);
    const [status, setStatus] = React.useState<Record<string, StudyStatus>>(defaultStatus);

    React.useEffect(() => {
        const db = getFirestore();
        const sub = currUser$
            .pipe(
                timeout(1000),
                mergeMap((user) => getDocs(collection(db, 'users', user.uid, 'studies')))
            )
            .subscribe({
                next: (results) => {
                    const newStatus: Record<string, StudyStatus> = { ...defaultStatus };
                    results.forEach((doc: QueryDocumentSnapshot<unknown>) => {
                        newStatus[doc.id] = (doc.data() as { isDone: boolean }).isDone ? StudyStatus.COMPLETED : StudyStatus.IN_PROGRESS;
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

    return (
        <Page header="Dashboard">
            <div className={classes.root}>
                <Typography variant="h3" gutterBottom>
                    Dashboard
                </Typography>
                <Typography className={classes.desc}>Pick a study to continue.</Typography>
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
                        <Typography variant="h5" gutterBottom>
                            Up next
                        </Typography>
                        {inProgressStudies.length > 0 || availableStudies.length > 0 ? (
                            <>
                                {renderStudies(inProgressStudies)}
                                {renderStudies(availableStudies)}
                            </>
                        ) : (
                            <Typography className={classes.desc}>Woohoo! You have completed all the studies you have access to.</Typography>
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
            </div>
        </Page>
    );
};

export default Dashboard;
