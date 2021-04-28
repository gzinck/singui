import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../theme';
import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import RadioIcon from '@material-ui/icons/Radio';
import MusicNoteIcon from '@material-ui/icons/MusicNote';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import {
    CALIBRATE_ROUTE,
    INTERVAL_TASKS_ROUTE,
    MELODY_TASKS_ROUTE,
    RELATIVE_PITCH_TASKS_ROUTE,
    TUNER_ROUTE,
    UNIVERSAL_TASKS_ROUTE
} from '../../routes';
import List from '@material-ui/core/List';
import LinkedListItem from '../common/LinkedListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';

const useStyles = makeStyles<Theme>((theme) => ({
    menuBtn: {},
    drawer: {
        width: '17rem'
    },
    header: {
        padding: theme.spacing(2)
    },
    h3: {
        padding: theme.spacing(2, 2, 0, 2)
    },
    link: {
        color: theme.palette.primary.main,
        '&:hover, &:focus, &:active': {
            color: theme.palette.primary.light
        }
    }
}));

const Drawer = (): React.ReactElement => {
    const classes = useStyles();
    const [menuOpen, setMenuOpen] = React.useState(false);

    return (
        <>
            <IconButton className={classes.menuBtn} aria-label="navigation" onClick={() => setMenuOpen((o) => !o)}>
                <MenuIcon />
            </IconButton>
            <SwipeableDrawer onClose={() => setMenuOpen(false)} onOpen={() => setMenuOpen(true)} open={menuOpen}>
                <div className={classes.drawer}>
                    <div className={classes.header}>
                        <h2>Vox Sandboxx</h2>
                        <p>
                            An experiment by{' '}
                            <a className={classes.link} href="https://graemezinck.ca">
                                Graeme Zinck
                            </a>
                            .
                        </p>
                    </div>
                    <Divider />
                    <h3 className={classes.h3}>Setup</h3>
                    <List>
                        <LinkedListItem to={CALIBRATE_ROUTE}>
                            <ListItemIcon>
                                <AssignmentTurnedInIcon />
                            </ListItemIcon>
                            <ListItemText primary="Calibration" />
                        </LinkedListItem>
                    </List>
                    <Divider />
                    <h3 className={classes.h3}>Official tasks</h3>
                    <List>
                        <LinkedListItem to={RELATIVE_PITCH_TASKS_ROUTE}>
                            <ListItemIcon>
                                <MusicNoteIcon />
                            </ListItemIcon>
                            <ListItemText primary="Pitch tasks" />
                        </LinkedListItem>
                        <LinkedListItem to={INTERVAL_TASKS_ROUTE}>
                            <ListItemIcon>
                                <MusicNoteIcon />
                            </ListItemIcon>
                            <ListItemText primary="Interval tasks" />
                        </LinkedListItem>
                        <LinkedListItem to={MELODY_TASKS_ROUTE}>
                            <ListItemIcon>
                                <MusicNoteIcon />
                            </ListItemIcon>
                            <ListItemText primary="Melody tasks" />
                        </LinkedListItem>
                        <LinkedListItem to={UNIVERSAL_TASKS_ROUTE}>
                            <ListItemIcon>
                                <MusicNoteIcon />
                            </ListItemIcon>
                            <ListItemText primary="All tasks" />
                        </LinkedListItem>
                    </List>
                    <Divider />
                    <h3 className={classes.h3}>For fun</h3>
                    <List>
                        <LinkedListItem to={TUNER_ROUTE}>
                            <ListItemIcon>
                                <RadioIcon />
                            </ListItemIcon>
                            <ListItemText primary="Tuner" />
                        </LinkedListItem>
                    </List>
                </div>
            </SwipeableDrawer>
        </>
    );
};

export default Drawer;
