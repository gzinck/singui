import React from 'react';
import CalibrationBar from './CalibrationBar';
import RangeSelector from './RangeSelector';
import MessagePage from '../../message/MessagePage';
import { Subject, timer } from 'rxjs';
import { Alert } from '@material-ui/lab';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../../../theme';
import useAudio from '../../../audio/useAudio';
import { getAudioURL } from '../../../audio/getAudioURL';
import { debounceTime } from 'rxjs/operators';
import { TaskTarget } from '../../sing/target';
import { TaskType } from '../../../../utils/rxjs/recognizers/universalRecognizer';
import Button from '@material-ui/core/Button';
import ConfirmDialog from './ConfirmDialog';

export interface RangeSelectionProps {
    header: string;
    minNote: number; // Minimum note in comfortable range
    maxNote: number; // Maximum note in comfortable range
    onComplete: (startNote: number) => void;
    restart?: () => void; // To restart calibration
}

const useStyles = makeStyles<Theme>((theme) => ({
    alert: {
        margin: theme.spacing(5, 0, 1)
    },
    text: {
        textAlign: 'center'
    }
}));

const maxNoteNum = 71; // NOTE: the max minimum note is 60, but this is the highest number for the top note
const minNoteNum = 12;

const octaveTarget: TaskTarget = {
    type: TaskType.INTERVAL,
    value: 12,
    startNote: 0
};

const valueFor = (n: number, min: number, max: number): number => (n >= min && n <= max ? 2 : 0);
const clamp = (num: number, min: number, max: number): number => Math.min(Math.max(num, min), max);

const RangeSelectionPage = ({ header, minNote, maxNote, onComplete, restart }: RangeSelectionProps) => {
    const [modalOpen, setModalOpen] = React.useState(false);
    const classes = useStyles();
    const [note, setNote] = React.useState(clamp(Math.floor((maxNote + minNote) / 2) - 6, minNoteNum, maxNoteNum - 12));
    const status = new Array(maxNoteNum - minNoteNum + 1)
        .fill(0)
        .reduce((acc, _, idx) => ({ ...acc, [idx + minNoteNum]: valueFor(idx + minNoteNum, minNote, maxNote) }), {});

    // Dummy loader to ensure they look through the page
    const [loading, setLoading] = React.useState(true);
    React.useEffect(() => {
        const sub = timer(3000).subscribe(() => setLoading(false));
        return () => sub.unsubscribe();
    }, []);

    // For playing the notes
    const { play } = useAudio({ keyNumber: 0 });
    const play$ = React.useRef<Subject<string>>(new Subject());

    const currAudioURL = getAudioURL({
        target: octaveTarget,
        keyNumber: note % 12,
        octave: Math.floor(note / 12)
    });

    React.useEffect(() => {
        const sub = play$.current.pipe(debounceTime(400)).subscribe((url) => play(url));
        return () => sub.unsubscribe();
    }, [play]);
    React.useEffect(() => play$.current.next(currAudioURL), [currAudioURL]);

    const rangeInsufficient = maxNote - minNote < 12;
    const moveSlider = (to: number) => {
        if (rangeInsufficient) {
            if (to > maxNote - 12) setNote(Math.min(minNote, maxNoteNum - 12, Math.max(to, minNoteNum)));
            else setNote(Math.max(maxNote - 12, minNoteNum, to));
        } else {
            if (to > maxNote - 12) setNote(maxNote - 12);
            else if (to < minNote) setNote(minNote);
            else setNote(to);
        }
    };

    const button = (
        <>
            {restart && <Button onClick={() => setModalOpen(true)}>Restart</Button>}
            <Button onClick={() => play(currAudioURL)}>Replay sound</Button>
        </>
    );

    return (
        <MessagePage header={header} onComplete={() => onComplete(note)} isLoading={loading} buttons={button}>
            <p className={classes.text}>To select your range, drag the slider ends left or right.</p>
            <p className={classes.text}>Listen to the notes played and sing them to make sure the range is comfortable.</p>
            <CalibrationBar minNote={minNoteNum} maxNote={maxNoteNum} status={status} />
            <RangeSelector minNote={minNoteNum} maxNote={maxNoteNum} note={note} setNote={moveSlider} />
            {rangeInsufficient && (
                <Alert className={classes.alert} severity="warning">
                    Your range was detected to be under 1 octave, so make sure you adjust your range using the slider to make it as
                    comfortable as possible.
                </Alert>
            )}
            <ConfirmDialog
                header="Restart Calibration"
                text="Are you sure you want to restart?"
                onClose={() => setModalOpen(false)}
                open={modalOpen}
                closeText="No"
                confirmText="Yes"
                onConfirm={restart || (() => null)}
            />
        </MessagePage>
    );
};

export default RangeSelectionPage;
