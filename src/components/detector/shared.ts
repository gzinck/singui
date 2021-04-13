import VoiceDetector from './VoiceDetector';
import { BehaviorSubject } from 'rxjs';
import { CookieStorage } from 'cookie-storage';

export const voiceDetector = new VoiceDetector();

export const cookieStorage = new CookieStorage();

const defaultSustainLength = 5;
export const sustainLength$ = new BehaviorSubject<number>(defaultSustainLength);
const initialSustainLength = cookieStorage.getItem('sustainLength');
if (initialSustainLength) sustainLength$.next(parseInt(initialSustainLength));
sustainLength$.subscribe((sustainLength) => cookieStorage.setItem('sustainLength', `${sustainLength}`));

const defaultAudioVolume = 1;
export const audioVolume$ = new BehaviorSubject<number>(defaultAudioVolume);
const initialVolume = cookieStorage.getItem('audioVolume');
if (initialVolume) audioVolume$.next(parseFloat(initialVolume));
audioVolume$.subscribe((audioVolume) => cookieStorage.setItem('audioVolume', `${audioVolume}`));
