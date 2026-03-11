export interface ScoringPreset {
    id: string;
    name: string;
    icon: string;
    description: string;
    leaguePoints: {
        participation: number;
        win: number;
        top4: number;
        top8: number;
    };
    tournamentScoring: {
        positions: {
            4: Record<number, number>;
            3: Record<number, number>;
        }
    };
}

export const TCG_PRESETS: ScoringPreset[] = [
    {
        id: 'commander',
        name: 'Commander (Multiplayer)',
        icon: 'commander',
        description: 'Focado em mesas de 4 jogadores com pontuação decrescente.',
        leaguePoints: {
            participation: 2,
            win: 5,
            top4: 3,
            top8: 1
        },
        tournamentScoring: {
            positions: {
                4: { 1: 4, 2: 2, 3: 1, 4: 0 },
                3: { 1: 3, 2: 1, 3: 0 }
            }
        }
    },
    {
        id: 'modern',
        name: 'Modern / Standard (1v1)',
        icon: 'modern',
        description: 'Formato competitivo clássico 1-contra-1.',
        leaguePoints: {
            participation: 1,
            win: 3,
            top4: 1,
            top8: 0
        },
        tournamentScoring: {
            positions: {
                4: { 1: 3, 2: 0, 3: 0, 4: 0 },
                3: { 1: 3, 2: 0, 3: 0 }
            }
        }
    },
    {
        id: 'casual',
        name: 'Casual / For Fun',
        icon: 'casual',
        description: 'Pontuação equilibrada para priorizar a participação.',
        leaguePoints: {
            participation: 5,
            win: 3,
            top4: 2,
            top8: 1
        },
        tournamentScoring: {
            positions: {
                4: { 1: 3, 2: 2, 3: 1, 4: 0 },
                3: { 1: 2, 2: 1, 3: 0 }
            }
        }
    }
];
