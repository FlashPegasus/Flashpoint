import { db, rtdb } from '../../lib/firebase';
import { collection, doc, setDoc, query, where, orderBy, getDocs, updateDoc, writeBatch } from 'firebase/firestore';
import { ref, set, onValue, off } from 'firebase/database';
import type { AppNotification } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export const notificationService = {
    // Fetches notifications from Firestore
    getUserNotifications: async (userId: string): Promise<AppNotification[]> => {
        try {
            const notifRef = collection(db, 'users', userId, 'notifications');
            const q = query(notifRef, orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);
            return snap.docs.map(d => d.data() as AppNotification);
        } catch (err) {
            console.warn('Could not fetch notifications:', err);
            return [];
        }
    },

    // Sends a new notification (Firestore) and triggers an RTDB ping
    sendNotification: async (notification: Omit<AppNotification, 'id' | 'isRead' | 'createdAt'>): Promise<AppNotification> => {
        const fullNotification: AppNotification = {
            ...notification,
            id: uuidv4(),
            isRead: false,
            createdAt: new Date().toISOString()
        };

        // Save to Firestore for persistence
        await setDoc(doc(db, 'users', notification.userId, 'notifications', fullNotification.id), fullNotification);

        // Ping RTDB for real-time update
        const rtdbRef = ref(rtdb, `user_notifications/${notification.userId}`);
        await set(rtdbRef, { lastUpdate: Date.now() });

        return fullNotification;
    },

    // Marks a notification as read
    markAsRead: async (userId: string, notificationId: string): Promise<void> => {
        try {
            const docRef = doc(db, 'users', userId, 'notifications', notificationId);
            await updateDoc(docRef, { isRead: true });
        } catch (err) {
            console.warn('Could not mark notification as read:', err);
        }
    },

    // Marks all as read
    markAllAsRead: async (userId: string): Promise<void> => {
        try {
            const notifRef = collection(db, 'users', userId, 'notifications');
            const q = query(notifRef, where('isRead', '==', false));
            const snap = await getDocs(q);
            
            if (snap.empty) return;

            const batch = writeBatch(db);
            snap.docs.forEach(docSnap => {
                batch.update(docSnap.ref, { isRead: true });
            });
            await batch.commit();
        } catch (err) {
            console.warn('Could not mark all notifications as read:', err);
        }
    },

    // Subscribes to RTDB pings to know when to refresh Firestore notifications
    subscribeToNewNotifications: (userId: string, callback: () => void) => {
        const userRef = ref(rtdb, `user_notifications/${userId}`);
        onValue(userRef, (snapshot) => {
            if (snapshot.exists()) {
                callback();
            }
        });

        return () => {
            off(userRef);
        };
    }
};
