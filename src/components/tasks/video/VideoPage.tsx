import MessagePage, { MessageProps } from '../message/MessagePage';
import YoutubeEmbed from './YoutubeEmbed';

export interface VideoProps extends MessageProps {
    embedID: string;
}

const VideoPage = (props: VideoProps): React.ReactElement<VideoProps> => {
    return (
        <MessagePage {...props}>
            <YoutubeEmbed embedID={props.embedID} title={props.header} margin={2} />
        </MessagePage>
    );
};

export default VideoPage;
