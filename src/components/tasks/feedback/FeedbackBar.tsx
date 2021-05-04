import makeStyles from '@material-ui/core/styles/makeStyles';
import FailIcon from '@material-ui/icons/HighlightOff';
import SuccessIcon from '@material-ui/icons/CheckCircleOutline';
import { Theme } from '../../theme';
import React from 'react';
import { Subscription, timer } from 'rxjs';
import clsx from 'clsx';

interface Props {
    items: boolean[];
}

interface Item {
    success: boolean;
    idx: number;
}
const iconSize = '3rem';
const iconMargin = '0.25rem';

const useStyles = makeStyles<Theme>((theme) => ({
    root: {
        position: 'fixed',
        bottom: theme.spacing(5),
        right: theme.spacing(3),
        width: iconSize,
        display: 'flex',
        flexDirection: 'column-reverse'
    },
    '@keyframes moveUp': {
        from: {
            bottom: '-5rem',
            opactiy: 0
        }
    },
    icon: {
        position: 'absolute',
        width: iconSize,
        height: iconSize,
        transition: 'all 0.2s ease-in-out',
        animation: '$moveUp 0.2s',
        animationTimingFunction: 'ease-in-out'
    },
    success: {
        color: theme.palette.success.main
    },
    fail: {
        color: theme.palette.error.main
    }
}));

const FeedbackBar = ({ items }: Props): React.ReactElement => {
    const classes = useStyles();
    const [queue, setQueue] = React.useState<Item[]>([]);
    const lastIdx = React.useRef<number>(0);
    const subs = React.useRef<Subscription[]>([]);

    // Clean up all subscriptions at the end
    React.useEffect(() => {
        subs.current.forEach((sub) => sub.unsubscribe());
    }, []);

    React.useEffect(() => {
        // If no change, leave it
        if (items.length === lastIdx.current) return;
        else if (items.length === 0) setQueue([]);
        else {
            items
                .map((success, idx) => ({ success, idx }))
                .slice(lastIdx.current)
                .forEach((item, idx) => {
                    subs.current.push(timer(idx * 600).subscribe(() => setQueue((queue) => [...queue.slice(-3), item])));
                });
            lastIdx.current = items.length;
        }
    }, [items, queue]);

    return (
        <div className={classes.root}>
            {queue.map((item, queueIdx) => {
                const props = {
                    className: clsx(classes.icon, item.success ? classes.success : classes.fail),
                    style: {
                        bottom: `calc(${queue.length - queueIdx - 1} * (${iconSize} + ${iconMargin}))`,
                        opacity: `${Math.max(((3 - (queue.length - queueIdx - 1)) / 3) * 100, 0)}%`
                    },
                    key: item.idx
                };

                return item.success ? <SuccessIcon {...props} /> : <FailIcon {...props} />;
            })}
        </div>
    );
};

export default FeedbackBar;
