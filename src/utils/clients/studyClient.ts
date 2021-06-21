import { StudyTaskType } from '../../components/study/studyTasks';
import { Observable } from 'rxjs';
import { collection, doc, getDoc, getDocs, getFirestore, setDoc } from 'firebase/firestore';
import { currUser$, getFirst } from '../../components/auth/observableUser';
import { map, mergeMap, timeout } from 'rxjs/operators';
import { getStorage, ref, uploadBytes } from 'firebase/storage';

export interface StudyResult {
    type: StudyTaskType;
    id: string;
    details: any;
    doneAt: Date;
}

interface StudyData {
    nextIdx: number;
    isDone: boolean;
}

interface StudyDataWithId extends StudyData {
    studyId: string;
}

export const getAllStudies = (): Observable<StudyDataWithId[]> => {
    const db = getFirestore();
    return currUser$.pipe(
        getFirst(),
        timeout(1000),
        mergeMap((user) => getDocs(collection(db, 'users', user.uid, 'studies'))),
        map((docs) => {
            const result: StudyDataWithId[] = [];
            docs.forEach((doc) => {
                result.push({ ...(doc.data() as StudyData), studyId: doc.id });
            });
            return result;
        })
    );
};

export const getStudyStatus = (studyID: string): Observable<StudyData | null> => {
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

export const setStudyStatus = (studyID: string, data: StudyData): Observable<void> => {
    const db = getFirestore();
    return currUser$.pipe(
        getFirst(),
        mergeMap((user) => setDoc(doc(db, 'users', user.uid, 'studies', studyID), data))
    );
};

export const getStudyTaskResults = (studyID: string, taskID: string): Observable<StudyResult | null> => {
    const db = getFirestore();
    return currUser$.pipe(
        getFirst(),
        mergeMap((user) => getDoc(doc(db, 'users', user.uid, 'studies', studyID, 'tasks', taskID))),
        map((doc) => {
            if (doc.exists()) return doc.data() as StudyResult;
            else return null;
        })
    );
};

export const setStudyTaskResults = (studyID: string, taskID: string, data: StudyResult): Observable<void> => {
    const db = getFirestore();
    return currUser$.pipe(
        getFirst(),
        mergeMap((user) => setDoc(doc(db, 'users', user.uid, 'studies', studyID, 'tasks', taskID), data))
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
