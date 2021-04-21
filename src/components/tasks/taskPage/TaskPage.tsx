import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../../theme';
import Slider from '@material-ui/core/Slider';
import OptionsPopover from './OptionsPopover';
import NoVolumeAlert from './NoVolumeAlert';
import TopBar from './TopBar';

interface TaskPageProps {
    children?: React.ReactNode;
    header: string;
    sustainLength?: number;
    setSustainLength?: (n: number) => void;
    gain?: number;
    setGain?: (n: number) => void;
}

const useStyles = makeStyles<Theme>((theme) => ({
    root: {
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        minWidth: '40rem',
        height: '100%',
        overflow: 'hidden',
        margin: 0,
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center'
    },
    main: {
        marginTop: '4rem',
        padding: '2rem',
        height: 'calc(100vh - 8rem)',
        width: '100%',
        maxWidth: '60rem',
        position: 'relative',
        overflowY: 'hidden'
    }
}));

const TaskPage = (props: TaskPageProps): React.ReactElement<TaskPageProps> => {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <TopBar title={props.header}>
                {(props.setGain || props.setSustainLength) && (
                    <OptionsPopover>
                        {props.setGain && (
                            <>
                                <h4>Audio volume</h4>
                                <Slider
                                    value={props.gain}
                                    onChange={(_, val) => props.setGain && props.setGain(typeof val === 'number' ? val : val[0])}
                                    min={0}
                                    max={1}
                                    step={0.05}
                                    defaultValue={1}
                                    valueLabelDisplay="auto"
                                />
                            </>
                        )}
                        {props.setSustainLength && (
                            <>
                                <h4>Pitch selection time</h4>
                                <p>Shorter is faster, but more challenging</p>
                                <Slider
                                    value={props.sustainLength}
                                    onChange={(_, val) =>
                                        props.setSustainLength && props.setSustainLength(typeof val === 'number' ? val : val[0])
                                    }
                                    min={2}
                                    max={10}
                                    step={1}
                                    valueLabelDisplay="auto"
                                />
                            </>
                        )}
                    </OptionsPopover>
                )}
            </TopBar>
            <div className={classes.main}>
                {props.children}
                {props.setGain && <NoVolumeAlert />}
            </div>
        </div>
    );
};

export default TaskPage;
