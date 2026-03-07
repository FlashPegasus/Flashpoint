import type { Participant, Table } from '../types';
import { v4 as uuidv4 } from 'uuid';

export interface SwissOptions {
    pairingMode: 'standard' | 'fair';
}

/**
 * Advanced Swiss pairing algorithm for 1v1
 * - Sorts by points (and tie-breakers if available)
 * - Pairs players with similar scores
 * - Prevents repeated matchups if possible
 * - Handles odd counts with a Bye
 */
export const generateSwissPairings = (
    participants: Participant[],
    _previousRounds: any[],
    options: SwissOptions = { pairingMode: 'standard' }
): Table[] => {
    const activePlayers = participants.filter(p => p.status === 'active');

    // Sort by points (primary) and Buchholz (secondary)
    const sortedPlayers = [...activePlayers].sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
        return (b.buchholz || 0) - (a.buchholz || 0);
    });

    const tables: Table[] = [];
    const pairedIds = new Set<string>();

    for (let i = 0; i < sortedPlayers.length; i++) {
        const playerA = sortedPlayers[i];
        if (pairedIds.has(playerA.playerId)) continue;

        // Find potential opponents
        let bestOpponentIndex = -1;
        let bestOpponentScoreGap = Infinity;
        let foundNewOpponent = false;

        for (let j = i + 1; j < sortedPlayers.length; j++) {
            const playerB = sortedPlayers[j];
            if (pairedIds.has(playerB.playerId)) continue;

            const hasPlayedBefore = playerA.previousOpponents?.includes(playerB.playerId);
            const scoreGap = Math.abs(playerA.totalPoints - playerB.totalPoints);

            // Logic:
            // 1. If we find someone we HAVEN'T played yet, they are better than someone we have (usually).
            // 2. In 'fair' mode, we might allow a slightly larger score gap to avoid a repeat.
            // 3. In 'standard' mode, we prioritize score gap but still try to avoid repeats.

            const isBetterOpponent =
                (!foundNewOpponent && !hasPlayedBefore) ||
                (foundNewOpponent && !hasPlayedBefore && scoreGap < bestOpponentScoreGap) ||
                (!foundNewOpponent && hasPlayedBefore && scoreGap < bestOpponentScoreGap);

            // Special case for 'fair' mode: if we already found a new opponent, 
            // but this one is also new and has a similar gap, maybe we could randomize?
            // For now, let's keep it simple: find the closest in score that hasn't been played.

            if (isBetterOpponent) {
                bestOpponentIndex = j;
                bestOpponentScoreGap = scoreGap;
                if (!hasPlayedBefore) foundNewOpponent = true;
            }
        }

        if (options.pairingMode === 'fair' && !foundNewOpponent) {
            // In fair mode, we could potentially do more, but avoiding repeats is already the main "fair" thing.
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
