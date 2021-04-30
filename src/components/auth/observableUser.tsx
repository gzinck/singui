import { Observable } from 'rxjs';
import { getAuth, User } from 'firebase/auth';

export const currUser$ = new Observable<User>((sub) => {
    // Return to unsubscribe from auth changes
    return getAuth().onAuthStateChanged((user) => {
        if (user) {
            sub.next(user);
            sub.complete();
        }
    });
});
