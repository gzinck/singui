import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../../theme';
import { SingTaskResult } from '../../../utils/rxjs/taskProgress';
import MessagePage from './MessagePage';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';

export interface PerformanceMessageProps {
    header?: string;
    multiAttempt?: boolean;
    onComplete?: () => void;
    results: SingTaskResult<any>[];
}

const useStyles = makeStyles<Theme>((theme) => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: '90%'
    },
    progressBox: {
        width: '10rem',
        textAlign: 'center',
        margin: '1rem'
    },
    circleBox: {
        position: 'relative'
    },
    progressOK: {
        color: theme.palette.success.main
    },
    progressBad: {
        color: theme.palette.error.main
    },
    abs: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    percentage: {
        fontWeight: 300
    },
    description: {
        marginTop: '1rem'
    }
}));

const passingGrade = 60;

const PerformanceMessagePage = ({ header, results, multiAttempt, onComplete }: PerformanceMessageProps) => {
    const classes = useStyles();
    const numDone = results.reduce((acc, curr) => (curr.success ? acc + 1 : acc), 0);
    const numAttempts = results.reduce((acc, curr) => acc + curr.attempts, 0);
    const numSingle = results.reduce((acc, curr) => (curr.success && curr.attempts === 1 ? acc + 1 : acc), 0);

    const stats = [
        {
            percentage: (numDone * 100) / results.length,
            message: `${numDone}/${results.length} Tasks Successful`
        },
        ...(multiAttempt
            ? [
                  {
                      percentage: (numSingle * 100) / results.length,
                      message: `${numSingle}/${results.length} Tasks Successful in One Attempt`
                  },
                  {
                      percentage: (numDone * 100) / numAttempts,
                      message: `${numDone}/${numAttempts} Attempts Successful`
                  }
              ]
            : [])
    ];

    return (
        <MessagePage header={header || 'Results'} onComplete={onComplete}>
            <div className={classes.root}>
                {stats.map(({ percentage, message }) => (
                    <div className={classes.progressBox}>
                        <div className={classes.circleBox}>
                            <CircularProgress
                                variant="determinate"
                                size="10rem"
                                thickness={2}
                                value={percentage}
                                className={percentage < passingGrade ? classes.progressBad : classes.progressOK}
                            />
                            <div className={classes.abs}>
                                <Typography variant="h4" className={classes.percentage}>
                                    {Math.round(percentage)}%
                                </Typography>
                            </div>
                        </div>
                        <Typography variant="h5" className={classes.description}>
                            {message}
                        </Typography>
                    </div>
                ))}
            </div>
        </MessagePage>
    );
};

PerformanceMessagePage.defaultProps = {
    multiAttempt: true
};

export default PerformanceMessagePage;
