import React from 'react';
import { Subject } from 'rxjs';

const useGain = (audioVolume$: Subject<number>) => {
    const [gain, setGain] = React.useState(0);
    React.useEffect(() => {
        const sub = audioVolume$.subscribe((volume) => setGain(volume));
        return () => sub.unsubscribe();
    }, [audioVolume$]);

    return [gain, (volume: number) => audioVolume$.next(volume)] as const;
};

export default useGain;
