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
 * Refined to prioritize table density (max players) and strictly respect limits.
 */
export function generateTableSizes(count: number, min: number = 3, max: number = 4): number[] {
    if (count <= 0) return [];
    
    // For very small counts, we might have Byes depending on min configuration
    if (count < min) return [count];

    // Find number of tables k. We want k such that k*min <= N <= k*max
    const kMin = Math.ceil(count / max);
    const kMax = Math.floor(count / min);

    // If we can satisfy the [min, max] range for all tables
    if (kMin <= kMax) {
        const k = kMin; // Maximize density by using the smallest k
        const q = Math.floor(count / k);
        const r = count % k;
        const result = new Array(k).fill(q);
        for (let i = 0; i < r; i++) result[i]++;
        return result;
    }

    // If no perfect k exists (e.g., N=5, min=3, max=4), compromise by filling to max
    const k = kMin;
    const sizes: number[] = [];
    let remaining = count;
    for (let i = 0; i < k - 1; i++) {
        sizes.push(max);
        remaining -= max;
    }
    sizes.push(remaining);
    return sizes;
}

/**
 * Manually swap two participants between tables in a round.
 */
export const swapParticipantsBetweenTables = (
    tables: Table[],
    tableAId: string,
    playerAId: string,
    tableBId: string,
    playerBId: string
): Table[] => {
    return tables.map(table => {
        if (table.id === tableAId) {
            return {
                ...table,
                playerIds: table.playerIds.map(id => id === playerAId ? playerBId : id)
            };
        }
        if (table.id === tableBId) {
            return {
                ...table,
                playerIds: table.playerIds.map(id => id === playerBId ? playerAId : id)
            };
        }
        return table;
    });
};

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

    const sizes = generateTableSizes(sortedPlayers.length, config.minPerTable, config.maxPerTable);
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
