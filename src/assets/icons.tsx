import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
    size?: number;
}

/**
 * FlashPoint Gamified Icon Library (Phase 29)
 * All icons are SVG-in-JS to ensure zero Firebase Storage cost and instant loading.
 * Style: Neo-Modern TCG, Minimalist, stroke-based.
 */

export const IconStartTournament: React.FC<IconProps> = ({ size = 24, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="5" y1="19" x2="12" y2="5" />
        <line x1="19" y1="19" x2="12" y2="5" />
        <line x1="5" y1="19" x2="19" y2="19" />
        <line x1="7" y1="16" x2="10" y2="13" />
        <line x1="17" y1="16" x2="14" y2="13" />
        <circle cx="12" cy="4.5" r="1" fill="currentColor" stroke="none" />
    </svg>
);

export const IconSubmitResults: React.FC<IconProps> = ({ size = 24, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="5" y="4" width="14" height="16" rx="2" />
        <path d="M5 6 Q5 4 7 4 Q5 4 5 6" />
        <path d="M19 6 Q19 4 17 4 Q19 4 19 6" />
        <line x1="8" y1="9" x2="16" y2="9" />
        <line x1="8" y1="12" x2="16" y2="12" />
        <line x1="8" y1="15" x2="13" y2="15" />
        <line x1="14" y1="14" x2="19" y2="19" />
        <path d="M19 19 L17 17 L16 20 Z" fill="currentColor" stroke="none" />
    </svg>
);

export const IconPairingTable: React.FC<IconProps> = ({ size = 24, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M4 5 H10 V12 Q10 16 7 17 Q4 16 4 12 Z" />
        <path d="M20 5 H14 V12 Q14 16 17 17 Q20 16 20 12 Z" />
        <line x1="10" y1="11" x2="14" y2="11" />
        <polygon points="12,9 11,11 12,10 13,11" fill="currentColor" stroke="none" />
    </svg>
);

export const IconPlayerSearch: React.FC<IconProps> = ({ size = 24, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="10" cy="10" r="6" />
        <line x1="14.5" y1="14.5" x2="20" y2="20" />
        <circle cx="10" cy="10" r="1" fill="currentColor" stroke="none" />
        <circle cx="10" cy="7.5" r="0.6" fill="currentColor" stroke="none" />
        <circle cx="12.2" cy="8.8" r="0.6" fill="currentColor" stroke="none" />
        <circle cx="11.4" cy="11.4" r="0.6" fill="currentColor" stroke="none" />
        <circle cx="8.6" cy="11.4" r="0.6" fill="currentColor" stroke="none" />
        <circle cx="7.8" cy="8.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
);

export const IconLeagueLeader: React.FC<IconProps> = ({ size = 24, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M4 17 H20 L20 14 L16 10 L12 6 L8 10 L4 14 Z" />
        <line x1="4" y1="17" x2="20" y2="17" />
        <circle cx="12" cy="6" r="1" fill="currentColor" stroke="none" />
        <circle cx="8" cy="10" r="0.8" fill="currentColor" stroke="none" />
        <circle cx="16" cy="10" r="0.8" fill="currentColor" stroke="none" />
    </svg>
);

export const IconSeasonDivider: React.FC<IconProps> = ({ size = 24, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M7 3 H17 L12 11 L17 21 H7 L12 13 Z" />
        <line x1="7" y1="3" x2="17" y2="3" />
        <line x1="7" y1="21" x2="17" y2="21" />
        <line x1="12" y1="11" x2="12" y2="13" />
        <line x1="10.5" y1="12" x2="13.5" y2="12" />
        <circle cx="10" cy="6" r="0.5" fill="currentColor" stroke="none" />
        <circle cx="12" cy="5" r="0.5" fill="currentColor" stroke="none" />
        <circle cx="14" cy="6" r="0.5" fill="currentColor" stroke="none" />
    </svg>
);

export const IconLeagueMembers: React.FC<IconProps> = ({ size = 24, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="8" r="2.5" />
        <path d="M7 20 Q7 14 12 14 Q17 14 17 20" />
        <path d="M9.5 6.5 Q12 4 14.5 6.5" />
        <circle cx="6" cy="9.5" r="1.8" />
        <path d="M2 20 Q2 15.5 6 15.5 Q8 15.5 9 17" />
        <circle cx="18" cy="9.5" r="1.8" />
        <path d="M22 20 Q22 15.5 18 15.5 Q16 15.5 15 17" />
    </svg>
);

export const IconShareInvite: React.FC<IconProps> = ({ size = 24, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M9 12 Q9 8 6 8 Q3 8 3 11 Q3 14 6 14 L9 14" />
        <path d="M15 12 Q15 8 18 8 Q21 8 21 11 Q21 14 18 14 L15 14" />
        <line x1="9" y1="12" x2="15" y2="12" />
        <line x1="20" y1="7" x2="22" y2="5" />
        <line x1="21" y1="8" x2="23" y2="8" />
        <line x1="20" y1="9" x2="22" y2="11" />
        <circle cx="20" cy="8" r="1" fill="currentColor" stroke="none" />
    </svg>
);

export const IconCreatePlus: React.FC<IconProps> = ({ size = 24, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
);
