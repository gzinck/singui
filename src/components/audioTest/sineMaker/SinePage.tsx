import React from 'react';
import Page from '../../page/Page';
import Button from '@material-ui/core/Button';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../../theme';
import useSine from './useSine';
import { convertNoteToString } from '../../../utils/pitchConverter';
import { notesToTestAudio } from '../constants';

const useStyles = makeStyles<Theme>(() => ({
    buttonBox: {
        width: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center'
    },
    button: {
        width: '50vw',
        height: 'calc(33vh - 3rem)',
        borderRadius: 0,
        fontSize: '2rem',
        border: '1px #555 solid'
    }
}));

const SinePage = (): React.ReactElement => {
    const classes = useStyles();
    const { toggle } = useSine();
    return (
        <Page header="Audio Test—Phone">
            <div className={classes.buttonBox}>
                {notesToTestAudio.map((noteNum) => (
                    <Button className={classes.button} key={noteNum} onClick={() => toggle(noteNum)}>
                        {convertNoteToString(noteNum)}
                    </Button>
                ))}
            </div>
        </Page>
    );
};

export default SinePage;
