import { db } from '../config/firebase';
import {
    doc,
    getDoc,
    setDoc,
    deleteDoc
} from 'firebase/firestore';
import type { StorageAdapter } from './storage';

export class FirestoreStorageAdapter implements StorageAdapter {
    private userId: string | null = null;

    setUserId(userId: string | null) {
        this.userId = userId;
    }

    async get<T>(key: string, defaultValue: T): Promise<T> {
        if (!this.userId) return defaultValue;

        try {
            // In Firestore, we'll store app state in a 'users' collection 
            // with a sub-document for 'data' or similar
            const docRef = doc(db, 'users', this.userId, 'appData', key);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return docSnap.data().value as T;
            }
            return defaultValue;
        } catch (error) {
            console.error(`Firestore error reading key "${key}":`, error);
            return defaultValue;
        }
    }

    async set<T>(key: string, value: T): Promise<void> {
        if (!this.userId) return;

        try {
            const docRef = doc(db, 'users', this.userId, 'appData', key);
            await setDoc(docRef, {
                value,
                updatedAt: new Date().toISOString()
            }, { merge: true });
        } catch (error) {
            console.error(`Firestore error writing key "${key}":`, error);
        }
    }

    async remove(key: string): Promise<void> {
        if (!this.userId) return;

        try {
            const docRef = doc(db, 'users', this.userId, 'appData', key);
            await deleteDoc(docRef);
        } catch (error) {
            console.error(`Firestore error removing key "${key}":`, error);
        }
    }

    async clear(): Promise<void> {
        if (!this.userId) return;
        // Clearing for a specific user would involve deleting all docs in their appData collection.
        // For safety and cost, we won't implement a full recursive delete here yet.
        console.warn('Firestore clear() called - implementation deferred for safety.');
    }
}

export const firestoreAdapter = new FirestoreStorageAdapter();
