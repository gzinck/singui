import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import React from 'react';

const UnsupportedBrowserAlert = (): React.ReactElement => {
    const [open, setOpen] = React.useState(false);
    React.useEffect(() => {
        if (navigator.userAgent.indexOf('Chrome') === -1) setOpen(true);
    }, []);

    return (
        <Snackbar
            open={open}
            onClose={() => setOpen(false)}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left'
            }}
        >
            <MuiAlert variant="filled" severity="error" elevation={6} onClose={() => setOpen(false)}>
                Your browser is not supported. Please use Chrome or Firefox on a desktop or laptop.
            </MuiAlert>
        </Snackbar>
    );
};

export default UnsupportedBrowserAlert;
