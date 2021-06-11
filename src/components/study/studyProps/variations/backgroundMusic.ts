import { StudyTask } from '../../studyTasks';

export const varyBackgroundMusic = (task: StudyTask): StudyTask[] => {
    return Array(2)
        .fill(task)
        .map((val, i) => ({
            ...val,
            id: `${val.id}-${i === 0 ? 'with' : 'without'}-music`,
            props: { ...val.props, hasBackground: i === 0 }
        }));
};
