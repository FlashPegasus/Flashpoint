import React from 'react';
import * as Icons from '../../assets/icons';
import { 
    Trophy, 
    Users, 
    Calendar, 
    Settings, 
    Search, 
    Swords,
    Gamepad2,
    Dice5
} from 'lucide-react';

interface DynamicIconProps {
    icon: string;
    size?: number;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * DynamicIcon Component
 * Handles three types of icons:
 * 1. Keywords (mapped to custom assets or Lucide)
 * 2. Emojis (rendered as text)
 * 3. External URLs (rendered as img)
 */
export const DynamicIcon: React.FC<DynamicIconProps> = ({ 
    icon, 
    size = 24, 
    className = '', 
    style 
}) => {
    // 1. External URL
    if (icon.startsWith('http')) {
        return (
            <img 
                src={icon} 
                alt="icon" 
                style={{ width: size, height: size, ...style }} 
                className={`object-contain ${className}`} 
            />
        );
    }

    // 2. Keyword Mapping
    const keywordMap: Record<string, React.FC<any>> = {
        // Custom FlashPoint Icons
        'tournament': Icons.IconStartTournament,
        'results': Icons.IconSubmitResults,
        'pairing': Icons.IconPairingTable,
        'members': Icons.IconLeagueMembers,
        'leaderboard': Icons.IconLeagueLeader,
        'season': Icons.IconSeasonDivider,
        'share': Icons.IconShareInvite,
        'plus': Icons.IconCreatePlus,
        
        // Lucide Fallbacks/Mapping
        'trophy': Trophy,
        'users': Users,
        'calendar': Calendar,
        'settings': Settings,
        'search': Search,
        'swords': Swords,
        'commander': Icons.IconLeagueLeader, // Mapping commander keyword to leader icon
        'modern': Swords,
        'casual': Dice5,
        'gamepad': Gamepad2
    };

    const MappedIcon = keywordMap[icon.toLowerCase()];

    if (MappedIcon) {
        return <MappedIcon size={size} className={className} style={style} />;
    }

    // 3. Emoji or Text Fallback
    return (
        <span 
            style={{ 
                fontSize: size * 0.8, 
                width: size, 
                height: size, 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                ...style 
            }} 
            className={className}
        >
            {icon}
        </span>
    );
};
