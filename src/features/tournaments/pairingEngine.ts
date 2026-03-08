import type { Participant, Table } from '../../types';
import { v4 as uuidv4 } from 'uuid';

// ─────────────────────────────────────────────
// Swiss Pairing Engine (1v1)
// ─────────────────────────────────────────────
interface SwissOptions {
    pairingMode: 'standard' | 'fair';
}

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

    const sortedPlayers = [...activePlayers].sort((a, b) => {
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
                results: [{ playerId: playerA.playerId, position: 1, points: 3 }],
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
}

/**
 * Multiplayer table assignment engine.
 * Highly flexible for Commander (3-5 players) and other formats.
 */
export const generateMultiplayerTables = (
    participants: Participant[],
    config: MultiplayerConfig
): Table[] => {
    const activePlayers = participants.filter(p => p.status === 'active');
    const sortedPlayers = [...activePlayers].sort((a, b) => b.totalPoints - a.totalPoints);

    const tables: Table[] = [];
    if (sortedPlayers.length === 0) return [];

    const targetSize = config.exactSize || config.maxPerTable || 4;
    const minSize = config.minPerTable || 3;

    let remainingPlayers = [...sortedPlayers];

    while (remainingPlayers.length >= minSize) {
        let takeCount = targetSize;
        const remainder = remainingPlayers.length - targetSize;

        if (remainder > 0 && remainder < minSize) {
            takeCount = Math.floor(remainingPlayers.length / 2);
        } else if (remainingPlayers.length < targetSize) {
            takeCount = remainingPlayers.length;
        }

        const tablePlayers = remainingPlayers.splice(0, takeCount);
        tables.push({
            id: uuidv4(),
            playerIds: tablePlayers.map(p => p.playerId),
            results: [],
            status: 'pending'
        });
    }

    // Leftovers get a Bye table
    if (remainingPlayers.length > 0) {
        tables.push({
            id: uuidv4(),
            playerIds: remainingPlayers.map(p => p.playerId),
            results: [],
            status: 'pending'
        });
    }

    return tables;
};
