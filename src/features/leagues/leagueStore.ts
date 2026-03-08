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
    joinLeagueByCode: (code: string, userId: string) => Promise<League>;
    linkTournament: (leagueId: string, tournamentId: string, organizerId: string) => Promise<void>;
    recalculateStandings: (leagueId: string) => Promise<void>;
    deleteLeague: (leagueId: string) => Promise<void>;
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
        const league = await leagueService.createLeague(data);
        set(state => ({ myLeagues: [...state.myLeagues, league] }));
        return league;
    },

    joinLeagueByCode: async (code, userId) => {
        const league = await leagueService.joinLeagueByCode(code, userId);
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

    clearActiveLeague: () => set({ activeLeague: null }),
}));
