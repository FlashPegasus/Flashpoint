import { tournamentService } from './tournamentService';
import { storage } from '../utils/storage';

export const firebaseExportService = {
    exportData: () => {
        const tournaments = tournamentService.getTournaments();
        const users = storage.get('users', []);

        const data = {
            version: '1.0.0',
            exportedAt: new Date().toISOString(),
            collections: {
                tournaments: tournaments,
                users: users
            }
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `flashpoint_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
};
