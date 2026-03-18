import type { Tournament, Participant, Round, Table, TableResult, ResultStatus } from '../../types';
import { storage } from '../../utils/storage';
import { syncService } from './syncService';
import { v4 as uuidv4 } from 'uuid';
import { generateSwissPairings, generateMultiplayerTables } from './pairingEngine';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc, deleteDoc, updateDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';

const STORAGE_KEY = 'tournaments';

export const tournamentService = {
    getTournaments: async (): Promise<Tournament[]> => {
        return await storage.get<Tournament[]>(STORAGE_KEY, []);
    },

    getPublicTournaments: async (): Promise<Tournament[]> => {
        try {
            const q = query(
                collection(db, 'tournaments'),
                where('status', 'in', ['registration', 'ongoing', 'completed']),
                limit(30)
            );
            const snap = await getDocs(q);
            return snap.docs.map(d => d.data() as Tournament);
        } catch (err) {
            console.error('Error fetching public tournaments:', err);
            return [];
        }
    },

    getTournamentById: async (id: string): Promise<Tournament | undefined> => {
        const tournaments = await tournamentService.getTournaments();
        const localTournament = tournaments.find(t => t.id === id);

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
            // If tournament is ongoing, check for late registration
            if (tournament.status === 'ongoing' && tournament.allowLateRegistration) {
                // Allowed
            } else {
                throw new Error('As inscrições para este torneio estão encerradas.');
            }
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
            // Firestore does not accept `undefined` values — strip them recursively
            const sanitized = JSON.parse(JSON.stringify(tournament));
            await setDoc(doc(db, 'tournaments', tournament.id), sanitized, { merge: true });
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

    reactivateParticipant: async (tournamentId: string, playerId: string): Promise<void> => {
        const tournament = await tournamentService.getTournamentById(tournamentId);
        if (!tournament) throw new Error('Tournament not found');

        const participant = tournament.participants.find(p => p.playerId === playerId);
        if (participant) {
            participant.status = 'active';

            try {
                await updateDoc(doc(db, 'tournaments', tournamentId), {
                    participants: tournament.participants
                });
            } catch (err) {
                console.error('Failed to update public DB on reactivate:', err);
                throw new Error('Erro ao atualizar reativação no servidor.');
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

    updateParticipantStatus: async (tournamentId: string, playerId: string, status: Participant['status']): Promise<void> => {
        const tournament = await tournamentService.getTournamentById(tournamentId);
        if (!tournament) throw new Error('Tournament not found');

        const participant = tournament.participants.find(p => p.playerId === playerId);
        if (participant) {
            participant.status = status;
            try {
                await updateDoc(doc(db, 'tournaments', tournamentId), {
                    participants: tournament.participants
                });
            } catch (err) {
                console.error('Failed to update public DB on status change:', err);
                throw new Error('Erro ao atualizar status no servidor.');
            }

            await tournamentService.saveTournament(tournament);
        }
    },

    generateNextRound: async (tournamentId: string): Promise<Round> => {
        const tournament = await tournamentService.getTournamentById(tournamentId);
        if (!tournament) throw new Error('Tournament not found');

        const roundNumber = tournament.rounds.length + 1;
        let tables: Table[] = [];

        // Filter only active participants for the new round
        let activeParticipants = tournament.participants.filter(p => {
            if (p.status !== 'active') return false;
            // Enforce check-in for Round 1 if required
            if (tournament.requiresCheckIn && roundNumber === 1 && !p.checkedIn) return false;
            return true;
        });

        // Battle Royale Logic: Survivors + Winners advance
        if (tournament.format === 'battle_royale' && roundNumber > 1) {
            const lastRound = tournament.rounds[tournament.rounds.length - 1];
            if (lastRound) {
                activeParticipants = activeParticipants.filter(p => {
                    const result = lastRound.tables.flatMap(t => t.results).find(r => r.playerId === p.playerId);
                    return result && (result.status === 'WINNER' || result.status === 'SURVIVED' || result.status === 'BYE');
                });
            }
        }

        // Epic Final Logic: players <= epic_final_max_players
        const useEpicFinal = tournament.epicFinalEnabled && activeParticipants.length <= (tournament.epicFinalMaxPlayers || 5) && roundNumber > 1;

        if (useEpicFinal) {
            tables = [{
                id: uuidv4(),
                playerIds: activeParticipants.map(p => p.playerId),
                results: [],
                status: 'pending'
            }];
        } else if (tournament.format === '1v1') {
            tables = generateSwissPairings(activeParticipants, tournament.rounds, {
                pairingMode: tournament.pairingMode
            });
        } else {
            tables = generateMultiplayerTables(activeParticipants, {
                minPerTable: tournament.minPlayersPerTable || 3,
                maxPerTable: tournament.maxPlayersPerTable || 5,
                exactSize: tournament.exactTableSize,
                byeIfPlayersLessEqual: 2,
                avoidRepeats: tournament.avoidRepeatedMatchups
            });
        }

        // Handle Bye/Incomplete tables
        tables.forEach(table => {
            if (table.playerIds.length < (tournament.minPlayersPerTable || 2) && tournament.allowByes) {
                table.status = 'completed';
                table.results = table.playerIds.map(pid => ({
                    playerId: pid,
                    status: 'BYE',
                    points: 5
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

        // Allow popping the last round to regenerate it
        tournament.rounds.pop();
        
        // IMPORTANT: Recalculate standings after removing the round to clear any points gathered in the popped round
        tournamentService.recalculateStandings(tournament);
        
        // Reset current round counter
        tournament.currentRound = tournament.rounds.length;
        if (tournament.rounds.length > 0) {
            tournament.currentRoundData = tournament.rounds[tournament.rounds.length - 1];
        } else {
            tournament.status = 'registration';
            tournament.currentRound = 0;
            tournament.currentRoundData = undefined;
        }

        // CRITICAL: Save BEFORE calling generateNextRound, because generateNextRound
        // re-fetches from DB. Without this save, the old round is still in DB
        // and generateNextRound creates a DUPLICATE round instead of replacing it.
        await tournamentService.saveTournament(tournament);

        return await tournamentService.generateNextRound(tournamentId);
    },

    swapParticipantsInRound: async (
        tournamentId: string,
        tableAId: string,
        playerAId: string,
        tableBId: string,
        playerBId: string
    ): Promise<void> => {
        const tournament = await tournamentService.getTournamentById(tournamentId);
        if (!tournament) throw new Error('Tournament not found');

        const currentRound = tournament.rounds[tournament.rounds.length - 1];
        if (!currentRound || currentRound.status !== 'pending') {
            throw new Error('Can only swap players in a pending round.');
        }

        const { swapParticipantsBetweenTables } = await import('./pairingEngine');
        currentRound.tables = swapParticipantsBetweenTables(
            currentRound.tables,
            tableAId,
            playerAId,
            tableBId,
            playerBId
        );

        tournament.currentRoundData = currentRound;
        await tournamentService.saveTournament(tournament);
    },

    recalculateStandings: (tournament: Tournament): void => {
        // Reset all participants points and opponents
        tournament.participants.forEach(p => {
            p.totalPoints = 0;
            p.wins = 0; // Ensure wins property exists or is reset
            p.previousOpponents = [];
            p.buchholz = 0;
            p.omw = 0;
        });

        // Recalculate based on all completed tables in all rounds
        tournament.rounds.forEach(round => {
            round.tables.forEach(t => {
                if (t.status === 'completed' && t.results.length > 0) {
                    t.playerIds.forEach(pid => {
                        const participant = tournament.participants.find(p => p.playerId === pid);
                        if (participant) {
                            const opponents = t.playerIds.filter(id => id !== pid);
                            participant.previousOpponents = [...(participant.previousOpponents || []), ...opponents];

                            const res = t.results.find(r => r.playerId === pid);
                            if (res) {
                                // New Handoff Scoring
                                if (res.status === 'WINNER') {
                                    participant.totalPoints += 5;
                                    participant.wins = (participant.wins || 0) + 1;
                                }
                                else if (res.status === 'SURVIVED') participant.totalPoints += 2;
                                else if (res.status === 'BYE') {
                                    participant.totalPoints += 5;
                                    participant.wins = (participant.wins || 0) + 1;
                                }
                                // ELIMINATED and ALL_DEFEATED get 0
                            }
                        }
                    });
                }
            });
        });

        // Calculate tie-breakers:
        // 1. Buchholz (Total Opponent Points)
        // 2. OMW% (Average Opponent Points)
        tournament.participants.forEach(p => {
            let totalOpponentPoints = 0;
            const oppCount = p.previousOpponents?.length || 0;
            
            p.previousOpponents?.forEach(oppId => {
                const opponent = tournament.participants.find(opp => opp.playerId === oppId);
                if (opponent) totalOpponentPoints += opponent.totalPoints;
            });
            
            p.buchholz = totalOpponentPoints;
            p.omw = oppCount > 0 ? totalOpponentPoints / oppCount : 0;
        });

        // Sort and assign ranks (Handoff Order: 1. Points, 2. OMW%, 3. Opponent Points, 4. Wins)
        tournament.participants.sort((a, b) => {
            if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
            if ((b.omw || 0) !== (a.omw || 0)) return (b.omw || 0) - (a.omw || 0);
            if ((b.buchholz || 0) !== (a.buchholz || 0)) return (b.buchholz || 0) - (a.buchholz || 0);
            return (b.wins || 0) - (a.wins || 0);
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
    },

    reportPlayerResult: async (tournamentId: string, roundNumber: number, tableId: string, playerId: string, status: ResultStatus): Promise<void> => {
        const tournament = await tournamentService.getTournamentById(tournamentId);
        if (!tournament) throw new Error('Tournament not found');

        const round = tournament.rounds.find(r => r.number === roundNumber);
        if (!round) throw new Error('Round not found');

        const table = round.tables.find(t => t.id === tableId);
        if (!table) throw new Error('Table not found');

        if (!table.playerReports) table.playerReports = [];

        // Update or add report
        const existingIdx = table.playerReports.findIndex(r => r.playerId === playerId);
        const report = { playerId, status, reportedAt: new Date().toISOString() };

        if (existingIdx !== -1) {
            table.playerReports[existingIdx] = report;
        } else {
            table.playerReports.push(report);
        }

        await tournamentService.saveTournament(tournament);
    },

    /**
     * Data Cleanup: Purge stale drafts and anonymize guest data.
     */
    runDataCleanup: async () => {
        const tournaments = await tournamentService.getTournaments();
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        
        let draftsRemoved = 0;
        let guestsCleaned = 0;

        const updatedTournaments = [];

        for (const t of tournaments) {
            // 1. Remove old drafts (older than 7 days)
            if (t.status === 'draft' && new Date(t.date) < sevenDaysAgo) {
                try {
                    await deleteDoc(doc(db, 'tournaments', t.id));
                    draftsRemoved++;
                    continue; // Skip adding to updatedTournaments
                } catch (err) {
                    console.warn(`Failed to delete old draft ${t.id}:`, err);
                }
            }

            // 2. Anonymize Guest data in completed tournaments
            if (t.status === 'completed') {
                let changed = false;
                t.participants.forEach(p => {
                    if (p.isAnonymous && p.name !== 'Anônimo') {
                        p.name = 'Anônimo';
                        p.avatar = '';
                        p.commanderName = undefined;
                        p.decklistUrl = undefined;
                        p.commanderImageUrl = undefined;
                        changed = true;
                        guestsCleaned++;
                    }
                });
                
                if (changed) {
                    try {
                        await updateDoc(doc(db, 'tournaments', t.id), { participants: t.participants });
                    } catch (err) {
                        console.warn(`Failed to anonymize guests in tournament ${t.id}:`, err);
                    }
                }
            }

            updatedTournaments.push(t);
        }

        await storage.set(STORAGE_KEY, updatedTournaments);
        return { draftsRemoved, guestsCleaned };
    }
};

