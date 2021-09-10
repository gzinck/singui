import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../theme';
import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import DashboardIcon from '@material-ui/icons/Dashboard';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import { DASHBOARD_ROUTE } from '../../routes';
import List from '@material-ui/core/List';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import { ListItem } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import OptionList from '../tasks/sing/routed/OptionList';

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
    const history = useHistory();
    const [menuOpen, setMenuOpen] = React.useState(false);

    const routeTo = (url: string) => () => {
        setMenuOpen(false);
        history.push(url);
    };

    return (
        <>
            <IconButton className={classes.menuBtn} aria-label="navigation" onClick={() => setMenuOpen((o) => !o)}>
                <MenuIcon />
            </IconButton>
            <SwipeableDrawer onClose={() => setMenuOpen(false)} onOpen={() => setMenuOpen(true)} open={menuOpen}>
                <div className={classes.drawer}>
                    <div className={classes.header}>
                        <h2>Sing UI</h2>
                        <p>
                            An experiment by{' '}
                            <a className={classes.link} href="https://graemezinck.ca">
                                Graeme Zinck
                            </a>
                            .
                        </p>
                    </div>
                    <Divider />
                    <List>
                        <ListItem button onClick={routeTo(DASHBOARD_ROUTE)}>
                            <ListItemIcon>
                                <DashboardIcon />
                            </ListItemIcon>
                            <ListItemText primary="Dashboard" />
                        </ListItem>
                    </List>
                    <Divider />
                    <OptionList />
                </div>
            </SwipeableDrawer>
        </>
    );
};

export default Drawer;
