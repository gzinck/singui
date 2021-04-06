import { createMuiTheme } from '@material-ui/core';
import { Theme as DefaultTheme } from '@material-ui/core/styles/createMuiTheme';

export interface Theme extends DefaultTheme {}

export const theme = createMuiTheme({
    palette: {
        type: 'dark',
        background: {
            // default: '#0F0'
        }
    }
});
