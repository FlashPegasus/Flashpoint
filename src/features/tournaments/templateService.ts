import { db } from '../../lib/firebase';
import { collection, doc, getDocs, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import type { TournamentTemplate } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export const templateService = {
    getUserTemplates: async (userId: string): Promise<TournamentTemplate[]> => {
        try {
            const tempRef = collection(db, 'users', userId, 'templates');
            const q = query(tempRef, orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);
            return snap.docs.map(d => d.data() as TournamentTemplate);
        } catch (err) {
            console.warn('Could not fetch tournament templates:', err);
            return [];
        }
    },

    saveTemplate: async (userId: string, data: Partial<TournamentTemplate>): Promise<TournamentTemplate> => {
        const template: TournamentTemplate = {
            id: data.id || uuidv4(),
            organizerId: userId,
            name: data.name || 'Novo Template',
            format: data.format || '1v1',
            pairingMode: data.pairingMode || 'standard',
            minPlayersPerTable: data.minPlayersPerTable || 2,
            maxPlayersPerTable: data.maxPlayersPerTable || 4,
            exactTableSize: data.exactTableSize,
            hasTimer: data.hasTimer ?? false,
            defaultRoundTimer: data.defaultRoundTimer,
            allowByes: data.allowByes ?? true,
            scoring: data.scoring || { type: 'standard' },
            allowLateRegistration: data.allowLateRegistration ?? true,
            requiresCheckIn: data.requiresCheckIn ?? false,
            avoidRepeatedMatchups: data.avoidRepeatedMatchups,
            epicFinalEnabled: data.epicFinalEnabled,
            epicFinalMaxPlayers: data.epicFinalMaxPlayers,
            maxRounds: data.maxRounds,
            pointsLimit: data.pointsLimit,
            createdAt: new Date().toISOString()
        };

        const sanitized = JSON.parse(JSON.stringify(template));
        await setDoc(doc(db, 'users', userId, 'templates', template.id), sanitized);
        return template;
    },

    deleteTemplate: async (userId: string, templateId: string): Promise<void> => {
        try {
            await deleteDoc(doc(db, 'users', userId, 'templates', templateId));
        } catch (err) {
            console.warn('Could not delete template:', err);
            throw err;
        }
    }
};
