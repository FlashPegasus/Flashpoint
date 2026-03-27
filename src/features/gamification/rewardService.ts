import { doc, updateDoc, increment, getDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { User } from '../../types';
import {
    getUnlockedTier,
    getCombinationById,
    buildGlowStyle,
    MTG_TIERS_V2,
    type MtgCombination,
} from './mtgTiers';
import { getAchievementById } from './achievements';

export { MTG_TIERS_V2 as MTG_TIERS };

export const XP_CONFIG = {
    DAILY_AD_LIMIT: 5,
    BASE_XP_AD: 50,
    BASE_XP_TOURNAMENT: 100,
    BASE_XP_LEAGUE_JOIN: 50,
    BASE_XP_TABLE_WIN: 50,
    MIN_PLAYERS_FOR_XP: 4,
};

export const rewardService = {
    calculateLevel: (xp: number): number => {
        if (xp < 1000) return 1;
        return Math.floor(xp / 1000) + 1;
    },

    /** Returns the highest unlocked tier object for a level */
    getTier: (level: number) => getUnlockedTier(level),

    /**
     * Resolves the active glow style for a user based on their chosen combination.
     * Falls back to the tier's default first combination.
     */
    resolveGlow: (level: number, chosenGuildId?: string): MtgCombination => {
        const tier = getUnlockedTier(level);

        if (chosenGuildId) {
            const combo = getCombinationById(chosenGuildId);
            // Validate the chosen combo belongs to an unlocked tier
            if (combo) {
                const comboTier = MTG_TIERS_V2.find(t =>
                    t.combinations.some(c => c.id === chosenGuildId)
                );
                if (comboTier && level >= comboTier.minLevel) {
                    return combo;
                }
            }
        }

        return tier.combinations[0];
    },

    /**
     * Returns the CSS glow style object based on user's current setup.
     */
    resolveGlowStyle: (level: number, chosenGuildId?: string) => {
        const combo = rewardService.resolveGlow(level, chosenGuildId);
        return buildGlowStyle(combo);
    },

    calculateTournamentXP: (numPlayers: number, rank: number) => {
        if (numPlayers < XP_CONFIG.MIN_PLAYERS_FOR_XP) return 0;

        let xp = XP_CONFIG.BASE_XP_TOURNAMENT;
        const scalingFactor = Math.min(2.0, 1.0 + (Math.floor(numPlayers / 4) * 0.1));
        xp = Math.floor(xp * scalingFactor);

        if (rank === 1) xp += 100;
        else if (rank <= 4) xp += 50;
        else if (rank <= 8) xp += 25;

        return xp;
    },

    addXP: async (userId: string, amount: number, reason: string) => {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) return;

        const userData = userSnap.data() as User;
        const currentXP = userData.stats?.xp || 0;
        const newXP = currentXP + amount;
        const newLevel = rewardService.calculateLevel(newXP);

        await updateDoc(userRef, {
            'stats.xp': increment(amount),
            'stats.level': newLevel,
            lastXPUpdate: {
                amount,
                reason,
                timestamp: new Date().toISOString(),
            },
        });

        return { newXP, newLevel };
    },

    /** Persist the player's chosen guild/combination to Firestore */
    chooseGuild: async (userId: string, combinationId: string, level: number) => {
        const tier = getUnlockedTier(level);
        const comboTier = MTG_TIERS_V2.find(t =>
            t.combinations.some(c => c.id === combinationId)
        );

        if (!comboTier || level < comboTier.minLevel) {
            throw new Error(`Combination "${combinationId}" not unlocked at level ${level}`);
        }

        const combo = getCombinationById(combinationId);
        if (!combo) throw new Error(`Unknown combination: ${combinationId}`);

        const glowValue = combo.glowMode === 'rainbow'
            ? 'rainbow'
            : combo.glowColors[0];

        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            'stats.chosenGuildId': combinationId,
            'stats.activeGlow': glowValue,
        });

        return { combo, tier };
    },

    /** Legacy - kept for backward compat */
    activateGlow: async (userId: string, color: string, durationHours = 24) => {
        const userRef = doc(db, 'users', userId);
        const glowUntil = new Date();
        glowUntil.setHours(glowUntil.getHours() + durationHours);

        await updateDoc(userRef, {
            'stats.activeGlow': color,
            'stats.glowUntil': glowUntil.toISOString(),
        });
    },

    /** Grant an achievement to a user with XP reward */
    unlockAchievement: async (userId: string, achievementId: string): Promise<boolean> => {
        const achievement = getAchievementById(achievementId);
        if (!achievement) return false;

        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) return false;

        const userData = userSnap.data() as User;
        const stats = userData.stats || {};
        const achievements = stats.achievements || [];

        if (achievements.some(a => a.id === achievementId)) return false;

        // Grant XP first (this also updates level if needed)
        await rewardService.addXP(userId, achievement.xpReward, `ACHIEVEMENT_UNLOCKED_${achievementId}`);

        // Add to achievements list
        await updateDoc(userRef, {
            'stats.achievements': arrayUnion({
                id: achievementId,
                unlockedAt: new Date().toISOString()
            })
        });

        return true;
    },

    /** Dev tool: Manually set user XP/Level */
    setDevLevel: async (userId: string, targetLevel: number) => {
        const newXP = (targetLevel - 1) * 1000;
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            'stats.xp': newXP,
            'stats.level': targetLevel,
            'stats.chosenGuildId': null,
            'stats.activeGlow': null,
            'lastXPUpdate': {
                amount: 0,
                reason: 'DEV_OVERRIDE',
                timestamp: new Date().toISOString()
            }
        });
        return { newXP, targetLevel };
    }
};
