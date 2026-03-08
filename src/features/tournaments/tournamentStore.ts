import { create } from 'zustand';
import type { Tournament, Participant, TableResult } from '../../types';
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
    generateRound: (tournamentId: string) => Promise<void>;
    regenerateRound: (tournamentId: string) => Promise<void>;
    submitResult: (tournamentId: string, roundNumber: number, tableId: string, results: TableResult[]) => Promise<void>;
    completeTournament: (tournamentId: string) => Promise<void>;
}

export const useTournamentStore = create<TournamentState>((set, get) => ({
    tournaments: [],
    activeTournament: null,
    isLoading: false,

    loadTournaments: async () => {
        const tournaments = await tournamentService.getTournaments();
        set({ tournaments });
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
    }
}));
