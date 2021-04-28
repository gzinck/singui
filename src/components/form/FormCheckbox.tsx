import React from 'react';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import FormItemBox from './FormItemBox';

interface FormRadioProps {
    header: string;
    text?: string;
    options: string[];
    value?: string[];
    setValue: (s: string[]) => void;
    error?: string;
}

const FormRadio = ({ header, text, options, value, setValue, error }: FormRadioProps): React.ReactElement<FormRadioProps> => {
    const toggle = (s: string) => {
        const without = (value || []).filter((opt) => opt !== s);
        // If we didn't change anything, add it back in
        if (without.length === (value || []).length) {
            without.push(s);
        }
        setValue(without);
    };

    return (
        <FormItemBox header={header} text={text} error={error}>
            <FormGroup>
                {options.map((opt) => (
                    <FormControlLabel
                        control={<Checkbox checked={value && value.includes(opt)} onChange={() => toggle(opt)} />}
                        label={opt}
                        key={opt}
                    />
                ))}
            </FormGroup>
        </FormItemBox>
    );
};

export default FormRadio;
