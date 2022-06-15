import Page from '../page/Page';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../theme';
import React from 'react';
import ButtonBox from '../common/ButtonBox';
import Button from '@material-ui/core/Button';
import { useHistory } from 'react-router-dom';
import { DASHBOARD_ROUTE } from '../../routes';
import YoutubeEmbed from '../tasks/video/YoutubeEmbed';

const useStyles = makeStyles<Theme>((theme) => ({
    highlightBox: {
        margin: theme.spacing(5, 0),
        padding: theme.spacing(2, 5),
        backgroundColor: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadius
    },
    backgroundBox: {
        fontStyle: 'italic'
    }
}));

const HomePage = (): React.ReactElement => {
    const classes = useStyles();
    const history = useHistory();

    const isUnsupported = navigator.userAgent.indexOf('Chrome') === -1;

    return (
        <Page header="Sing UI" title="Sing UI">
            <p>
                Imagine singing a pitch to switch tools in a drawing application or a melody to copy a block of text. Sing UI is a
                preliminary experiment that evaluates these interactions. The paper,{' '}
                <a href="https://dl.acm.org/doi/10.1145/3491102.3517691?cid=99660239985">
                    "Evaluating Singing for Computer Input Using Pitch, Interval, and Melody"
                </a>{' '}
                by <a href="https://graemezinck.ca">Graeme Zinck</a> and Daniel Vogel, is being presented at CHI '22.
            </p>
            <YoutubeEmbed
                autoplay={false}
                embedID="4sDcXCYVbPo"
                title="Evaluating Singing for Computer Input Using Pitch, Interval, and Melody"
                margin={2}
            />
            <div className={classes.highlightBox}>
                <p>
                    Want to try out our singing interactions? You will need a microphone, headphones, laptop/desktop with Google Chrome, and
                    a quiet environment.
                </p>
                {isUnsupported && <p>Your browser is not supported, but you can try them anyways!</p>}
                <ButtonBox>
                    <Button href="https://dl.acm.org/doi/10.1145/3491102.3517691?cid=99660239985">Read the paper</Button>
                    <Button variant="contained" color="primary" onClick={() => history.push(DASHBOARD_ROUTE)}>
                        Try it out
                    </Button>
                </ButtonBox>
            </div>
        </Page>
    );
};

export default HomePage;
