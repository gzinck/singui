import React from 'react';
import Page from '../../page/Page';
import Button from '@material-ui/core/Button';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../../theme';

const useStyles = makeStyles<Theme>(() => ({
    buttonBox: {
        width: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        '& > *': {
            width: '50vw',
            height: 'calc(33vh - 3rem)',
            borderRadius: 0,
            fontSize: '2rem',
            border: '1px #555 solid'
            // margin: theme.spacing(0, 2)
        }
    }
}));

const SinePage = (): React.ReactElement => {
    const classes = useStyles();
    return (
        <Page header="Audio Test—Phone">
            <div className={classes.buttonBox}>
                <Button>A3</Button>
                <Button>C4</Button>
                <Button>A4</Button>
                <Button>C5</Button>
                <Button>A5</Button>
                <Button>C6</Button>
            </div>
        </Page>
    );
};

export default SinePage;
