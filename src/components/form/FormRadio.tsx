import React from 'react';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormItemBox from './FormItemBox';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../theme';

interface FormRadioProps {
    header: string;
    text?: string;
    options: string[];
    value: string | undefined;
    setValue: (s: string) => void;
    error?: string;
    variant: 'horizontal' | '';
}

const useStyles = makeStyles<Theme>((theme) => ({
    horizontal: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        overflowX: 'auto',
        '& span': {
            textAlign: 'center'
        }
    }
}));

const FormRadio = ({ header, text, options, value, setValue, error, variant }: FormRadioProps): React.ReactElement<FormRadioProps> => {
    const classes = useStyles();
    const labelPlacement = variant === 'horizontal' ? 'bottom' : 'end';
    return (
        <FormItemBox header={header} text={text} error={error}>
            <RadioGroup className={classes[variant]} aria-label={header} value={value} onChange={(e) => setValue(e.target.value)}>
                {options.map((opt) => (
                    <FormControlLabel labelPlacement={labelPlacement} control={<Radio />} label={opt} value={opt} key={opt} />
                ))}
            </RadioGroup>
        </FormItemBox>
    );
};

FormRadio.defaultProps = {
    variant: ''
};

export default FormRadio;