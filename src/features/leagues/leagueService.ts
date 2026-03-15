import type { League, LeagueStanding, LeagueMember, LeagueOrganizer, LeagueSeason } from '../../types';
import { db, rtdb } from '../../lib/firebase';
import { onValue, ref, set, serverTimestamp } from 'firebase/database';
import {
    doc, getDoc, setDoc, updateDoc, deleteDoc,
    collection, getDocs, query, where, arrayUnion, arrayRemove, orderBy, limit, addDoc
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { tournamentService } from '../tournaments/tournamentService';
import { withTimeout } from '../../utils/promiseHelper';

const LEAGUES_COLLECTION = 'leagues';

/** Generate a short, readable invite code like "DRAGON24" */
const generateInviteCode = (): string => {
    const words = ['FLASH', 'BLADE', 'STORM', 'FORGE', 'CREST', 'HONOR', 'CROWN', 'EAGLE'];
    const word = words[Math.floor(Math.random() * words.length)];
    const num = Math.floor(10 + Math.random() * 90);
    return `${word}${num}`;
};

export interface LeagueAuditLog {
    id: string;
    action: string;
    details: string;
    userId: string;
    timestamp: string;
}

export const leagueService = {
    addAuditLog: async (leagueId: string, action: string, details: string, userId: string): Promise<void> => {
        try {
            const auditRef = collection(db, LEAGUES_COLLECTION, leagueId, 'audit_log');
            await addDoc(auditRef, {
                action,
                details,
                userId,
                timestamp: new Date().toISOString()
            });
        } catch (err) {
            console.warn('Failed to add audit log:', err);
        }
    },

    getAuditLogs: async (leagueId: string): Promise<LeagueAuditLog[]> => {
        try {
            const auditRef = collection(db, LEAGUES_COLLECTION, leagueId, 'audit_log');
            const q = query(auditRef, orderBy('timestamp', 'desc'), limit(20));
            const snap = await getDocs(q);
            return snap.docs.map(d => ({ id: d.id, ...d.data() } as LeagueAuditLog));
        } catch (err) {
            console.warn('Failed to get audit logs:', err);
            return [];
        }
    },

    createLeague: async (data: Partial<League> & { organizerId: string; name: string }): Promise<League> => {
        const nameLowercase = data.name.trim().toLowerCase();
        
        // 1. Check uniqueness
        const nameQuery = query(collection(db, LEAGUES_COLLECTION), where('nameLowercase', '==', nameLowercase));
        const nameSnap = await getDocs(nameQuery);
        if (!nameSnap.empty) {
            throw new Error('Já existe uma liga com este nome (ou similar). Escolha um nome exclusivo.');
        }

        const league: League = {
            id: uuidv4(),
            name: data.name.trim(),
            nameLowercase,
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
        leagueService._notifyUpdate(league.id); // fire-and-forget: não bloqueia a criação
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

    getPublicLeagues: async (lastDoc?: any): Promise<{ leagues: League[], lastVisible: any }> => {
        const leaguesRef = collection(db, LEAGUES_COLLECTION);
        let q = query(
            leaguesRef,
            where('visibility', '==', 'public'),
            where('status', '==', 'active'),
            orderBy('createdAt', 'desc'),
            limit(10)
        );

        if (lastDoc) {
            const { startAfter } = await import('firebase/firestore');
            q = query(q, startAfter(lastDoc));
        }

        const snap = await getDocs(q);
        const leagues = snap.docs.map(d => d.data() as League);
        const lastVisible = snap.docs[snap.docs.length - 1];

        return { leagues, lastVisible };
    },

    getUserLeagues: async (userId: string): Promise<League[]> => {
        const q = query(collection(db, LEAGUES_COLLECTION), where('memberIds', 'array-contains', userId));
        const snap = await getDocs(q);
        return snap.docs.map(d => d.data() as League);
    },

    joinLeagueByCode: async (code: string, userId: string, userName: string): Promise<League> => {
        const league = await leagueService.getLeagueByInviteCode(code);
        if (!league) throw new Error('Código de convite inválido ou expirado.');
        await leagueService.joinLeague(league.id, userId, userName);
        return league;
    },

    joinLeague: async (leagueId: string, userId: string, userName: string): Promise<void> => {
        const league = await leagueService.getLeagueById(leagueId);
        if (!league) throw new Error('Liga não encontrada.');
        
        const memberRef = doc(db, LEAGUES_COLLECTION, leagueId, 'members', userId);
        const memberSnap = await getDoc(memberRef);
        
        if (memberSnap.exists()) {
            const status = memberSnap.data().status;
            if (status === 'active') throw new Error('Você já é membro ativo desta liga.');
            if (status === 'pending') throw new Error('Sua solicitação de entrada ainda está pendente.');
            if (status === 'banned') throw new Error('Você foi banido desta liga.');
        }

        // Create member document as 'pending'
        const member: LeagueMember = {
            playerId: userId,
            playerName: userName,
            joinedAt: new Date().toISOString(),
            status: 'pending'
        };
        await setDoc(memberRef, member);

        await leagueService.addAuditLog(leagueId, 'JOIN_REQUEST', `Jogador ${userName} solicitou entrada na liga`, userId);
        leagueService._notifyUpdate(leagueId);
    },

    approveMember: async (leagueId: string, playerId: string, adminId: string): Promise<void> => {
        const memberRef = doc(db, LEAGUES_COLLECTION, leagueId, 'members', playerId);
        const memberSnap = await getDoc(memberRef);
        if (!memberSnap.exists()) throw new Error('Membro não encontrado.');

        const playerName = memberSnap.data().playerName;

        await updateDoc(memberRef, { status: 'active' });
        await updateDoc(doc(db, LEAGUES_COLLECTION, leagueId), {
            memberIds: arrayUnion(playerId)
        });

        await leagueService.addAuditLog(leagueId, 'APPROVE_MEMBER', `Aprovou a entrada de ${playerName}`, adminId);
        leagueService._notifyUpdate(leagueId);
    },

    rejectMember: async (leagueId: string, playerId: string, adminId: string): Promise<void> => {
        const memberRef = doc(db, LEAGUES_COLLECTION, leagueId, 'members', playerId);
        await updateDoc(memberRef, { status: 'rejected' });
        
        await leagueService.addAuditLog(leagueId, 'REJECT_MEMBER', `Rejeitou a entrada do jogador ${playerId}`, adminId);
        leagueService._notifyUpdate(leagueId);
    },

    getMembers: async (leagueId: string): Promise<LeagueMember[]> => {
        const membersRef = collection(db, LEAGUES_COLLECTION, leagueId, 'members');
        const snap = await getDocs(membersRef);
        return snap.docs.map(d => d.data() as LeagueMember);
    },

    updateMemberStatus: async (leagueId: string, playerId: string, status: 'active' | 'banned', adminId: string): Promise<void> => {
        const memberRef = doc(db, LEAGUES_COLLECTION, leagueId, 'members', playerId);
        await updateDoc(memberRef, { status });

        if (status === 'banned') {
            // Remove from active memberIds array
            await updateDoc(doc(db, LEAGUES_COLLECTION, leagueId), {
                memberIds: arrayRemove(playerId)
            });
        } else {
            // Re-add to active memberIds array
            await updateDoc(doc(db, LEAGUES_COLLECTION, leagueId), {
                memberIds: arrayUnion(playerId)
            });
        }

        await leagueService.addAuditLog(leagueId, status === 'banned' ? 'BAN_MEMBER' : 'UNBAN_MEMBER', `Status do jogador ${playerId} alterado para ${status}`, adminId);
        leagueService._notifyUpdate(leagueId);
    },

    addOrganizer: async (leagueId: string, userId: string, role: 'admin' | 'moderator', adminId: string): Promise<void> => {
        const orgRef = doc(db, LEAGUES_COLLECTION, leagueId, 'organizers', userId);
        const organizer: LeagueOrganizer = {
            userId,
            role,
            addedBy: adminId,
            addedAt: new Date().toISOString()
        };
        await setDoc(orgRef, organizer);
        await leagueService.addAuditLog(leagueId, 'ADD_ORGANIZER', `Adicionou ${userId} como ${role}`, adminId);
        leagueService._notifyUpdate(leagueId);
    },

    getOrganizers: async (leagueId: string): Promise<LeagueOrganizer[]> => {
        const orgsRef = collection(db, LEAGUES_COLLECTION, leagueId, 'organizers');
        const snap = await getDocs(orgsRef);
        return snap.docs.map(d => d.data() as LeagueOrganizer);
    },

    archiveSeason: async (leagueId: string, seasonName: string, adminId: string): Promise<void> => {
        const league = await leagueService.getLeagueById(leagueId);
        if (!league) throw new Error('Liga não encontrada');

        const season: LeagueSeason = {
            id: uuidv4(),
            name: seasonName,
            startDate: league.startDate,
            endDate: new Date().toISOString(),
            standings: league.standings,
            finalizedAt: new Date().toISOString()
        };

        // 1. Save snapshot to seasons subcollection
        const seasonRef = doc(db, LEAGUES_COLLECTION, leagueId, 'seasons', season.id);
        await setDoc(seasonRef, season);

        // 2. Reset current league ranking and tournament list for the new season
        await updateDoc(doc(db, LEAGUES_COLLECTION, leagueId), {
            standings: [],
            tournamentIds: [],
            cachedTopRanking: [],
            startDate: new Date().toISOString() // New season starts now
        });

        await leagueService.addAuditLog(leagueId, 'ARCHIVE_SEASON', `Temporada finalizada: ${seasonName}`, adminId);
        leagueService._notifyUpdate(leagueId);
    },

    getSeasons: async (leagueId: string): Promise<LeagueSeason[]> => {
        const seasonsRef = collection(db, LEAGUES_COLLECTION, leagueId, 'seasons');
        const snap = await getDocs(query(seasonsRef, orderBy('finalizedAt', 'desc')));
        return snap.docs.map(d => d.data() as LeagueSeason);
    },

    requestTournamentLink: async (leagueId: string, tournamentId: string, organizerId: string): Promise<void> => {
        const league = await leagueService.getLeagueById(leagueId);
        if (!league) throw new Error('Liga não encontrada.');
        
        // If the requester is also the league organizer, link it immediately
        if (league.organizerId === organizerId) {
            return await leagueService.linkTournament(leagueId, tournamentId, organizerId);
        }

        // Otherwise, creates a request in subcollection
        const requestRef = doc(db, LEAGUES_COLLECTION, leagueId, 'tournament_requests', tournamentId);
        await setDoc(requestRef, {
            tournamentId,
            requesterId: organizerId,
            status: 'pending',
            requestedAt: new Date().toISOString()
        });

        await leagueService.addAuditLog(leagueId, 'LINK_REQUEST', `Torneio ${tournamentId} aguardando aprovação`, organizerId);
        leagueService._notifyUpdate(leagueId);
    },

    getPendingTournamentLinks: async (leagueId: string): Promise<any[]> => {
        const requestsRef = collection(db, LEAGUES_COLLECTION, leagueId, 'tournament_requests');
        const q = query(requestsRef, where('status', '==', 'pending'));
        const snap = await getDocs(q);
        return snap.docs.map(d => d.data());
    },

    approveTournamentLink: async (leagueId: string, tournamentId: string, adminId: string): Promise<void> => {
        const requestRef = doc(db, LEAGUES_COLLECTION, leagueId, 'tournament_requests', tournamentId);
        await updateDoc(requestRef, { status: 'approved' });
        
        await leagueService.linkTournament(leagueId, tournamentId, adminId);
        await leagueService.addAuditLog(leagueId, 'APPROVE_LINK', `Torneio ${tournamentId} aprovado e vinculado`, adminId);
    },

    linkTournament: async (leagueId: string, tournamentId: string, adminId: string): Promise<void> => {
        const league = await leagueService.getLeagueById(leagueId);
        if (!league) throw new Error('Liga não encontrada.');
        
        // This is the direct link (used after approval or by league owner)
        if (league.tournamentIds.includes(tournamentId)) throw new Error('Torneio já vinculado.');

        await updateDoc(doc(db, LEAGUES_COLLECTION, leagueId), {
            tournamentIds: arrayUnion(tournamentId)
        });

        await updateDoc(doc(db, 'tournaments', tournamentId), { leagueId });
        await leagueService.addAuditLog(leagueId, 'LINK_TOURNAMENT', `Vinculou o torneio: ${tournamentId}`, adminId);
        leagueService._notifyUpdate(leagueId);
    },

    unlinkTournament: async (leagueId: string, tournamentId: string, userId: string): Promise<void> => {
        await updateDoc(doc(db, LEAGUES_COLLECTION, leagueId), {
            tournamentIds: arrayRemove(tournamentId)
        });
        await updateDoc(doc(db, 'tournaments', tournamentId), { leagueId: null });
        await leagueService.addAuditLog(leagueId, 'UNLINK_TOURNAMENT', `Desvinculou o torneio: ${tournamentId}`, userId);
        leagueService._notifyUpdate(leagueId);
    },

    /**
     * Recalculate standings after a tournament completes.
     * Reads all linked tournaments from Firestore and rebuilds standings.
     */
    recalculateStandings: async (leagueId: string): Promise<void> => {
        const league = await leagueService.getLeagueById(leagueId);
        if (!league) return;

        // Collect all completed tournaments
        const tournaments = [];
        for (const tId of league.tournamentIds) {
            const tournament = await tournamentService.getTournamentById(tId);
            if (tournament && tournament.status === 'completed') {
                tournaments.push(tournament);
            }
        }

        // Sort chronologically ascending to calculate streaks properly
        tournaments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Fetch all active members first to filter standings efficiently
        const membersRef = collection(db, LEAGUES_COLLECTION, leagueId, 'members');
        const membersSnap = await getDocs(query(membersRef, where('status', '==', 'active')));
        const activeMemberIds = new Set(membersSnap.docs.map(d => d.id));

        // Collect per-player scores
        const playerScores: Record<string, { pointsList: number[]; name: string; currentStreak: number }> = {};

        for (const tournament of tournaments) {
            tournament.participants.forEach(p => {
                // Check if player is an active member using the cached set
                if (!activeMemberIds.has(p.playerId)) return; // Skip players not approved

                const rank = p.rank ?? 999;
                let points = league.pointsParticipation ?? 1;

                if (rank === 1) points += (league.pointsWin ?? 5);
                else if (rank <= 4) points += (league.pointsTop4 ?? 3);
                else if (rank <= 8) points += (league.pointsTop8 ?? 2);

                if (!playerScores[p.playerId]) {
                    playerScores[p.playerId] = { pointsList: [], name: p.name, currentStreak: 0 };
                }

                // Top 4 finishes count towards the streak
                if (rank <= 4) {
                    playerScores[p.playerId].currentStreak += 1;
                    if (playerScores[p.playerId].currentStreak >= 2 && league.streakBonus) {
                        points += league.streakBonus;
                    }
                } else {
                    playerScores[p.playerId].currentStreak = 0;
                }

                playerScores[p.playerId].pointsList.push(points);
            });
        }

        // Apply "Best X of Y" rule if configured
        const bestX = league.bestXof;
        const standings: LeagueStanding[] = Object.entries(playerScores).map(([playerId, data]) => {
            let sorted = [...data.pointsList].sort((a, b) => b - a);
            if (bestX && sorted.length > bestX) sorted = sorted.slice(0, bestX);
            const total = sorted.reduce((sum, v) => sum + v, 0);
            return {
                playerId,
                playerName: data.name,
                totalPoints: total,
                tournamentsPlayed: data.pointsList.length,
                currentStreak: data.currentStreak,
                rank: 0
            };
        }).sort((a, b) => b.totalPoints - a.totalPoints);

        standings.forEach((s, i) => { s.rank = i + 1; });

        // Cache top 10 in main doc for fast homepage loads
        const cachedTopRanking = standings.slice(0, 10);

        await updateDoc(doc(db, LEAGUES_COLLECTION, leagueId), { standings, cachedTopRanking });
        leagueService._notifyUpdate(leagueId);
    },

    updateLeague: async (leagueId: string, data: Partial<League>, userId?: string): Promise<void> => {
        await updateDoc(doc(db, LEAGUES_COLLECTION, leagueId), data as Record<string, unknown>);
        if (userId) {
            await leagueService.addAuditLog(leagueId, 'UPDATE_LEAGUE', `Alterou configurações da liga`, userId);
        }
        leagueService._notifyUpdate(leagueId);
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
            await withTimeout(
                set(syncRef, { lastUpdated: serverTimestamp() }),
                3000,
                'RTDB sync timeout'
            );
        } catch (err) {
            console.warn(`[RTDB Fallback] League sync signal failed or timed out for ${leagueId}:`, err);
        }
    }
};
