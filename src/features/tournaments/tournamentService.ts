import type { Tournament, Participant, Round, Table, TableResult } from '../../types';
import { storage } from '../../utils/storage';
import { syncService } from './syncService';
import { v4 as uuidv4 } from 'uuid';
import { generateSwissPairings, generateMultiplayerTables } from './pairingEngine';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

const STORAGE_KEY = 'tournaments';

export const tournamentService = {
    getTournaments: async (): Promise<Tournament[]> => {
        return await storage.get<Tournament[]>(STORAGE_KEY, []);
    },

    getTournamentById: async (id: string): Promise<Tournament | undefined> => {
        const tournaments = await tournamentService.getTournaments();
        let localTournament = tournaments.find(t => t.id === id);

        // Sync from Firestore to ensure we have latest participants (if someone joined from another device)
        try {
            const docSnap = await getDoc(doc(db, 'tournaments', id));
            if (docSnap.exists()) {
                const remoteTournament = docSnap.data() as Tournament;
                // If local exists, update it with remote to keep synced
                if (localTournament) {
                    const index = tournaments.findIndex(t => t.id === id);
                    if (index !== -1) {
                        tournaments[index] = remoteTournament;
                        await storage.set(STORAGE_KEY, tournaments);
                    }
                }
                return remoteTournament;
            }
        } catch (err) {
            console.warn('Could not sync from Firestore in getTournamentById:', err);
        }

        return localTournament;
    },

    // Alias for getTournamentById (used by JoinTournament page)
    getTournament: async (id: string): Promise<Tournament | undefined> => {
        // First try local storage (organizer's own copy)
        const localTournament = await tournamentService.getTournamentById(id);
        if (localTournament) return localTournament;
        // Fallback: read from the public Firestore collection (for invite links from other devices)
        try {
            const docSnap = await getDoc(doc(db, 'tournaments', id));
            if (docSnap.exists()) {
                return docSnap.data() as Tournament;
            }
        } catch (err) {
            console.warn('Could not read from Firestore public tournaments:', err);
        }
        return undefined;
    },

    joinTournament: async (
        tournamentId: string,
        userId: string,
        userName: string,
        userAvatar?: string,
        commanderInfo?: { commanderName?: string, commanderImageUrl?: string, decklistUrl?: string }
    ): Promise<void> => {
        // Prefer reading the tournament from Firestore public collection (cross-device)
        let tournament: Tournament | undefined;
        try {
            const docSnap = await getDoc(doc(db, 'tournaments', tournamentId));
            if (docSnap.exists()) {
                tournament = docSnap.data() as Tournament;
            }
        } catch (_) { }
        // Fallback to local storage
        if (!tournament) {
            tournament = await tournamentService.getTournamentById(tournamentId);
        }
        if (!tournament) throw new Error('Torneio não encontrado.');
        if (tournament.status !== 'registration' && tournament.status !== 'draft') {
            throw new Error('Este torneio não está aceitando inscrições.');
        }
        const existingParticipant = tournament.participants.find(p => p.playerId === userId);
        if (existingParticipant) {
            if (existingParticipant.status === 'withdrawn') {
                existingParticipant.status = 'active';
                if (commanderInfo) {
                    existingParticipant.commanderName = commanderInfo.commanderName || existingParticipant.commanderName;
                    existingParticipant.commanderImageUrl = commanderInfo.commanderImageUrl || existingParticipant.commanderImageUrl;
                    existingParticipant.decklistUrl = commanderInfo.decklistUrl || existingParticipant.decklistUrl;
                }
            } else {
                throw new Error('Você já está inscrito neste torneio.');
            }
        } else {
            if (tournament.maxParticipants && tournament.participants.length >= tournament.maxParticipants) {
                throw new Error('O torneio está cheio. Nenhuma vaga disponível.');
            }
            const newParticipant: Participant = {
                playerId: userId,
                name: userName,
                avatar: userAvatar || '',
                status: 'active',
                isAnonymous: userId.startsWith('guest_') || (userAvatar === '' && userName === 'Convidado'), // Simple heuristic if not passed
                joinedRound: 0,
                totalPoints: 0,
                ...commanderInfo
            };
            tournament.participants.push(newParticipant);
        }
        // Persist to Firestore public collection (authoritative for invite links)
        // We MUST use updateDoc with specifically 'participants' to pass Firestore security rules!
        try {
            await updateDoc(doc(db, 'tournaments', tournamentId), {
                participants: tournament.participants
            });
        } catch (err: any) {
            console.error('Could not update Firestore public tournament on join:', err);
            throw new Error('Falha ao entrar no torneio: permissão negada ou evento não existe mais.');
        }
        // Also persist to organizer's local/user storage if they're on the same device
        await tournamentService.saveTournament(tournament);
    },

    saveTournament: async (tournament: Tournament): Promise<void> => {
        const tournaments = await tournamentService.getTournaments();
        const index = tournaments.findIndex(t => t.id === tournament.id);
        if (index !== -1) {
            tournaments[index] = tournament;
        } else {
            tournaments.push(tournament);
        }
        await storage.set(STORAGE_KEY, tournaments);
        // Mirror to public Firestore collection so invite links work cross-device
        try {
            await setDoc(doc(db, 'tournaments', tournament.id), tournament, { merge: true });
            // Signal update via RTDB (low cost sync)
            await syncService.notifyUpdate(tournament.id);
        } catch (err) {
            // Non-blocking: if Firestore isn't available, local storage still works
            console.warn('Could not mirror tournament to Firestore:', err);
        }
    },

    deleteTournament: async (tournamentId: string): Promise<void> => {
        const tournaments = await tournamentService.getTournaments();
        const filtered = tournaments.filter(t => t.id !== tournamentId);
        await storage.set(STORAGE_KEY, filtered);

        try {
            await deleteDoc(doc(db, 'tournaments', tournamentId));
        } catch (err) {
            console.warn('Could not delete from Firestore:', err);
        }
    },

    createTournament: async (data: Partial<Tournament>): Promise<Tournament> => {
        const tournament: Tournament = {
            id: uuidv4(),
            name: data.name || 'Untitled Tournament',
            date: data.date || new Date().toISOString(),
            location: data.location || 'Online',
            description: data.description || '',
            format: data.format || '1v1',
            pairingMode: data.pairingMode || 'standard',
            status: 'draft',
            organizerId: data.organizerId || 'mock-id',
            minPlayersPerTable: data.minPlayersPerTable || 2,
            maxPlayersPerTable: data.maxPlayersPerTable || 2,
            exactTableSize: data.exactTableSize,
            scoring: data.scoring || { type: 'standard', pointsPerWin: 3, pointsPerDraw: 1, pointsPerLoss: 0 },
            allowLateRegistration: data.allowLateRegistration ?? true,
            allowWithdrawal: data.allowWithdrawal ?? true,
            maxParticipants: data.maxParticipants,
            participants: [],
            rounds: [],
            ...data
        };

        await tournamentService.saveTournament(tournament);
        return tournament;
    },

    addParticipant: async (tournamentId: string, player: Partial<Participant>): Promise<Participant> => {
        const tournament = await tournamentService.getTournamentById(tournamentId);
        if (!tournament) throw new Error('Tournament not found');

        const existingByName = player.name ? tournament.participants.find(p => p.name.trim().toLowerCase() === player.name!.trim().toLowerCase()) : undefined;
        const existingById = player.playerId ? tournament.participants.find(p => p.playerId === player.playerId) : undefined;

        const existingParticipant = existingById || existingByName;

        if (existingParticipant) {
            if (existingParticipant.status === 'withdrawn') {
                existingParticipant.status = 'active';
                await tournamentService.saveTournament(tournament);
                return existingParticipant;
            } else {
                throw new Error(existingByName ? `Jogador com o nome "${player.name}" já está ativo na mesa.` : 'Jogador já inscrito e ativo.');
            }
        }

        const participant: Participant = {
            playerId: player.playerId || uuidv4(),
            name: player.name || 'New Player',
            status: 'active',
            joinedRound: tournament.rounds.length + 1,
            totalPoints: 0,
            previousOpponents: [],
            ...player
        };

        tournament.participants.push(participant);
        await tournamentService.saveTournament(tournament);
        return participant;
    },

    withdrawParticipant: async (tournamentId: string, playerId: string): Promise<void> => {
        const tournament = await tournamentService.getTournamentById(tournamentId);
        if (!tournament) throw new Error('Tournament not found');

        const participant = tournament.participants.find(p => p.playerId === playerId);
        if (participant) {
            participant.status = 'withdrawn';

            try {
                await updateDoc(doc(db, 'tournaments', tournamentId), {
                    participants: tournament.participants
                });
            } catch (err) {
                console.error('Failed to update public DB on withdraw:', err);
                throw new Error('Erro ao atualizar desistência no servidor.');
            }

            await tournamentService.saveTournament(tournament);
        }
    },

    removeParticipant: async (tournamentId: string, playerId: string): Promise<void> => {
        const tournament = await tournamentService.getTournamentById(tournamentId);
        if (!tournament) throw new Error('Tournament not found');

        tournament.participants = tournament.participants.filter(p => p.playerId !== playerId);

        try {
            await updateDoc(doc(db, 'tournaments', tournamentId), {
                participants: tournament.participants
            });
        } catch (err) {
            console.error('Failed to update public DB on remove:', err);
            throw new Error('Erro ao atualizar exclusão no servidor.');
        }

        await tournamentService.saveTournament(tournament);
    },

    generateNextRound: async (tournamentId: string): Promise<Round> => {
        const tournament = await tournamentService.getTournamentById(tournamentId);
        if (!tournament) throw new Error('Tournament not found');

        const roundNumber = tournament.rounds.length + 1;
        let tables: Table[] = [];

        // Filter only active participants for the new round
        const activeParticipants = tournament.participants.filter(p => {
            if (p.status !== 'active') return false;
            // Enforce check-in for Round 1 if required
            if (tournament.requiresCheckIn && roundNumber === 1 && !p.checkedIn) return false;
            return true;
        });

        if (tournament.format === '1v1') {
            tables = generateSwissPairings(activeParticipants, tournament.rounds, {
                pairingMode: tournament.pairingMode
            });
        } else {
            tables = generateMultiplayerTables(activeParticipants, {
                minPerTable: tournament.minPlayersPerTable,
                maxPerTable: tournament.maxPlayersPerTable,
                exactSize: tournament.exactTableSize
            });
        }

        // Handle Bye/Incomplete tables
        tables.forEach(table => {
            if (table.playerIds.length < (tournament.minPlayersPerTable || 2) && tournament.allowByes) {
                table.status = 'completed';
                table.results = table.playerIds.map(pid => ({
                    playerId: pid,
                    position: 1,
                    points: tournament.format === '1v1' ? 3 : (tournament.scoring.positions?.[tournament.maxPlayersPerTable || 4]?.[1] || 4)
                }));
            }
        });

        const newRound: Round = {
            number: roundNumber,
            tables,
            status: 'pending'
        };

        if (tournament.hasTimer) {
            const duration = tournament.defaultRoundTimer || 50;
            tournament.currentRoundEndTime = new Date(Date.now() + duration * 60000).toISOString();
        }

        tournament.rounds.push(newRound);
        tournament.status = 'ongoing';
        tournament.currentRound = roundNumber;
        tournament.currentRoundData = newRound;
        await tournamentService.saveTournament(tournament);
        return newRound;
    },

    regenerateRound: async (tournamentId: string): Promise<Round> => {
        const tournament = await tournamentService.getTournamentById(tournamentId);
        if (!tournament) throw new Error('Tournament not found');

        if (tournament.rounds.length === 0) throw new Error('No rounds to regenerate');

        const lastRound = tournament.rounds[tournament.rounds.length - 1];
        if (lastRound.status === 'completed' || lastRound.tables.some(t => t.status === 'completed')) {
            throw new Error('Cannot regenerate a round that already has results');
        }

        tournament.rounds.pop();
        return await tournamentService.generateNextRound(tournamentId);
    },

    recalculateStandings: (tournament: Tournament) => {
        // Reset all participants points and opponents
        tournament.participants.forEach(p => {
            p.totalPoints = 0;
            p.previousOpponents = [];
            p.buchholz = 0;
        });

        // Recalculate based on all completed tables in all rounds
        tournament.rounds.forEach(round => {
            round.tables.forEach(t => {
                if (t.status === 'completed' && t.results.length > 0) {
                    // Shared Points Logic
                    const posCounts: Record<number, number> = {};
                    t.results.forEach(r => {
                        posCounts[r.position] = (posCounts[r.position] || 0) + 1;
                    });

                    const sharedPoints: Record<number, number> = {};
                    const sortedUniquePositions = Object.keys(posCounts).map(Number).sort((a, b) => a - b);

                    let currentPosIdx = 1;
                    sortedUniquePositions.forEach(pos => {
                        const count = posCounts[pos];
                        let totalPosPoints = 0;
                        for (let i = 0; i < count; i++) {
                            const rank = currentPosIdx + i;
                            // Fallback to simpler points if positional config is missing for this size
                            const tableSize = t.playerIds.length;
                            const points = tournament.scoring.positions?.[tableSize]?.[rank]
                                || (rank === 1 ? 3 : rank === 2 ? 1 : 0);
                            totalPosPoints += points;
                        }
                        sharedPoints[pos] = totalPosPoints / count;
                        currentPosIdx += count;
                    });

                    t.playerIds.forEach(pid => {
                        const participant = tournament.participants.find(p => p.playerId === pid);
                        if (participant) {
                            const opponents = t.playerIds.filter(id => id !== pid);
                            participant.previousOpponents = [...(participant.previousOpponents || []), ...opponents];

                            const res = t.results.find(r => r.playerId === pid);
                            if (res) {
                                participant.totalPoints += tournament.format === 'multiplayer'
                                    ? sharedPoints[res.position]
                                    : res.points;
                            }
                        }
                    });
                }
            });
        });

        // Calculate tie-breakers
        tournament.participants.forEach(p => {
            let buchholz = 0;
            p.previousOpponents?.forEach(oppId => {
                const opponent = tournament.participants.find(opp => opp.playerId === oppId);
                if (opponent) buchholz += opponent.totalPoints;
            });
            p.buchholz = buchholz;
        });

        // Sort and assign ranks
        tournament.participants.sort((a, b) => {
            if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
            return (b.buchholz || 0) - (a.buchholz || 0);
        });
        tournament.participants.forEach((p, idx) => { p.rank = idx + 1; });
    },

    recordTableResult: async (tournamentId: string, roundNumber: number, tableId: string, results: TableResult[]): Promise<void> => {
        const tournament = await tournamentService.getTournamentById(tournamentId);
        if (!tournament) throw new Error('Tournament not found');

        const round = tournament.rounds.find(r => r.number === roundNumber);
        if (!round) throw new Error('Round not found');

        const table = round.tables.find(t => t.id === tableId);
        if (!table) throw new Error('Table not found');

        table.results = results;
        table.status = 'completed';

        // Check if round is finished
        if (round.tables.every(t => t.status === 'completed')) {
            round.status = 'completed';
        }

        // Always recalculate standings for real-time updates and to avoid double counting
        tournamentService.recalculateStandings(tournament);

        // Sync convenience fields
        tournament.currentRoundData = round;

        await tournamentService.saveTournament(tournament);
    },

    completeTournament: async (tournamentId: string): Promise<void> => {
        const tournament = await tournamentService.getTournamentById(tournamentId);
        if (!tournament) throw new Error('Tournament not found');

        tournament.status = 'completed';
        await tournamentService.saveTournament(tournament);
    },

    publishTournament: async (tournamentId: string): Promise<void> => {
        const tournament = await tournamentService.getTournamentById(tournamentId);
        if (!tournament) throw new Error('Tournament not found');

        tournament.status = 'registration';
        await tournamentService.saveTournament(tournament);
    },

    toggleCheckIn: async (tournamentId: string, playerId: string, status: boolean): Promise<void> => {
        const tournament = await tournamentService.getTournamentById(tournamentId);
        if (!tournament) throw new Error('Tournament not found');

        const participant = tournament.participants.find(p => p.playerId === playerId);
        if (!participant) throw new Error('Participant not found');

        participant.checkedIn = status;
        await tournamentService.saveTournament(tournament);
    },

    getUserStats: async (userId: string) => {
        const tournaments = await tournamentService.getTournaments();
        const participation = tournaments.filter(t =>
            t.participants.some(p => p.playerId === userId)
        );

        let totalMatches = 0;
        let matchesWon = 0;

        tournaments.forEach(t => {
            if (t.status === 'completed' || t.status === 'ongoing') {
                t.rounds.forEach(r => {
                    r.tables.forEach(table => {
                        if (table.status === 'completed' && table.playerIds.includes(userId)) {
                            totalMatches++;
                            const result = table.results.find(res => res.playerId === userId);
                            if (result && result.position === 1) {
                                matchesWon++;
                            }
                        }
                    });
                });
            }
        });

        const winRate = totalMatches > 0 ? Math.round((matchesWon / totalMatches) * 100) : 0;
        const globalRank = await tournamentService.getGlobalRank(userId);

        const stats = {
            totalTournaments: participation.length,
            tournamentsAsOrganizer: tournaments.filter(t => t.organizerId === userId).length,
            wins: 0,
            top3: 0,
            totalPoints: 0,
            winRate: `${winRate}%`,
            globalRank: `#${globalRank}`,
            recentTournaments: participation
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5)
                .map(t => {
                    const p = t.participants.find(part => part.playerId === userId);
                    return {
                        id: t.id,
                        name: t.name,
                        date: t.date,
                        rank: p?.rank,
                        points: p?.totalPoints,
                        status: t.status
                    };
                })
        };

        participation.forEach(t => {
            const p = t.participants.find(part => part.playerId === userId);
            if (p) {
                if (p.rank === 1) stats.wins++;
                if (p.rank && p.rank <= 3) stats.top3++;
                stats.totalPoints += p.totalPoints;
            }
        });

        return stats;
    },

    getGlobalRank: async (userId: string): Promise<number> => {
        try {
            // Ideally we'd fetch all users from Firestore 'users' collection
            // and rank them by stats.accumulatedPoints.
            // For now, let's look at the current user's points vs others if we have them cached
            // but the correct way is a Firestore query.
            // Since I don't have a list of all users in local storage usually, 
            // I'll simulate a fetch or use the accumulatedPoints from the current user.

            // For this implementation, let's assume we fetch top 100 users from Firestore
            // and find where the current user fits.
            // Simplified: return a plausible rank based on points for now or 
            // search across known participants in all tournaments.

            const tournaments = await tournamentService.getTournaments();
            const playerPoints: Record<string, number> = {};

            tournaments.forEach(t => {
                t.participants.forEach(p => {
                    playerPoints[p.playerId] = (playerPoints[p.playerId] || 0) + p.totalPoints;
                });
            });

            const sortedPlayers = Object.entries(playerPoints)
                .sort(([, a], [, b]) => b - a);

            const rank = sortedPlayers.findIndex(([id]) => id === userId) + 1;
            return rank > 0 ? rank : 999;
        } catch (err) {
            console.warn('Error calculating global rank:', err);
            return 999;
        }
    }
};

