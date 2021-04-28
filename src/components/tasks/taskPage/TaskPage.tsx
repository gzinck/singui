import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../../theme';
import Slider from '@material-ui/core/Slider';
import OptionsPopover from './OptionsPopover';
import NoVolumeAlert from './NoVolumeAlert';
import useGain from '../../audio/useGain';
import useSustainLength from '../../audio/useSustainLength';
import Page from '../../page/Page';

interface TaskPageProps {
    children?: React.ReactNode;
    header: string;
}

const useStyles = makeStyles<Theme>(() => ({
    root: {
        padding: '2rem',
        boxSizing: 'border-box',
        height: '100%',
        width: '100%',
        maxWidth: '60rem',
        position: 'relative',
        overflowY: 'hidden'
    }
}));

const TaskPage = (props: TaskPageProps): React.ReactElement<TaskPageProps> => {
    const classes = useStyles();
    const [gain, setGain] = useGain();
    const [sustainLength, setSustainLength] = useSustainLength();

    return (
        <Page
            header={props.header}
            topBar={
                <OptionsPopover>
                    <h4>Audio volume</h4>
                    <Slider
                        value={gain}
                        onChange={(_, val) => setGain(val as number)}
                        min={0}
                        max={1}
                        step={0.05}
                        defaultValue={1}
                        valueLabelDisplay="auto"
                    />
                    <h4>Pitch selection time</h4>
                    <p>Shorter is faster, but more challenging</p>
                    <Slider
                        value={sustainLength}
                        onChange={(_, val) => setSustainLength(val as number)}
                        min={2}
                        max={10}
                        step={1}
                        valueLabelDisplay="auto"
                    />
                </OptionsPopover>
            }
        >
            <div className={classes.root}>
                {props.children}
                <NoVolumeAlert />
            </div>
        </Page>
    );
};

export default TaskPage;
