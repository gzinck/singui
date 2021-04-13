import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../../theme';
import Fab from '@material-ui/core/Fab';
import Settings from '@material-ui/icons/Settings';
import Popover from '@material-ui/core/Popover';

interface OptionsPopoverProps {
    children?: React.ReactNode;
}

const useStyles = makeStyles<Theme>((theme) => ({
    fab: {
        position: 'fixed',
        bottom: theme.spacing(2),
        right: theme.spacing(2)
    },
    icon: {
        marginRight: theme.spacing(1)
    },
    children: {
        padding: theme.spacing(2),
        backgroundColor: theme.palette.background.paper,
        width: 'min(calc(100vw - 2rem), 20rem)'
    }
}));

const OptionsPopover = ({ children }: OptionsPopoverProps): React.ReactElement => {
    const classes = useStyles();

    const anchor = React.useRef(null);
    const [open, setOpen] = React.useState(false);

    return (
        <>
            <Fab
                variant="extended"
                color="primary"
                aria-label="options"
                className={classes.fab}
                ref={anchor}
                onClick={() => setOpen(!open)}
            >
                <Settings className={classes.icon} />
                Options
            </Fab>
            <Popover
                open={open}
                anchorEl={anchor.current}
                onClose={() => setOpen(false)}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right'
                }}
            >
                <div className={classes.children}>{children}</div>
            </Popover>
        </>
    );
};

export default OptionsPopover;
