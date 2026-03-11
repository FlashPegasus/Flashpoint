import { create } from 'zustand';
import type { User } from '../../types';
import { authService } from './authService';

interface AuthState {
    user: User | null;
    isLoading: boolean;
    uiMode: 'player' | 'organizer';
    error: string | null;

    initialize: () => Promise<void>;
    setUiMode: (mode: 'player' | 'organizer') => void;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    loginWithGoogle: () => Promise<import('../../types').User | null>;
    loginAnonymously: () => Promise<void>;
    linkEmail: (email: string, password: string, name: string) => Promise<void>;
    linkGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (updates: Partial<import('../../types').User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    uiMode: (localStorage.getItem('uiMode') as 'player' | 'organizer') || 'player',
    isLoading: true,
    error: null,

    initialize: async () => {
        const { auth } = await import('../../lib/firebase');
        const { onAuthStateChanged } = await import('firebase/auth');

        onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const user = await authService.getCurrentUser();
                set({ user, isLoading: false });
            } else {
                set({ user: null, isLoading: false });
            }
        });
    },

    setUiMode: (mode: 'player' | 'organizer') => {
        localStorage.setItem('uiMode', mode);
        set({ uiMode: mode });
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

