import type { League, LeagueStanding } from '../../types';
import { db, rtdb } from '../../lib/firebase';
import { onValue, ref, set, serverTimestamp } from 'firebase/database';
import {
    doc, getDoc, setDoc, updateDoc, deleteDoc,
    collection, getDocs, query, where, arrayUnion, arrayRemove
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { tournamentService } from '../tournaments/tournamentService';

const LEAGUES_COLLECTION = 'leagues';

/** Generate a short, readable invite code like "DRAGON24" */
const generateInviteCode = (): string => {
    const words = ['FLASH', 'BLADE', 'STORM', 'FORGE', 'CREST', 'HONOR', 'CROWN', 'EAGLE'];
    const word = words[Math.floor(Math.random() * words.length)];
    const num = Math.floor(10 + Math.random() * 90);
    return `${word}${num}`;
};

export const leagueService = {
    createLeague: async (data: Partial<League> & { organizerId: string; name: string }): Promise<League> => {
        const league: League = {
            id: uuidv4(),
            name: data.name,
            description: data.description || '',
            organizerId: data.organizerId,
            startDate: data.startDate || new Date().toISOString(),
            endDate: data.endDate || '',
            status: 'active',
            scoringType: data.scoringType || 'sum',
            scoringParams: data.scoringParams || {},
            tournamentIds: [],
            memberIds: [data.organizerId],
            standings: [],
            inviteCode: generateInviteCode(),
            bannerUrl: data.bannerUrl || '',
            visibility: data.visibility || 'public',
            pointsParticipation: data.pointsParticipation ?? 1,
            pointsWin: data.pointsWin ?? 5,
            pointsTop4: data.pointsTop4 ?? 3,
            pointsTop8: data.pointsTop8 ?? 2,
            streakBonus: data.streakBonus ?? 0,
            bestXof: data.bestXof,
        };

        // Remove undefined values since Firestore does not support them
        const sanitizedLeague = Object.fromEntries(
            Object.entries(league).filter(([_, v]) => v !== undefined)
        );

        await setDoc(doc(db, LEAGUES_COLLECTION, league.id), sanitizedLeague);
        await leagueService._notifyUpdate(league.id);
        return league;
    },

    getLeagueById: async (leagueId: string): Promise<League | undefined> => {
        const snap = await getDoc(doc(db, LEAGUES_COLLECTION, leagueId));
        return snap.exists() ? (snap.data() as League) : undefined;
    },

    getLeagueByInviteCode: async (code: string): Promise<League | undefined> => {
        const q = query(
            collection(db, LEAGUES_COLLECTION),
            where('inviteCode', '==', code.toUpperCase())
        );
        const snap = await getDocs(q);
        if (snap.empty) return undefined;
        return snap.docs[0].data() as League;
    },

    getPublicLeagues: async (): Promise<League[]> => {
        const q = query(collection(db, LEAGUES_COLLECTION), where('visibility', '==', 'public'));
        const snap = await getDocs(q);
        return snap.docs.map(d => d.data() as League);
    },

    getUserLeagues: async (userId: string): Promise<League[]> => {
        const q = query(collection(db, LEAGUES_COLLECTION), where('memberIds', 'array-contains', userId));
        const snap = await getDocs(q);
        return snap.docs.map(d => d.data() as League);
    },

    joinLeague: async (leagueId: string, userId: string): Promise<void> => {
        const league = await leagueService.getLeagueById(leagueId);
        if (!league) throw new Error('Liga não encontrada.');
        if (league.memberIds.includes(userId)) throw new Error('Você já é membro desta liga.');
        await updateDoc(doc(db, LEAGUES_COLLECTION, leagueId), {
            memberIds: arrayUnion(userId)
        });
        await leagueService._notifyUpdate(leagueId);
    },

    joinLeagueByCode: async (code: string, userId: string): Promise<League> => {
        const league = await leagueService.getLeagueByInviteCode(code);
        if (!league) throw new Error('Código de convite inválido ou expirado.');
        await leagueService.joinLeague(league.id, userId);
        return league;
    },

    linkTournament: async (leagueId: string, tournamentId: string, organizerId: string): Promise<void> => {
        const league = await leagueService.getLeagueById(leagueId);
        if (!league) throw new Error('Liga não encontrada.');
        if (league.organizerId !== organizerId) throw new Error('Apenas o organizador pode vincular torneios.');
        if (league.tournamentIds.includes(tournamentId)) throw new Error('Torneio já vinculado.');

        await updateDoc(doc(db, LEAGUES_COLLECTION, leagueId), {
            tournamentIds: arrayUnion(tournamentId)
        });

        // Also set leagueId on the tournament
        await updateDoc(doc(db, 'tournaments', tournamentId), { leagueId });
        await leagueService._notifyUpdate(leagueId);
    },

    unlinkTournament: async (leagueId: string, tournamentId: string): Promise<void> => {
        await updateDoc(doc(db, LEAGUES_COLLECTION, leagueId), {
            tournamentIds: arrayRemove(tournamentId)
        });
        await leagueService._notifyUpdate(leagueId);
    },

    /**
     * Recalculate standings after a tournament completes.
     * Reads all linked tournaments from Firestore and rebuilds standings.
     */
    recalculateStandings: async (leagueId: string): Promise<void> => {
        const league = await leagueService.getLeagueById(leagueId);
        if (!league) return;

        // Collect per-player scores from each linked tournament
        const playerScores: Record<string, { points: number; tournaments: number[]; name: string }> = {};

        for (const tId of league.tournamentIds) {
            const tournament = await tournamentService.getTournamentById(tId);
            if (!tournament || tournament.status !== 'completed') continue;

            // Award points based on league scoring config
            tournament.participants.forEach(p => {
                const rank = p.rank ?? 999;
                let points = league.pointsParticipation ?? 1;
                if (rank === 1) points += (league.pointsWin ?? 5);
                else if (rank <= 4) points += (league.pointsTop4 ?? 3);
                else if (rank <= 8) points += (league.pointsTop8 ?? 2);

                if (!playerScores[p.playerId]) {
                    playerScores[p.playerId] = { points: 0, tournaments: [], name: p.name };
                }
                playerScores[p.playerId].tournaments.push(points);
            });
        }

        // Apply "Best X of Y" rule if configured
        const bestX = league.bestXof;
        const standings: LeagueStanding[] = Object.entries(playerScores).map(([playerId, data]) => {
            let sorted = [...data.tournaments].sort((a, b) => b - a);
            if (bestX && sorted.length > bestX) sorted = sorted.slice(0, bestX);
            const total = sorted.reduce((sum, v) => sum + v, 0);
            return {
                playerId,
                playerName: data.name,
                totalPoints: total,
                tournamentsPlayed: data.tournaments.length,
                rank: 0
            };
        }).sort((a, b) => b.totalPoints - a.totalPoints);

        standings.forEach((s, i) => { s.rank = i + 1; });

        // Cache top 10 in main doc for fast homepage loads
        const cachedTopRanking = standings.slice(0, 10);

        await updateDoc(doc(db, LEAGUES_COLLECTION, leagueId), { standings, cachedTopRanking });
        await leagueService._notifyUpdate(leagueId);
    },

    updateLeague: async (leagueId: string, data: Partial<League>): Promise<void> => {
        await updateDoc(doc(db, LEAGUES_COLLECTION, leagueId), data as Record<string, unknown>);
        await leagueService._notifyUpdate(leagueId);
    },

    deleteLeague: async (leagueId: string): Promise<void> => {
        await deleteDoc(doc(db, LEAGUES_COLLECTION, leagueId));
    },

    subscribeToUpdates: (leagueId: string, onUpdate: () => void) => {
        const syncRef = ref(rtdb, `sync/leagues/${leagueId}`);
        return onValue(syncRef, (snap) => {
            if (snap.exists()) onUpdate();
        });
    },

    _notifyUpdate: async (leagueId: string) => {
        try {
            const syncRef = ref(rtdb, `sync/leagues/${leagueId}`);
            await set(syncRef, { lastUpdated: serverTimestamp() });
        } catch (err) {
            console.warn('League sync signal failed:', err);
        }
    }
};
