import Form from '../tasks/form/Form';
import { FormItem, FormTypes } from '../tasks/form/formTypes';

interface Props {
    header: string;
    onComplete: (isMusical: boolean, results: Record<string, string | string[]>) => void;
}

const options = [
    'Strongly disagree',
    'Disagree',
    'Slightly disagree',
    'Neither agree nor disagree',
    'Slightly agree',
    'Agree',
    'Strongly agree'
];

const ids = {
    singRightNotes: 'sing-right-notes',
    singInTune: 'sing-in-tune',
    notMusician: 'not-musician'
};

const form: FormItem[] = [
    {
        id: ids.singRightNotes,
        type: FormTypes.RADIO,
        variant: 'horizontal',
        header: 'I am able to hit the right notes when I sing along with a recording.',
        text: 'Rate your agreement with the statement.',
        options
    },
    {
        id: ids.singInTune,
        type: FormTypes.RADIO,
        variant: 'horizontal',
        header: 'When I sing, I have no idea whether I am in tune or not.',
        text: 'Rate your agreement with the statement.',
        options
    },
    {
        id: ids.notMusician,
        type: FormTypes.RADIO,
        variant: 'horizontal',
        header: 'I would not consider myself a musician.',
        text: 'Rate your agreement with the statement.',
        options
    }
];

const MusicalityForm = ({ onComplete, header }: Props) => {
    return (
        <Form
            header={header}
            title="Musicality"
            form={form}
            onComplete={(results) => {
                let isMusical = true;
                if (
                    options.indexOf(results[ids.singRightNotes] as string) < 5 || // Must be agree or better
                    options.indexOf(results[ids.singInTune] as string) > 2 || // Must disagree
                    options.indexOf(results[ids.notMusician] as string) > 3 // Must disagree or neutral
                )
                    isMusical = false;
                onComplete(isMusical, results);
            }}
        />
    );
};

MusicalityForm.defaultProps = {
    header: 'Musicality'
};

export default MusicalityForm;
