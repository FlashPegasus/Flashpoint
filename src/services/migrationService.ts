import type { Tournament } from '../types';
import { storage } from '../utils/storage';
import { firestoreAdapter } from '../utils/firestoreAdapter';

export const migrationService = {
    /**
     * Migrates data from LocalStorage to Firestore
     */
    migrateToCloud: async (userId: string): Promise<{ success: boolean; count: number }> => {
        firestoreAdapter.setUserId(userId);

        try {
            // 1. Get tournaments from current storage (LocalStorage)
            const localTournaments = await storage.get<Tournament[]>('tournaments', []);

            // 2. Upload each to Firestore via the adapter
            for (const t of localTournaments) {
                await firestoreAdapter.set(`tournaments_${t.id}`, t);
            }

            // 3. Update the global tournaments list in Firestore
            await firestoreAdapter.set('tournaments', localTournaments);

            return { success: true, count: localTournaments.length };
        } catch (error) {
            console.error('Migration failed:', error);
            return { success: false, count: 0 };
        }
    }
};
