import { db } from '../../lib/firebase';
import { collection, getDocs, writeBatch } from 'firebase/firestore';

export const adminService = {
    /**
     * IRREVERSIBLE: Clears all tournaments and leagues from Firestore.
     */
    clearAllData: async (): Promise<{ tournamentsDeleted: number; leaguesDeleted: number }> => {
        const batch = writeBatch(db);
        let tournamentsDeleted = 0;
        let leaguesDeleted = 0;

        // Delete Tournaments
        const tSnap = await getDocs(collection(db, 'tournaments'));
        tSnap.forEach(d => {
            batch.delete(d.ref);
            tournamentsDeleted++;
        });

        // Delete Leagues
        const lSnap = await getDocs(collection(db, 'leagues'));
        lSnap.forEach(d => {
            batch.delete(d.ref);
            leaguesDeleted++;
        });

        await batch.commit();
        
        // Note: Subcollections like audit_log or members might need recursive deletion 
        // if they are many. For small scales, this is usually enough for top-level.
        
        return { tournamentsDeleted, leaguesDeleted };
    }
};
