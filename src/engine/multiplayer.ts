import type { Participant, Table } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface MultiplayerConfig {
    minPerTable: number;
    maxPerTable: number;
    exactSize?: number;
}

/**
 * Multiplayer table assignment engine
 * Highly flexible for Commander (3-5 players) and other formats.
 */
export const generateMultiplayerTables = (
    participants: Participant[],
    config: MultiplayerConfig
): Table[] => {
    const activePlayers = participants.filter(p => p.status === 'active');
    const sortedPlayers = [...activePlayers].sort((a, b) => b.totalPoints - a.totalPoints);

    const tables: Table[] = [];
    const playerCount = sortedPlayers.length;

    if (playerCount === 0) return [];

    // Logic for grouping
    const targetSize = config.exactSize || config.maxPerTable || 4;
    const minSize = config.minPerTable || 3;

    let remainingPlayers = [...sortedPlayers];

    while (remainingPlayers.length >= minSize) {
        // Determine how many to take for this table
        // If remaining is exactly targetSize + (something < minSize), we need to split
        // Example: 6 players, min 4, max 4. We can't do 4 then 2. 
        // This is a simplified version: take targetSize unless it leaves too few.

        let takeCount = targetSize;

        // Check if taking targetSize leaves a remainder that is too small for a valid table
        const remainder = remainingPlayers.length - targetSize;
        if (remainder > 0 && remainder < minSize) {
            // Try to balance. Example: 6 players, min 3. Instead of 4 + 2, do 3 + 3.
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

    // Handle leftovers (group bye)
    if (remainingPlayers.length > 0) {
        // According to user: if fewer players than necessary for a table, they get a Bye.
        // We create a table for them. The service/UI will handle scoring it as a victory.
        tables.push({
            id: uuidv4(),
            playerIds: remainingPlayers.map(p => p.playerId),
            results: [],
            status: 'pending'
        });
    }

    // Optimization: if we have a table with 1 player and another with targetSize, 
    // and targetSize > minSize, we could potentially balance them to avoided a 1-player bye
    // but the user specifically asked for "Byes when fewer than necessary".

    return tables;
};
