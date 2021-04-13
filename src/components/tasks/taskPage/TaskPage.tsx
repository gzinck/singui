import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../../theme';
import Slider from '@material-ui/core/Slider';
import OptionsPopover from './OptionsPopover';
import Drawer from './Drawer';
import NoVolumeAlert from './NoVolumeAlert';

interface TaskPageProps {
    children?: React.ReactNode;
    header: string;
    subheader: string;
    sustainLength?: number;
    setSustainLength?: (n: number) => void;
    gain?: number;
    setGain?: (n: number) => void;
}

const useStyles = makeStyles<Theme>((theme) => ({
    root: {
        backgroundColor: theme.palette.background.default,
        minHeight: '100vh',
        boxSizing: 'border-box',
        margin: 0,
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.palette.text.primary,
        overflow: 'hidden',
        '& h1': {
            textAlign: 'center'
        }
    }
}));

const TaskPage = (props: TaskPageProps): React.ReactElement<TaskPageProps> => {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <Drawer />
            <h1>{props.header}</h1>
            <h2>{props.subheader}</h2>
            {props.children}
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
            {props.setGain && <NoVolumeAlert />}
        </div>
    );
};

export default TaskPage;
