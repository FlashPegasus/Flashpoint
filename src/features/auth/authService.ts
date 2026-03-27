import type { User } from '../../types';
import { storage } from '../../utils/storage';
import { auth, db } from '../../lib/firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signInAnonymously,
    signOut,
    linkWithCredential,
    linkWithPopup,
    EmailAuthProvider,
    updateProfile as updateFirebaseProfile,
    type User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const STORAGE_KEY = 'current_user';

const syncUserProfile = async (firebaseUser: FirebaseUser): Promise<User> => {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);
    let userData: User;

    if (userDoc.exists()) {
        userData = userDoc.data() as User;
        userData.isAnonymous = firebaseUser.isAnonymous;
        // Update avatar/name from Firebase Auth (e.g. after Google link)
        if (firebaseUser.displayName && userData.name === 'Guest') {
            userData.name = firebaseUser.displayName;
            userData.avatar = firebaseUser.photoURL || '';
            await updateDoc(userDocRef, { name: userData.name, avatar: userData.avatar, isAnonymous: firebaseUser.isAnonymous, isPublic: userData.isPublic ?? false });
        }
    } else {
        userData = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || (firebaseUser.isAnonymous ? 'Convidado' : firebaseUser.email?.split('@')[0]) || 'Usuário',
            email: firebaseUser.email || (firebaseUser.isAnonymous ? 'guest@flashpoint.app' : ''),
            avatar: firebaseUser.photoURL || '',
            role: 'organizer',
            isAnonymous: firebaseUser.isAnonymous,
            isPublic: false,
            stats: {
                tournamentsPlayed: 0,
                wins: 0,
                draws: 0,
                losses: 0,
                leaguesJoined: 0,
                accumulatedPoints: 0,
                xp: 0,
                level: 1
            }
        };
        await setDoc(userDocRef, userData);
    }

    await storage.set(STORAGE_KEY, userData);
    const finalData = { ...userData, isNewUser: !userDoc.exists() };
    return finalData as User;
};

export const authService = {
    getCurrentUser: async (): Promise<User | null> => {
        return await storage.get<User | null>(STORAGE_KEY, null);
    },

    refreshUser: async (): Promise<User | null> => {
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) return null;
        return await syncUserProfile(firebaseUser);
    },

    login: async (email: string, password: string): Promise<User> => {
        try {
            const credential = await signInWithEmailAndPassword(auth, email, password);
            return await syncUserProfile(credential.user);
        } catch (error: any) {
            console.error('Email Login Error:', error);
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
                throw new Error('E-mail ou senha incorretos.');
            }
            if (error.code === 'auth/user-not-found') {
                throw new Error('Usuário não encontrado. Crie uma conta primeiro.');
            }
            throw new Error(error.message);
        }
    },

    register: async (email: string, password: string, name: string): Promise<User> => {
        try {
            const credential = await createUserWithEmailAndPassword(auth, email, password);
            await updateFirebaseProfile(credential.user, { displayName: name });
            // Reload user so displayName is available
            await credential.user.reload();
            const userDocRef = doc(db, 'users', credential.user.uid);
            const userData: User = {
                id: credential.user.uid,
                name: name,
                email: email,
                avatar: '',
                role: 'organizer',
                isPublic: false,
                stats: { tournamentsPlayed: 0, wins: 0, draws: 0, losses: 0, leaguesJoined: 0, accumulatedPoints: 0, xp: 0, level: 1 }
            };
            await setDoc(userDocRef, userData);
            await storage.set(STORAGE_KEY, userData);
            return userData;
        } catch (error: any) {
            console.error('Register Error:', error);
            if (error.code === 'auth/email-already-in-use') {
                throw new Error('Este e-mail já está em uso. Tente fazer login.');
            }
            if (error.code === 'auth/weak-password') {
                throw new Error('Senha muito fraca. Use pelo menos 6 caracteres.');
            }
            throw new Error(error.message);
        }
    },

    loginWithGoogle: async (): Promise<User> => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            return await syncUserProfile(result.user);
        } catch (error: any) {
            console.error('Google Login Error:', error);
            throw new Error(error.message);
        }
    },

    loginAnonymously: async (): Promise<User> => {
        try {
            const result = await signInAnonymously(auth);
            return await syncUserProfile(result.user);
        } catch (error: any) {
            console.error('Anonymous Login Error:', error);
            throw new Error(error.message);
        }
    },

    linkEmailToGuest: async (email: string, password: string, name: string): Promise<User> => {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error('Nenhum usuário ativo encontrado.');
            const credential = EmailAuthProvider.credential(email, password);
            const result = await linkWithCredential(currentUser, credential);
            await updateFirebaseProfile(result.user, { displayName: name });
            // Update Firestore profile
            const userDocRef = doc(db, 'users', result.user.uid);
            await updateDoc(userDocRef, { name, email, avatar: '' });
            const updatedUser = await syncUserProfile(result.user);
            return updatedUser;
        } catch (error: any) {
            console.error('Link Email Error:', error);
            if (error.code === 'auth/email-already-in-use') {
                throw new Error('Este e-mail já está vinculado a outra conta.');
            }
            if (error.code === 'auth/provider-already-linked') {
                throw new Error('Esta conta já possui um e-mail vinculado.');
            }
            throw new Error(error.message);
        }
    },

    linkGoogleToGuest: async (): Promise<User> => {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error('Nenhum usuário ativo encontrado.');
            const provider = new GoogleAuthProvider();
            const result = await linkWithPopup(currentUser, provider);
            const userDocRef = doc(db, 'users', result.user.uid);
            await updateDoc(userDocRef, {
                name: result.user.displayName || 'Usuário',
                email: result.user.email || '',
                avatar: result.user.photoURL || ''
            });
            return await syncUserProfile(result.user);
        } catch (error: any) {
            console.error('Link Google Error:', error);
            if (error.code === 'auth/provider-already-linked') {
                throw new Error('Esta conta já possui um Google vinculado.');
            }
            if (error.code === 'auth/credential-already-in-use') {
                throw new Error('Esta conta Google já está associada a outro usuário.');
            }
            throw new Error(error.message);
        }
    },

    logout: async (): Promise<void> => {
        await signOut(auth);
        await storage.remove(STORAGE_KEY);
    },

    updateProfile: async (updatedUser: Partial<User>): Promise<User> => {
        const currentUser = await authService.getCurrentUser();
        if (!currentUser) throw new Error('Não autenticado');
        const newUser = { ...currentUser, ...updatedUser };
        await storage.set(STORAGE_KEY, newUser);
        await setDoc(doc(db, 'users', newUser.id), updatedUser, { merge: true });
        return newUser;
    }
};

