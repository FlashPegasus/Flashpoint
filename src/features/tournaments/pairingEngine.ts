import type { Participant, Table } from '../../types';
import { v4 as uuidv4 } from 'uuid';

// ─────────────────────────────────────────────
// Swiss Pairing Engine (1v1)
// ─────────────────────────────────────────────
interface SwissOptions {
    pairingMode: 'standard' | 'fair';
}

/**
 * Helper to shuffle an array (Fisher-Yates)
 */
const shuffle = <T>(array: T[]): T[] => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
};

/**
 * Advanced Swiss pairing algorithm for 1v1.
 * Sorts by points, avoids repeated matchups, handles odd counts with a Bye.
 */
export const generateSwissPairings = (
    participants: Participant[],
    _previousRounds: any[],
    options: SwissOptions = { pairingMode: 'standard' }
): Table[] => {
    const activePlayers = participants.filter(p => p.status === 'active');

    // Add randomization for tie-breaks (solves the "Regenerate" problem)
    const sortedPlayers = shuffle([...activePlayers]).sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
        return (b.buchholz || 0) - (a.buchholz || 0);
    });

    const tables: Table[] = [];
    const pairedIds = new Set<string>();

    for (let i = 0; i < sortedPlayers.length; i++) {
        const playerA = sortedPlayers[i];
        if (pairedIds.has(playerA.playerId)) continue;

        let bestOpponentIndex = -1;
        let bestOpponentScoreGap = Infinity;
        let foundNewOpponent = false;

        for (let j = i + 1; j < sortedPlayers.length; j++) {
            const playerB = sortedPlayers[j];
            if (pairedIds.has(playerB.playerId)) continue;

            const hasPlayedBefore = playerA.previousOpponents?.includes(playerB.playerId);
            const scoreGap = Math.abs(playerA.totalPoints - playerB.totalPoints);

            const isBetterOpponent =
                (!foundNewOpponent && !hasPlayedBefore) ||
                (foundNewOpponent && !hasPlayedBefore && scoreGap < bestOpponentScoreGap) ||
                (!foundNewOpponent && hasPlayedBefore && scoreGap < bestOpponentScoreGap);

            if (isBetterOpponent) {
                bestOpponentIndex = j;
                bestOpponentScoreGap = scoreGap;
                if (!hasPlayedBefore) foundNewOpponent = true;
            }
        }

        if (options.pairingMode === 'fair' && !foundNewOpponent) {
            // Fair mode: avoiding repeats is the primary goal (already handled above)
        }

        if (bestOpponentIndex !== -1) {
            const opponent = sortedPlayers[bestOpponentIndex];
            tables.push({
                id: uuidv4(),
                playerIds: [playerA.playerId, opponent.playerId],
                results: [],
                status: 'pending'
            });
            pairedIds.add(playerA.playerId);
            pairedIds.add(opponent.playerId);
        } else {
            // Bye
            tables.push({
                id: uuidv4(),
                playerIds: [playerA.playerId],
                results: [{ playerId: playerA.playerId, status: 'BYE', points: 5 }],
                status: 'completed'
            });
            pairedIds.add(playerA.playerId);
        }
    }

    return tables;
};

// ─────────────────────────────────────────────
// Multiplayer Table Engine (Commander / 3-5p)
// ─────────────────────────────────────────────
interface MultiplayerConfig {
    minPerTable: number;
    maxPerTable: number;
    exactSize?: number;
    byeIfPlayersLessEqual?: number;
    avoidRepeats?: boolean;
}

/**
 * Technical Handoff - Table Size Generation Logic
 */
function generateTableSizes(count: number): number[] {
    const sizes: number[] = [];
    let players = count;

    while (players > 0) {
        if (players === 5) { sizes.push(5); break; }
        if (players === 6) { sizes.push(3, 3); break; }
        if (players === 7) { sizes.push(4, 3); break; }
        if (players === 8) { sizes.push(4, 4); break; }
        if (players === 9) { sizes.push(3, 3, 3); break; }

        if (players >= 10) {
            const rem = players % 4;
            if (rem === 0) { sizes.push(4); players -= 4; continue; }
            if (rem === 1) { sizes.push(5); players -= 5; continue; }
            if (rem === 2) { sizes.push(3); players -= 3; continue; }
            if (rem === 3) { sizes.push(3); players -= 3; continue; }
        } else {
            // Backup for < 10 not handled above
            sizes.push(players);
            break;
        }
    }
    return sizes;
}

/**
 * Multiplayer table assignment engine.
 * Based on Technical Handoff rules.
 */
export const generateMultiplayerTables = (
    participants: Participant[],
    config: MultiplayerConfig
): Table[] => {
    // Randomize tie-breaks
    const activePlayers = shuffle(participants.filter(p => p.status === 'active'));
    const sortedPlayers = [...activePlayers].sort((a, b) => b.totalPoints - a.totalPoints);

    if (sortedPlayers.length === 0) return [];

    const sizes = generateTableSizes(sortedPlayers.length);
    const tables: Table[] = [];
    let index = 0;

    const byeThreshold = config.byeIfPlayersLessEqual || 2;

    for (const size of sizes) {
        const tablePlayers = sortedPlayers.slice(index, index + size);
        const tablePlayerIds = tablePlayers.map(p => p.playerId);
        
        const isBye = tablePlayerIds.length <= byeThreshold;
        
        tables.push({
            id: uuidv4(),
            playerIds: tablePlayerIds,
            results: isBye ? tablePlayerIds.map(pid => ({ playerId: pid, status: 'BYE' as const, points: 5 })) : [],
            status: isBye ? 'completed' : 'pending'
        });
        
        index += size;
    }

    // Best-effort anti-repeat for multiplayer
    if (config.avoidRepeats) {
        for (let i = 0; i < tables.length - 1; i++) {
            const tableA = tables[i];
            if (tableA.status === 'completed') continue;

            for (let j = 0; j < tableA.playerIds.length; j++) {
                const pidA = tableA.playerIds[j];
                const playerA = sortedPlayers.find(p => p.playerId === pidA);
                
                const otherInTable = tableA.playerIds.filter(id => id !== pidA);
                const hasPlayedBefore = playerA?.previousOpponents?.some(oppId => otherInTable.includes(oppId));

                if (hasPlayedBefore) {
                    // Try to swap with someone from table i+1
                    const tableB = tables[i + 1];
                    if (tableB.status === 'completed') continue;

                    for (let k = 0; k < tableB.playerIds.length; k++) {
                        const pidB = tableB.playerIds[k];
                        const playerB = sortedPlayers.find(p => p.playerId === pidB);

                        // Swap if playerB hasn't played with A's group and playerA hasn't played with B's group
                        // Simplified check for swap safety
                        const otherInTableA = tableA.playerIds.filter(id => id !== pidA);
                        const otherInTableB = tableB.playerIds.filter(id => id !== pidB);

                        const safetyA = !playerA?.previousOpponents?.some(oppId => otherInTableB.includes(oppId));
                        const safetyB = !playerB?.previousOpponents?.some(oppId => otherInTableA.includes(oppId));

                        if (safetyA && safetyB) {
                            tableA.playerIds[j] = pidB;
                            tableB.playerIds[k] = pidA;
                            break;
                        }
                    }
                }
            }
        }
    }

    return tables;
};
