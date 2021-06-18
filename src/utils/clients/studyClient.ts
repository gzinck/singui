import { StudyTaskType } from '../../components/study/studyTasks';
import { Observable } from 'rxjs';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import { currUser$, getFirst } from '../../components/auth/observableUser';
import { map, mergeMap } from 'rxjs/operators';
import { getStorage, ref, uploadBytes } from 'firebase/storage';

export interface StudyResult {
    type: StudyTaskType;
    id: string;
    details: any;
    doneAt: Date;
}

interface StudyData {
    results: StudyResult[];
    nextIdx: number;
    isDone: boolean;
}

export const getStudyData = (studyID: string): Observable<StudyData | null> => {
    const db = getFirestore();
    return currUser$.pipe(
        getFirst(),
        mergeMap((user) => getDoc(doc(db, 'users', user.uid, 'studies', studyID))),
        map((doc) => {
            if (doc.exists()) return doc.data() as StudyData;
            else return null;
        })
    );
};

export const setStudyData = (studyID: string, data: StudyData): Observable<void> => {
    const db = getFirestore();
    return currUser$.pipe(
        getFirst(),
        mergeMap((user) => setDoc(doc(db, 'users', user.uid, 'studies', studyID), data))
    );
};

export const saveAudioFile = (studyID: string, taskID: string, blob: Blob) => {
    const storage = getStorage();
    return currUser$.pipe(
        getFirst(),
        mergeMap((user) => {
            const path = `users/${user.uid}/study-${studyID}/${taskID}.mp3`;
            const docRef = ref(storage, path);
            return uploadBytes(docRef, blob);
        })
    );
};
