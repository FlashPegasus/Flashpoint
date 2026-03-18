import { create } from 'zustand';
import type { Tournament, Participant, TableResult, ResultStatus } from '../../types';
import { tournamentService } from './tournamentService';

interface TournamentState {
    tournaments: Tournament[];
    activeTournament: Tournament | null;
    isLoading: boolean;

    loadTournaments: () => Promise<void>;
    loadTournament: (id: string) => Promise<void>;
    createTournament: (data: Partial<Tournament>) => Promise<Tournament>;
    addParticipant: (tournamentId: string, player: Partial<Participant>) => Promise<void>;
    withdrawParticipant: (tournamentId: string, playerId: string) => Promise<void>;
    reactivateParticipant: (tournamentId: string, playerId: string) => Promise<void>;
    generateRound: (tournamentId: string) => Promise<void>;
    regenerateRound: (tournamentId: string) => Promise<void>;
    submitResult: (tournamentId: string, roundNumber: number, tableId: string, results: TableResult[]) => Promise<void>;
    completeTournament: (tournamentId: string) => Promise<void>;
    publishTournament: (tournamentId: string) => Promise<void>;
    toggleCheckIn: (tournamentId: string, playerId: string, status: boolean) => Promise<void>;
    reportPlayerResult: (tournamentId: string, roundNumber: number, tableId: string, playerId: string, status: ResultStatus) => Promise<void>;
}

export const useTournamentStore = create<TournamentState>((set, get) => ({
    tournaments: [],
    activeTournament: null,
    isLoading: false,

    loadTournaments: async () => {
        set({ isLoading: true });
        try {
            const local = await tournamentService.getTournaments();
            const publicTournaments = await tournamentService.getPublicTournaments();
            
            // Merge and de-duplicate
            const combined = [...local];
            publicTournaments.forEach(pt => {
                if (!combined.find(t => t.id === pt.id)) {
                    combined.push(pt);
                }
            });
            
            set({ tournaments: combined, isLoading: false });
        } catch (err) {
            set({ isLoading: false });
        }
    },

    loadTournament: async (id: string) => {
        set({ isLoading: true });
        try {
            const tournament = await tournamentService.getTournamentById(id);
            set({ activeTournament: tournament || null, isLoading: false });
        } catch (err) {
            set({ isLoading: false });
        }
    },

    createTournament: async (data) => {
        const t = await tournamentService.createTournament(data);
        await get().loadTournaments();
        return t;
    },

    addParticipant: async (id, player) => {
        await tournamentService.addParticipant(id, player);
        await get().loadTournament(id);
        await get().loadTournaments();
    },

    withdrawParticipant: async (id, playerId) => {
        await tournamentService.withdrawParticipant(id, playerId);
        await get().loadTournament(id);
    },

    reactivateParticipant: async (id, playerId) => {
        await tournamentService.reactivateParticipant(id, playerId);
        await get().loadTournament(id);
    },

    generateRound: async (id) => {
        await tournamentService.generateNextRound(id);
        await get().loadTournament(id);
    },

    regenerateRound: async (id) => {
        await tournamentService.regenerateRound(id);
        await get().loadTournament(id);
    },

    submitResult: async (id, roundNum, tableId, results) => {
        await tournamentService.recordTableResult(id, roundNum, tableId, results);
        await get().loadTournament(id);
    },

    completeTournament: async (id) => {
        await tournamentService.completeTournament(id);
        await get().loadTournament(id);
        await get().loadTournaments();
    },

    publishTournament: async (id) => {
        await tournamentService.publishTournament(id);
        await get().loadTournament(id);
        await get().loadTournaments();
    },

    toggleCheckIn: async (id, playerId, status) => {
        await tournamentService.toggleCheckIn(id, playerId, status);
        await get().loadTournament(id);
    },

    reportPlayerResult: async (id, roundNum, tableId, playerId, status) => {
        await tournamentService.reportPlayerResult(id, roundNum, tableId, playerId, status);
        await get().loadTournament(id);
    },
}));
