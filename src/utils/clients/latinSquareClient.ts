import { Observable } from 'rxjs';
import { currUser$, getFirst } from '../../components/auth/observableUser';
import { mergeMap, timeout } from 'rxjs/operators';
import { doc, getFirestore, runTransaction } from 'firebase/firestore';

const latinSquareVersion = 'v1';

export const getLatinSquare = (): Observable<number> => {
    const db = getFirestore();
    return currUser$.pipe(
        getFirst(),
        timeout(1000),
        mergeMap((user) =>
            runTransaction(db, (transaction) => {
                const docRef = doc(db, 'latinSquare', latinSquareVersion);
                return transaction.get(docRef).then((users) => {
                    if (!users.exists()) {
                        transaction.set(docRef, { ids: [user.uid] });
                        return 0;
                    }

                    // If we already have our index, return it
                    const data = users.data().ids as string[];
                    const idx = data.findIndex((curr) => curr === user.uid);
                    if (idx > -1) return idx;

                    // Otherwise, set our index
                    data.push(user.uid);
                    transaction.set(docRef, { ids: data });
                    return data.length - 1;
                });
            })
        )
    );
};
