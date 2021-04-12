import React from 'react';
import TaskPage from './TaskPage';
import MelodyDiagram from './MelodyDiagram';

const MelodyTasks = (): React.ReactElement => {
    return (
        <TaskPage header="Melody tasks" subheader="Sing the melody below">
            <MelodyDiagram melody={[0, 3, 12, -12]} />
        </TaskPage>
    );
};

export default MelodyTasks;
