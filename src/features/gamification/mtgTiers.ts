// MTG Color Identity System — Tier Progression
// Tier 1: Colorless | Tier 2: Mono | Tier 3: Dual (Guilds) | Tier 4: Tri (Arcs/Wedges) | Tier 5: 4-Color | Tier 6: 5-Color (Planeswalker)

export type TierName = 'colorless' | 'mono' | 'dual' | 'tri' | 'four' | 'five';

export interface MtgColor {
    id: string;     // e.g. 'W', 'U', 'B', 'R', 'G'
    name: string;   // e.g. 'White'
    hex: string;    // Primary glow hex
}

export interface MtgCombination {
    id: string;         // e.g. 'azorius'
    name: string;       // e.g. 'Azorius Senate'
    colors: string[];   // e.g. ['W', 'U']
    glowColors: string[];  // hex values for glow
    glowMode: 'solid' | 'gradient' | 'rainbow';
    symbol?: string;    // emoji or icon hint
    subType?: 'guild-allied' | 'guild-enemy' | 'arc' | 'wedge' | 'four-color' | 'five-color';
}

export interface MtgTier {
    id: TierName;
    tier: number;          // 1-6
    label: string;         // display name
    minLevel: number;
    description: string;
    combinations: MtgCombination[];
}

// ─── BASE COLORS ─────────────────────────────────────────────────────────────

export const MTG_COLORS: Record<string, MtgColor> = {
    W: { id: 'W', name: 'White', hex: '#f9f3e3' },
    U: { id: 'U', name: 'Blue',  hex: '#0e68ab' },
    B: { id: 'B', name: 'Black', hex: '#0a0a0c' }, // Ultra-dark ink black
    R: { id: 'R', name: 'Red',   hex: '#d3202a' },
    G: { id: 'G', name: 'Green', hex: '#00733e' },
};

// ─── TIER 1: COLORLESS ───────────────────────────────────────────────────────

const TIER_COLORLESS: MtgTier = {
    id: 'colorless',
    tier: 1,
    label: 'Incolor',
    minLevel: 1,
    description: 'O início de toda jornada. Sem identidade de cor ainda.',
    combinations: [
        {
            id: 'colorless',
            name: 'Sem Cor',
            colors: [],
            glowColors: ['#2a2a2e'], // Slate dark grey, distinct from pitch black
            glowMode: 'solid',
            subType: undefined,
        },
    ],
};

// ─── TIER 2: MONO-COLOR ──────────────────────────────────────────────────────

const TIER_MONO: MtgTier = {
    id: 'mono',
    tier: 2,
    label: 'Monocolor',
    minLevel: 11,
    description: 'Escolha sua cor. Uma identidade, um propósito.',
    combinations: [
        { id: 'white',  name: 'Branco (Ordem)',      colors: ['W'], glowColors: ['#f9f3e3'], glowMode: 'solid', symbol: '☀️' },
        { id: 'blue',   name: 'Azul (Conhecimento)', colors: ['U'], glowColors: ['#0e68ab'], glowMode: 'solid', symbol: '💧' },
        { id: 'black',  name: 'Preto (Poder)',        colors: ['B'], glowColors: ['#3e2b5c'], glowMode: 'solid', symbol: '💀' }, // Deep Purple-Black for glow visibility
        { id: 'red',    name: 'Vermelho (Caos)',       colors: ['R'], glowColors: ['#d3202a'], glowMode: 'solid', symbol: '🔥' },
        { id: 'green',  name: 'Verde (Crescimento)',  colors: ['G'], glowColors: ['#00733e'], glowMode: 'solid', symbol: '🌲' },
    ],
};

// ─── TIER 3: DUAL (GUILDS) ───────────────────────────────────────────────────
// Ravnica Allied (WU, UB, BR, RG, GW) + Enemy (WB, UR, BG, RW, GU)

const TIER_DUAL: MtgTier = {
    id: 'dual',
    tier: 3,
    label: 'Guilds',
    minLevel: 31,
    description: 'Duas cores, uma aliança. Escolha sua guilda.',
    combinations: [
        // Allied Guilds
        { id: 'azorius',   name: 'Senado Azorius',      colors: ['W', 'U'], glowColors: ['#f9f3e3', '#0e68ab'], glowMode: 'gradient', symbol: '⚖️',  subType: 'guild-allied' },
        { id: 'dimir',     name: 'Casa Dimir',           colors: ['U', 'B'], glowColors: ['#0e68ab', '#3e2b5c'], glowMode: 'gradient', symbol: '🕵️', subType: 'guild-allied' },
        { id: 'rakdos',    name: 'Culto de Rakdos',      colors: ['B', 'R'], glowColors: ['#3e2b5c', '#d3202a'], glowMode: 'gradient', symbol: '🎭', subType: 'guild-allied' },
        { id: 'gruul',     name: 'Clãs Gruul',           colors: ['R', 'G'], glowColors: ['#d3202a', '#00733e'], glowMode: 'gradient', symbol: '🐗',  subType: 'guild-allied' },
        { id: 'selesnya',  name: 'Conclave Selesnya',    colors: ['G', 'W'], glowColors: ['#00733e', '#f9f3e3'], glowMode: 'gradient', symbol: '🌿',  subType: 'guild-allied' },
        // Enemy Guilds
        { id: 'orzhov',    name: 'Sindicato Orzhov',     colors: ['W', 'B'], glowColors: ['#f9f3e3', '#3e2b5c'], glowMode: 'gradient', symbol: '⛪', subType: 'guild-enemy' },
        { id: 'izzet',     name: 'Liga Izzet',            colors: ['U', 'R'], glowColors: ['#0e68ab', '#d3202a'], glowMode: 'gradient', symbol: '⚡', subType: 'guild-enemy' },
        { id: 'golgari',   name: 'Enxame Golgari',       colors: ['B', 'G'], glowColors: ['#3e2b5c', '#00733e'], glowMode: 'gradient', symbol: '🦂', subType: 'guild-enemy' },
        { id: 'boros',     name: 'Legião Boros',          colors: ['R', 'W'], glowColors: ['#d3202a', '#f9f3e3'], glowMode: 'gradient', symbol: '⚔️', subType: 'guild-enemy' },
        { id: 'simic',     name: 'Combine Simic',         colors: ['G', 'U'], glowColors: ['#00733e', '#0e68ab'], glowMode: 'gradient', symbol: '🧬', subType: 'guild-enemy' },
    ],
};

// ─── TIER 4: TRI-COLOR (ARCS + WEDGES) ──────────────────────────────────────
// Alara Shards (Arcs) + Khans Wedges + New Capenna Families

const TIER_TRI: MtgTier = {
    id: 'tri',
    tier: 4,
    label: 'Tri-Color',
    minLevel: 51,
    description: 'Três cores define um arco ou cunha. Sua identidade se aprofunda.',
    combinations: [
        // Alara Shards (Arcs)
        { id: 'bant',    name: 'Bant',    colors: ['G', 'W', 'U'], glowColors: ['#00733e', '#f9f3e3', '#0e68ab'], glowMode: 'gradient', symbol: '🏰', subType: 'arc' },
        { id: 'esper',   name: 'Esper',   colors: ['W', 'U', 'B'], glowColors: ['#f9f3e3', '#0e68ab', '#3e2b5c'], glowMode: 'gradient', symbol: '🤖', subType: 'arc' },
        { id: 'grixis',  name: 'Grixis',  colors: ['U', 'B', 'R'], glowColors: ['#0e68ab', '#3e2b5c', '#d3202a'], glowMode: 'gradient', symbol: '💀', subType: 'arc' },
        { id: 'jund',    name: 'Jund',    colors: ['B', 'R', 'G'], glowColors: ['#3e2b5c', '#d3202a', '#00733e'], glowMode: 'gradient', symbol: '🐉', subType: 'arc' },
        { id: 'naya',    name: 'Naya',    colors: ['R', 'G', 'W'], glowColors: ['#d3202a', '#00733e', '#f9f3e3'], glowMode: 'gradient', symbol: '🦁', subType: 'arc' },
        // Khans Wedges
        { id: 'abzan',   name: 'Clã Abzan',         colors: ['W', 'B', 'G'], glowColors: ['#f9f3e3', '#3e2b5c', '#00733e'], glowMode: 'gradient', symbol: '🏔️', subType: 'wedge' },
        { id: 'jeskai',  name: 'Caminho Jeskai',     colors: ['U', 'R', 'W'], glowColors: ['#0e68ab', '#d3202a', '#f9f3e3'], glowMode: 'gradient', symbol: '🥋', subType: 'wedge' },
        { id: 'sultai',  name: 'Ninhada Sultai',     colors: ['B', 'G', 'U'], glowColors: ['#3e2b5c', '#00733e', '#0e68ab'], glowMode: 'gradient', symbol: '🐍', subType: 'wedge' },
        { id: 'mardu',   name: 'Horda Mardu',         colors: ['R', 'W', 'B'], glowColors: ['#d3202a', '#f9f3e3', '#3e2b5c'], glowMode: 'gradient', symbol: '⚔️', subType: 'wedge' },
        { id: 'temur',   name: 'Fronteira Temur',    colors: ['G', 'U', 'R'], glowColors: ['#00733e', '#0e68ab', '#d3202a'], glowMode: 'gradient', symbol: '🐻', subType: 'wedge' },
    ],
};

// ─── TIER 5: 4-COLOR ─────────────────────────────────────────────────────────
// Nephilim / New Capenna Families

const TIER_FOUR: MtgTier = {
    id: 'four',
    tier: 5,
    label: '4 Cores',
    minLevel: 71,
    description: 'Quatro cores. Identidades poderosas e raras.',
    combinations: [
        { id: 'artifice',   name: 'Artifice (WUBR)',  colors: ['W','U','B','R'], glowColors: ['#f9f3e3','#0e68ab','#3e2b5c','#d3202a'], glowMode: 'gradient', symbol: '⚙️', subType: 'four-color' },
        { id: 'chaos',      name: 'Chaos (UBRG)',     colors: ['U','B','R','G'], glowColors: ['#0e68ab','#3e2b5c','#d3202a','#00733e'], glowMode: 'gradient', symbol: '🌀', subType: 'four-color' },
        { id: 'aggression', name: 'Aggression (BRGW)',colors: ['B','R','G','W'], glowColors: ['#3e2b5c','#d3202a','#00733e','#f9f3e3'], glowMode: 'gradient', symbol: '💢', subType: 'four-color' },
        { id: 'altruism',   name: 'Altruism (RGWU)', colors: ['R','G','W','U'], glowColors: ['#d3202a','#00733e','#f9f3e3','#0e68ab'], glowMode: 'gradient', symbol: '🌟', subType: 'four-color' },
        { id: 'growth',     name: 'Growth (GWUB)',    colors: ['G','W','U','B'], glowColors: ['#00733e','#f9f3e3','#0e68ab','#3e2b5c'], glowMode: 'gradient', symbol: '🌱', subType: 'four-color' },
    ],
};

// ─── TIER 6: 5-COLOR (PLANESWALKER) ─────────────────────────────────────────

const TIER_FIVE: MtgTier = {
    id: 'five',
    tier: 6,
    label: 'Planeswalker',
    minLevel: 91,
    description: 'Todas as cores. O pico da maestria.',
    combinations: [
        {
            id: 'planeswalker',
            name: 'Planeswalker',
            colors: ['W', 'U', 'B', 'R', 'G'],
            glowColors: ['#f9f3e3', '#0e68ab', '#a0a0b0', '#d3202a', '#00733e'],
            glowMode: 'rainbow',
            symbol: '✨',
            subType: 'five-color',
        },
    ],
};

// ─── ORDERED TIER LIST ────────────────────────────────────────────────────────

export const MTG_TIERS_V2: MtgTier[] = [
    TIER_COLORLESS,
    TIER_MONO,
    TIER_DUAL,
    TIER_TRI,
    TIER_FOUR,
    TIER_FIVE,
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/** Return the highest unlocked tier for a given level */
export function getUnlockedTier(level: number): MtgTier {
    return [...MTG_TIERS_V2].reverse().find(t => level >= t.minLevel) ?? TIER_COLORLESS;
}

/** Return ALL tiers the player has unlocked (minLevel <= level) */
export function getAllUnlockedTiers(level: number): MtgTier[] {
    return MTG_TIERS_V2.filter(t => level >= t.minLevel);
}

/** Resolve a combination by ID from any tier */
export function getCombinationById(id: string): MtgCombination | undefined {
    for (const tier of MTG_TIERS_V2) {
        const found = tier.combinations.find(c => c.id === id);
        if (found) return found;
    }
    return undefined;
}

export function buildConicGradient(colors: string[]): string {
    if (colors.length === 0) return '#6b7280';
    if (colors.length === 1) return colors[0];
    // Conic gradient needs to repeat the first color at the end for a smooth transition
    return `conic-gradient(${[...colors, colors[0]].join(', ')})`;
}

export function buildGlowStyle(combo: MtgCombination): { boxShadow: string; border: string; background?: string } {
    if (combo.glowMode === 'rainbow') {
        return {
            boxShadow: '0 0 35px rgba(255,255,255,0.4), 0 0 15px rgba(255,255,255,0.2)',
            border: '2px solid rgba(255,255,255,0.8)',
            background: 'linear-gradient(45deg, #f9f3e3, #0e68ab, #3e2b5c, #d3202a, #00733e, #f9f3e3)',
        };
    }

    const colors = combo.glowColors.length > 0 ? combo.glowColors : ['#6b7280'];
    
    if (colors.length > 1) {
        return {
            boxShadow: '0 0 15px rgba(255,255,255,0.1)',
            border: `2px solid ${colors[0]}80`,
            background: buildConicGradient(colors),
        };
    }

    // solid
    const color = colors[0];
    return {
        boxShadow: `0 0 14px ${color}, 0 0 5px ${color}`,
        border: `2px solid ${color}`,
        background: color,
    };
}

/** Build CSS gradient string for a combination's badge/label */
export function buildGradientText(combo: MtgCombination): string {
    if (combo.glowColors.length === 1) return combo.glowColors[0];
    return `linear-gradient(135deg, ${combo.glowColors.join(', ')})`;
}

/** Backward-compat: convert old activeGlow string to a combination id */
export function glowStringToCombinationId(glow: string | undefined): string {
    if (!glow) return 'colorless';
    if (glow === 'rainbow') return 'planeswalker';
    // Search by hex match
    for (const tier of MTG_TIERS_V2) {
        for (const combo of tier.combinations) {
            if (combo.glowColors[0] === glow) return combo.id;
        }
    }
    return 'colorless';
}
