import { Trophy, Swords, Medal, Megaphone, Tv } from 'lucide-react';
import React from 'react';

export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'mythic';

export interface Achievement {
    id: string;
    name: string;
    description: string;
    rarity: AchievementRarity;
    xpReward: number;
    icon: React.ElementType;
    color: string;
}

export const RARITY_COLORS: Record<AchievementRarity, string> = {
    common: '#94a3b8',   // Slate
    uncommon: '#10b981', // Emerald
    rare: '#f59e0b',     // Gold
    mythic: '#ef4444',   // Red/Mythic
};

export const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'tournament-win-12',
        name: 'Campeão de Ferro',
        description: 'Vença um torneio com pelo menos 12 jogadores.',
        rarity: 'rare',
        xpReward: 500,
        icon: Trophy,
        color: RARITY_COLORS.rare
    },
    {
        id: 'league-win-12',
        name: 'Soberano da Liga',
        description: 'Fique em 1º lugar em uma liga com pelo menos 12 jogadores.',
        rarity: 'mythic',
        xpReward: 1000,
        icon: Medal,
        color: RARITY_COLORS.mythic
    },
    {
        id: 'tournament-creator',
        name: 'Organizador Nato',
        description: 'Crie seu primeiro torneio.',
        rarity: 'uncommon',
        xpReward: 250,
        icon: Swords,
        color: RARITY_COLORS.uncommon
    },
    {
        id: 'ad-master',
        name: 'Mestre das Propagandas',
        description: 'Mantenha um streak de visualização de anúncios.',
        rarity: 'common',
        xpReward: 100,
        icon: Tv,
        color: RARITY_COLORS.common
    },
    {
        id: 'guild-initiation',
        name: 'Iniciação de Guilda',
        description: 'Escolha sua primeira identidade de cor (Tier 2).',
        rarity: 'common',
        xpReward: 150,
        icon: Megaphone,
        color: RARITY_COLORS.common
    }
];

export function getAchievementById(id: string) {
    return ACHIEVEMENTS.find(a => a.id === id);
}
