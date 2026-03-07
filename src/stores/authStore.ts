import { create } from 'zustand';
import type { User } from '../types';
import { authService } from '../services/authService';

interface AuthState {
    user: User | null;
    isLoading: boolean;
    error: string | null;

    initialize: () => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    loginWithGoogle: () => Promise<import('../types').User | null>;
    loginAnonymously: () => Promise<void>;
    linkEmail: (email: string, password: string, name: string) => Promise<void>;
    linkGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (updates: Partial<import('../types').User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: true,
    error: null,

    initialize: async () => {
        const { auth } = await import('../config/firebase');
        const { onAuthStateChanged } = await import('firebase/auth');

        onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const user = await authService.getCurrentUser();
                const usingCloud = localStorage.getItem('flashpoint_storage_mode') === 'cloud';
                if (usingCloud) {
                    const { firestoreAdapter } = await import('../utils/firestoreAdapter');
                    const { setStorageAdapter } = await import('../utils/storage');
                    firestoreAdapter.setUserId(firebaseUser.uid);
                    setStorageAdapter(firestoreAdapter);
                }
                set({ user, isLoading: false });
            } else {
                set({ user: null, isLoading: false });
            }
        });
    },

    login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
            const user = await authService.login(email, password);
            set({ user, isLoading: false });
        } catch (err) {
            set({ error: (err as Error).message, isLoading: false });
        }
    },

    register: async (email: string, password: string, name: string) => {
        set({ isLoading: true, error: null });
        try {
            const user = await authService.register(email, password, name);
            set({ user, isLoading: false });
        } catch (err) {
            set({ error: (err as Error).message, isLoading: false });
        }
    },

    loginWithGoogle: async () => {
        set({ isLoading: true, error: null });
        try {
            const user = await authService.loginWithGoogle();
            set({ user, isLoading: false });
            return user;
        } catch (err) {
            set({ error: (err as Error).message, isLoading: false });
            return null;
        }
    },

    loginAnonymously: async () => {
        set({ isLoading: true, error: null });
        try {
            const user = await authService.loginAnonymously();
            set({ user, isLoading: false });
        } catch (err) {
            set({ error: (err as Error).message, isLoading: false });
        }
    },

    linkEmail: async (email: string, password: string, name: string) => {
        set({ isLoading: true, error: null });
        try {
            const user = await authService.linkEmailToGuest(email, password, name);
            set({ user, isLoading: false });
        } catch (err) {
            set({ error: (err as Error).message, isLoading: false });
        }
    },

    linkGoogle: async () => {
        set({ isLoading: true, error: null });
        try {
            const user = await authService.linkGoogleToGuest();
            set({ user, isLoading: false });
        } catch (err) {
            set({ error: (err as Error).message, isLoading: false });
        }
    },

    logout: async () => {
        await authService.logout();
        set({ user: null });
    },

    updateProfile: async (updates: Partial<User>) => {
        try {
            const user = await authService.updateProfile(updates);
            set({ user });
        } catch (err) {
            set({ error: (err as Error).message });
        }
    }
}));
