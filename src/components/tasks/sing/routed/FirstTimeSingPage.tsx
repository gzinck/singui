import React from 'react';
import { setDidSing, SingType } from './singCookies';
import VideoPage from '../../video/VideoPage';

interface Props {
    header: string;
    id: SingType;
}

const embedIDs: Record<SingType, string> = {
    [SingType.PITCH]: 'vzxk4NJRurw',
    [SingType.INTERVAL]: '5o_75JQKqBQ',
    [SingType.MELODY]: 'EoyFPwVqhhI',
    [SingType.ALL]: ''
};

const FirstTimeSingPage = ({ header, id }: Props): React.ReactElement<Props> => {
    return (
        <VideoPage
            header={header}
            onComplete={() => setDidSing(id)}
            embedID={embedIDs[id]}
            text="Before you begin, watch this short video to learn the interaction technique."
        >
            <p>To configure options for this technique, click the menu button at the top left of the page.</p>
        </VideoPage>
    );
};

export default FirstTimeSingPage;
