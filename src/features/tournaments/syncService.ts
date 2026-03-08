import { rtdb } from '../../lib/firebase';
import { ref, onValue, set, serverTimestamp } from 'firebase/database';

export const syncService = {
    /**
     * Notify all participants that tournament data has changed.
     * This uses RTDB which is billed by bandwidth (GB) rather than reads.
     */
    notifyUpdate: async (tournamentId: string) => {
        try {
            const syncRef = ref(rtdb, `sync/${tournamentId}`);
            await set(syncRef, {
                lastUpdated: serverTimestamp()
            });
        } catch (err) {
            console.warn('Sync notification failed:', err);
        }
    },

    /**
     * Listen for update signals.
     * Returns an unsubscribe function.
     */
    subscribe: (tournamentId: string, onUpdate: () => void) => {
        const syncRef = ref(rtdb, `sync/${tournamentId}`);
        return onValue(syncRef, (snapshot) => {
            if (snapshot.exists()) {
                onUpdate();
            }
        });
    }
};

