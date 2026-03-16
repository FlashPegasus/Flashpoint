export type UserRole = 'organizer' | 'player' | 'admin';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
    bio?: string;
    isAnonymous?: boolean;
    isPublic?: boolean;
    rank?: number;
    stats: {
        tournamentsPlayed: number;
        wins: number;
        draws: number;
        losses: number;
        leaguesJoined: number;
        accumulatedPoints: number;
    };
}

export type TournamentFormat = '1v1' | 'multiplayer' | 'battle_royale';
export type TournamentStatus = 'draft' | 'registration' | 'ongoing' | 'completed' | 'cancelled';

export type ResultStatus = 'WINNER' | 'SURVIVED' | 'ELIMINATED' | 'ALL_DEFEATED' | 'BYE' | 'PENDING';

export interface ScoringPosition {
    position: number;
    points: number;
}

export interface ScoringConfig {
    type: 'standard' | 'positional' | 'custom';
    pointsPerWin?: number;
    pointsPerDraw?: number;
    pointsPerLoss?: number;
    positions?: Record<number, Record<number, number>>; // tableSize -> (position -> points)
}

export interface Participant {
    playerId: string;
    name: string;
    avatar?: string;
    status: 'active' | 'withdrawn' | 'late';
    isAnonymous?: boolean;
    checkedIn?: boolean;
    joinedRound: number;
    deckName?: string;
    commanderName?: string;
    commanderImageUrl?: string;
    decklistUrl?: string;
    totalPoints: number;
    rank?: number;
    // Tie-breakers
    wins?: number;
    omw?: number;
    buchholz?: number;
    owp?: number; // Keep existing or use omw interchangeably? OMW% usually refers to OWP
    previousOpponents?: string[]; // Array of playerIds
}

export interface TableResult {
    playerId: string;
    status: ResultStatus;
    points: number;
    position?: number; // Keep for backward compatibility if needed, but primary is status
}

export interface Table {
    id: string;
    playerIds: string[];
    results: TableResult[];
    status: 'pending' | 'completed';
}

export interface Round {
    number: number;
    tables: Table[];
    status: 'pending' | 'completed';
}

export interface Tournament {
    id: string;
    name: string;
    date: string;
    location: string;
    description: string;
    format: TournamentFormat;
    pairingMode: 'standard' | 'fair';
    status: TournamentStatus;
    organizerId: string;

    // Configuration
    minPlayersPerTable: number;
    maxPlayersPerTable: number;
    exactTableSize?: number;
    hasTimer?: boolean;
    defaultRoundTimer?: number;
    allowByes?: boolean;
    scoring: ScoringConfig;

    // Policies
    allowLateRegistration: boolean;
    allowWithdrawal: boolean;
    requiresCheckIn?: boolean;
    maxParticipants?: number;
    isPrivate?: boolean;
    bannerUrl?: string;
    currentRoundEndTime?: string;
    currentRound?: number;
    currentRoundData?: Round;
    participants: Participant[];
    rounds: Round[];
    leagueId?: string;
    
    // Handoff specific configs
    avoidRepeatedMatchups?: boolean;
    epicFinalEnabled?: boolean;
    epicFinalMaxPlayers?: number;
    maxRounds?: number;
    pointsLimit?: number;
}

export type LeagueScoringType = 'sum' | 'best_x_of_y' | 'weighted';
export type LeagueVisibility = 'public' | 'private';

export interface LeagueStanding {
    playerId: string;
    playerName: string;
    totalPoints: number;
    tournamentsPlayed: number;
    rank: number;
    currentStreak?: number;
}

export interface LeagueMember {
    playerId: string;
    playerName: string;
    joinedAt: string;
    status: 'active' | 'pending' | 'rejected' | 'banned';
    nickname?: string;
}

export interface TournamentTemplate {
    id: string;
    organizerId: string;
    name: string;
    format: TournamentFormat;
    pairingMode: 'standard' | 'fair';
    minPlayersPerTable: number;
    maxPlayersPerTable: number;
    exactTableSize?: number;
    hasTimer: boolean;
    defaultRoundTimer?: number;
    allowByes: boolean;
    scoring: ScoringConfig;
    allowLateRegistration: boolean;
    requiresCheckIn: boolean;
    avoidRepeatedMatchups?: boolean;
    epicFinalEnabled?: boolean;
    epicFinalMaxPlayers?: number;
    maxRounds?: number;
    pointsLimit?: number;
    createdAt: string;
}

export interface LeagueOrganizer {
    userId: string;
    role: 'master' | 'admin' | 'moderator';
    addedBy: string;
    addedAt: string;
}

export interface LeagueSeason {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    standings: LeagueStanding[];
    finalizedAt: string;
}

export interface League {
    id: string;
    name: string;
    nameLowercase?: string;
    primaryColor?: string;
    description: string;
    organizerId: string;
    startDate: string;
    endDate: string;
    status: 'active' | 'completed';
    visibility: LeagueVisibility;
    inviteCode: string;
    bannerUrl?: string;

    // Scoring config
    scoringType: LeagueScoringType;
    scoringParams?: {
        bestX?: number;
        weights?: Record<string, number>;
    };
    pointsParticipation?: number;
    pointsWin?: number;
    pointsTop4?: number;
    pointsTop8?: number;
    streakBonus?: number;
    bestXof?: number;

    tournamentIds: string[];
    memberIds: string[];
    standings: LeagueStanding[];
    cachedTopRanking?: LeagueStanding[]; // Top 10 for fast homepage reads
    organizers?: LeagueOrganizer[];
    createdAt?: string;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationActionType = 'link' | 'none';

export interface AppNotification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    actionType?: NotificationActionType;
    actionData?: string; // e.g. URL to redirect
    isRead: boolean;
    createdAt: string;
}
