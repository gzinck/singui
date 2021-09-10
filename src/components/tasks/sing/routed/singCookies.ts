import React from 'react';
import { cookieStorage } from '../../../detector/shared';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

export enum SingType {
    PITCH = 'pitch',
    INTERVAL = 'interval',
    MELODY = 'melody',
    ALL = 'all'
}

const cookieChanges$ = new Subject<SingType>();

export const getDidSing = (type: SingType): boolean => !!cookieStorage.getItem(type);
export const setDidSing = (type: SingType) => {
    cookieStorage.setItem(type, 'true');
    cookieChanges$.next(type);
};
export const useDidSing = (type: SingType) => {
    const [didSing, setDidSing] = React.useState(getDidSing(type));
    React.useEffect(() => {
        const sub = cookieChanges$.pipe(filter((t) => t === type)).subscribe(() => setDidSing(true));

        return () => sub.unsubscribe();
    }, [type]);
    return didSing;
};
