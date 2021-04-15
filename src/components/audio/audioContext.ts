import { AudioContext } from 'standardized-audio-context';

// Get a single AudioContext for our entire application. We use subscriptions to make
// sure it loads properly.
export const audioContext = new AudioContext();
