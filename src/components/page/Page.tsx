import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../theme';
import TopBar from './TopBar';
import NoVolumeAlert from './NoVolumeAlert';
import Slider from '@material-ui/core/Slider';
import OptionsPopover from './OptionsPopover';
import useGain from '../audio/useGain';
import useSustainLength from '../audio/useSustainLength';
import UnsupportedBrowserAlert from './UnsupportedBrowserAlert';

interface TaskPageProps {
    children?: React.ReactNode;
    header: string;
}

const useStyles = makeStyles<Theme>((theme) => ({
    root: {
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        minHeight: '100vh',
        overflow: 'hidden',
        margin: 0,
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center'
    },
    main: {
        marginTop: '4rem',
        width: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    }
}));

const Page = (props: TaskPageProps): React.ReactElement<TaskPageProps> => {
    const classes = useStyles();
    const [gain, setGain] = useGain();
    const [sustainLength, setSustainLength] = useSustainLength();

    return (
        <div className={classes.root}>
            <TopBar header={props.header}>
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
            </TopBar>
            <div className={classes.main}>
                {props.children}
                <NoVolumeAlert />
                <UnsupportedBrowserAlert />
            </div>
        </div>
    );
};

export default Page;
