import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import { useHistory } from 'react-router-dom';
import { INTERVAL_TASKS_ROUTE, MELODY_TASKS_ROUTE, RELATIVE_PITCH_TASKS_ROUTE, UNIVERSAL_TASKS_ROUTE } from '../../../../routes';

const promptsParam = 'withPrompts';
const backgroundParam = 'hasBackground';

const validPages = new Set([RELATIVE_PITCH_TASKS_ROUTE, INTERVAL_TASKS_ROUTE, MELODY_TASKS_ROUTE, UNIVERSAL_TASKS_ROUTE]);

const OptionList = (): React.ReactElement => {
    const history = useHistory();
    const query = new URLSearchParams(history.location.search);
    const [prompts, setPrompts] = React.useState<boolean>(query.get(promptsParam) === 'true');
    const [background, setBackground] = React.useState<boolean>(query.get(backgroundParam) === 'true');

    if (!validPages.has(history.location.pathname)) return <></>;

    return (
        <List>
            <ListItem>
                <ListItemIcon>
                    <Checkbox
                        value={prompts}
                        onChange={() => {
                            setPrompts(!prompts);
                            query.set(promptsParam, (!prompts).toString());
                            history.push({
                                search: query.toString()
                            });
                        }}
                    />
                </ListItemIcon>
                <ListItemText>Audio prompts</ListItemText>
            </ListItem>
            <ListItem>
                <ListItemIcon>
                    <Checkbox
                        value={background}
                        onChange={() => {
                            setBackground(!background);
                            query.set(backgroundParam, (!background).toString());
                            history.push({
                                search: query.toString()
                            });
                        }}
                    />
                </ListItemIcon>
                <ListItemText>Music</ListItemText>
            </ListItem>
        </List>
    );
};

export default OptionList;
