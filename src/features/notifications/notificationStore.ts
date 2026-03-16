import { create } from 'zustand';
import { notificationService } from './notificationService';
import type { AppNotification } from '../../types';

interface NotificationStore {
    notifications: AppNotification[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;
    isListening: boolean;
    unsubscribe: (() => void) | null;
    
    // Actions
    startListening: (userId: string) => void;
    stopListening: () => void;
    fetchNotifications: (userId: string) => Promise<void>;
    sendNotification: (notification: Omit<AppNotification, 'id' | 'isRead' | 'createdAt'>) => Promise<void>;
    markAsRead: (userId: string, notificationId: string) => Promise<void>;
    markAllAsRead: (userId: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
    isListening: false,
    unsubscribe: null,

    startListening: (userId: string) => {
        const { isListening, fetchNotifications } = get();
        if (isListening) return;

        // Initial fetch
        fetchNotifications(userId);

        // Sub RTDB
        const unsub = notificationService.subscribeToNewNotifications(userId, () => {
            fetchNotifications(userId);
        });

        set({ isListening: true, unsubscribe: unsub });
    },

    stopListening: () => {
        const { unsubscribe } = get();
        if (unsubscribe) {
            unsubscribe();
        }
        set({ isListening: false, unsubscribe: null, notifications: [], unreadCount: 0 });
    },

    fetchNotifications: async (userId: string) => {
        // We do not set isLoading=true here on every ping to avoid UI flickering
        try {
            const notifs = await notificationService.getUserNotifications(userId);
            const unread = notifs.filter(n => !n.isRead).length;
            set({ notifications: notifs, unreadCount: unread, error: null });
        } catch (err: any) {
            set({ error: err.message });
        }
    },

    sendNotification: async (notification) => {
        try {
            await notificationService.sendNotification(notification);
            // It will ping RTDB and trigger fetchNotifications via the listener for the target user
        } catch (err: any) {
            console.error('Failed to send notification:', err);
        }
    },

    markAsRead: async (userId: string, notificationId: string) => {
        try {
            // Optimistic update
            const { notifications } = get();
            const updated = notifications.map(n => n.id === notificationId ? { ...n, isRead: true } : n);
            set({ notifications: updated, unreadCount: updated.filter(n => !n.isRead).length });

            // Firebase
            await notificationService.markAsRead(userId, notificationId);
        } catch (err: any) {
            set({ error: err.message });
        }
    },

    markAllAsRead: async (userId: string) => {
        try {
            // Optimistic update
            const { notifications } = get();
            const updated = notifications.map(n => ({ ...n, isRead: true }));
            set({ notifications: updated, unreadCount: 0 });

            // Firebase
            await notificationService.markAllAsRead(userId);
        } catch (err: any) {
            set({ error: err.message });
        }
    }
}));
