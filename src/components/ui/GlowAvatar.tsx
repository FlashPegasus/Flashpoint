import React from 'react';
import { getCombinationById, buildGlowStyle } from '../../features/gamification/mtgTiers';
import { rewardService } from '../../features/gamification/rewardService';

interface GlowAvatarProps {
    seed: string;
    size?: number;
    /** Hex color string, 'rainbow', or MTG combination id (e.g. 'azorius') */
    glowColor?: string;
    level?: number;
    /** If provided, resolves glow from this combination id directly */
    chosenGuildId?: string;
    className?: string;
}

const dicebear = (seed: string, size = 32) =>
    `https://api.dicebear.com/7.x/rings/svg?seed=${encodeURIComponent(seed)}&size=${size}`;

export const GlowAvatar: React.FC<GlowAvatarProps> = ({
    seed,
    size = 32,
    glowColor,
    level,
    chosenGuildId,
    className = '',
}) => {
    // Priority: chosenGuildId > glowColor > level-based rainbow check
    let glowStyle: React.CSSProperties = {};
    let glowClass = '';

    if (chosenGuildId) {
        const combo = getCombinationById(chosenGuildId);
        if (combo) {
            const style = buildGlowStyle(combo);
            glowStyle = style;
            glowClass = combo.glowMode === 'rainbow' ? 'animate-glow-rainbow' : 'animate-pulse';
        }
    } else if (level != null) {
        const style = rewardService.resolveGlowStyle(level);
        glowStyle = style;
        glowClass = (style.background?.includes('gradient') || level >= 91) ? 'animate-glow-rainbow' : 'animate-pulse';
    } else if (glowColor) {
        const isRainbow = glowColor === 'rainbow';
        if (isRainbow) {
            glowClass = 'animate-glow-rainbow';
            glowStyle = { background: 'linear-gradient(45deg, #f9f3e3, #0e68ab, #d3202a, #00733e, #f9f3e3)' };
        } else {
            glowStyle = {
                boxShadow: `0 0 15px ${glowColor}, 0 0 5px ${glowColor}`,
                border: `2px solid ${glowColor}`,
                background: glowColor,
            };
            glowClass = 'animate-pulse';
        }
    }

    const isMultiColor = typeof glowStyle.background === 'string' && glowStyle.background.includes('gradient') && !glowStyle.background.includes('linear');
    const isTier6 = level != null ? level >= 91 : (chosenGuildId === 'planeswalker' || glowColor === 'rainbow');

    return (
        <div className={`relative flex-shrink-0 rounded-full ${className}`} style={{ width: size, height: size }}>
            {/* Glow Layer — ensuring rounded-full is applied correctly to the background */}
            <div 
                className={`absolute inset-0 rounded-full blur-xl opacity-50 ${glowClass} ${isMultiColor ? 'animate-rotate-slow' : ''} ${isTier6 ? 'animate-glow-intense' : ''}`}
                style={{
                    background: glowStyle.background,
                    boxShadow: glowStyle.boxShadow,
                }}
            />
            
            <div
                className="relative w-full h-full rounded-full overflow-hidden border-2 transition-all bg-[#0d090a]"
                style={{
                    borderColor: typeof glowStyle.border === 'string' ? glowStyle.border.split(' ')[2] : 'rgba(255,255,255,0.1)',
                }}
            >
                <img src={dicebear(seed, size)} alt="" className="w-full h-full object-cover" />
                
                {/* Foil Overlay for Tier 6 */}
                {isTier6 && (
                    <div className="absolute inset-0 pointer-events-none animate-foil-shine mix-blend-overlay" />
                )}
            </div>
        </div>
    );
};
