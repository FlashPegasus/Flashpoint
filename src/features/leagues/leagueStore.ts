import { create } from 'zustand';
import type { League } from '../../types';
import { leagueService } from './leagueService';

interface LeagueStore {
    myLeagues: League[];
    publicLeagues: League[];
    activeLeague: League | null;
    isLoading: boolean;

    loadMyLeagues: (userId: string) => Promise<void>;
    loadPublicLeagues: () => Promise<void>;
    loadLeague: (leagueId: string) => Promise<void>;
    createLeague: (data: Partial<League> & { organizerId: string; name: string }) => Promise<League>;
    joinLeagueByCode: (code: string, userId: string, userName: string) => Promise<League>;
    linkTournament: (leagueId: string, tournamentId: string, organizerId: string) => Promise<void>;
    recalculateStandings: (leagueId: string) => Promise<void>;
    deleteLeague: (leagueId: string) => Promise<void>;
    getAuditLogs: (leagueId: string) => Promise<any[]>;
    getMembers: (leagueId: string) => Promise<any[]>;
    updateMemberStatus: (leagueId: string, playerId: string, status: 'active' | 'banned', adminId: string) => Promise<void>;
    addOrganizer: (leagueId: string, userId: string, role: 'admin' | 'moderator', adminId: string) => Promise<void>;
    getOrganizers: (leagueId: string) => Promise<any[]>;
    archiveSeason: (leagueId: string, seasonName: string, adminId: string) => Promise<void>;
    getSeasons: (leagueId: string) => Promise<any[]>;
    clearActiveLeague: () => void;
}

export const useLeagueStore = create<LeagueStore>((set) => ({
    myLeagues: [],
    publicLeagues: [],
    activeLeague: null,
    isLoading: false,

    loadMyLeagues: async (userId) => {
        set({ isLoading: true });
        try {
            const leagues = await leagueService.getUserLeagues(userId);
            set({ myLeagues: leagues, isLoading: false });
        } catch (err) {
            set({ isLoading: false });
            console.error(err);
        }
    },

    loadPublicLeagues: async () => {
        set({ isLoading: true });
        try {
            const leagues = await leagueService.getPublicLeagues();
            set({ publicLeagues: leagues, isLoading: false });
        } catch (err) {
            set({ isLoading: false });
        }
    },

    loadLeague: async (leagueId) => {
        set({ isLoading: true });
        try {
            const league = await leagueService.getLeagueById(leagueId);
            set({ activeLeague: league || null, isLoading: false });
        } catch (err) {
            set({ isLoading: false });
        }
    },

    createLeague: async (data) => {
        set({ isLoading: true });
        try {
            const league = await leagueService.createLeague(data);
            set(state => ({
                myLeagues: [...state.myLeagues, league],
                isLoading: false
            }));
            return league;
        } catch (err) {
            set({ isLoading: false });
            throw err;
        }
    },

    joinLeagueByCode: async (code, userId, userName) => {
        const league = await leagueService.joinLeagueByCode(code, userId, userName);
        set(state => ({ myLeagues: [...state.myLeagues.filter(l => l.id !== league.id), league] }));
        return league;
    },

    linkTournament: async (leagueId, tournamentId, organizerId) => {
        await leagueService.linkTournament(leagueId, tournamentId, organizerId);
        // Refresh active league
        const updated = await leagueService.getLeagueById(leagueId);
        set({ activeLeague: updated || null });
    },

    recalculateStandings: async (leagueId) => {
        await leagueService.recalculateStandings(leagueId);
        const updated = await leagueService.getLeagueById(leagueId);
        set({ activeLeague: updated || null });
    },

    deleteLeague: async (leagueId) => {
        await leagueService.deleteLeague(leagueId);
        set(state => ({
            myLeagues: state.myLeagues.filter(l => l.id !== leagueId),
            publicLeagues: state.publicLeagues.filter(l => l.id !== leagueId),
            activeLeague: state.activeLeague?.id === leagueId ? null : state.activeLeague
        }));
    },

    getAuditLogs: async (leagueId) => {
        return await leagueService.getAuditLogs(leagueId);
    },

    getMembers: async (leagueId) => {
        return await leagueService.getMembers(leagueId);
    },

    updateMemberStatus: async (leagueId, playerId, status, adminId) => {
        await leagueService.updateMemberStatus(leagueId, playerId, status, adminId);
    },

    addOrganizer: async (leagueId, userId, role, adminId) => {
        await leagueService.addOrganizer(leagueId, userId, role, adminId);
    },

    getOrganizers: async (leagueId) => {
        return await leagueService.getOrganizers(leagueId);
    },

    archiveSeason: async (leagueId, seasonName, adminId) => {
        await leagueService.archiveSeason(leagueId, seasonName, adminId);
        // Refresh active league after archive/reset
        const updated = await leagueService.getLeagueById(leagueId);
        set({ activeLeague: updated || null });
    },

    getSeasons: async (leagueId) => {
        return await leagueService.getSeasons(leagueId);
    },

    clearActiveLeague: () => set({ activeLeague: null }),
}));
