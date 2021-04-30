import { pitchStudyProps } from './pitchStudy';
import { setupStudyProps } from './setupStudy';

// This must be topologically sorted in terms of dependencies. The first item
// cannot have any dependencies.
export const allStudies = [setupStudyProps, pitchStudyProps];
