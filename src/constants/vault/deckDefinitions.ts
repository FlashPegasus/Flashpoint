import type { DeckSlotDefinition, DeckCategory, DeckSlotData, PowerBracket } from '../../types/vault';

export const MANA_PIPES = ['W', 'U', 'B', 'R', 'G'] as const;

export const MANA_CONFIG = {
  W: {
    name: 'Branco',
    bg: '#f0ead8',
    text: '#2a2418',
    border: '#c9a227',
    symbol: '☀',
    glow: 'rgba(201, 162, 39, 0.45)',
  },
  U: {
    name: 'Azul',
    bg: '#0e68ab',
    text: '#ffffff',
    border: '#3d9fd4',
    symbol: '💧',
    glow: 'rgba(14, 104, 171, 0.55)',
  },
  B: {
    name: 'Preto',
    bg: '#1a1410',
    text: '#e8e0d8',
    border: '#4a4038',
    symbol: '💀',
    glow: 'rgba(90, 80, 70, 0.4)',
  },
  R: {
    name: 'Vermelho',
    bg: '#d3202a',
    text: '#ffffff',
    border: '#ff5a62',
    symbol: '🔥',
    glow: 'rgba(211, 32, 42, 0.5)',
  },
  G: {
    name: 'Verde',
    bg: '#00733e',
    text: '#ffffff',
    border: '#2db86a',
    symbol: '🌿',
    glow: 'rgba(0, 115, 62, 0.5)',
  },
  C: {
    name: 'Incolor',
    bg: '#3a3a44',
    text: '#c8c8d0',
    border: '#6a6a78',
    symbol: '◇',
    glow: 'rgba(160, 160, 170, 0.4)',
  },
} as const;

export const CATEGORY_INFO: Record<DeckCategory, { label: string; count: number; description: string }> = {
  colorless: {
    label: 'Incolor',
    count: 1,
    description: 'Decks sem nenhuma identidade de cor mana',
  },
  mono: {
    label: 'Monocolor',
    count: 5,
    description: 'Decks focados em uma única cor do MTG (W, U, B, R, G)',
  },
  guild: {
    label: 'Guildas (2 Cores)',
    count: 10,
    description: 'As 10 combinações de duas cores de Ravnica',
  },
  shard: {
    label: 'Shards & Wedges (3 Cores)',
    count: 10,
    description: 'Os 5 fragmentos de Alara e 5 clãs de Tarkir',
  },
  four: {
    label: '4 Cores (Nephilim)',
    count: 5,
    description: 'Combinações de quatro cores (falta apenas uma cor)',
  },
  five: {
    label: '5 Cores (WUBRG)',
    count: 1,
    description: 'O arco-íris completo com todas as cinco cores de mana',
  },
};

export const DECK_DEFINITIONS: DeckSlotDefinition[] = [
  // 1. Colorless
  {
    id: 'colorless',
    colors: '',
    name: 'Incolor',
    label: 'Incolor',
    category: 'colorless',
    categoryName: 'Incolor',
  },

  // 2. Mono-Colors (5)
  {
    id: 'mono-w',
    colors: 'W',
    name: 'Branco',
    label: 'Monocolor — Branco',
    category: 'mono',
    categoryName: 'Monocolor',
  },
  {
    id: 'mono-u',
    colors: 'U',
    name: 'Azul',
    label: 'Monocolor — Azul',
    category: 'mono',
    categoryName: 'Monocolor',
  },
  {
    id: 'mono-b',
    colors: 'B',
    name: 'Preto',
    label: 'Monocolor — Preto',
    category: 'mono',
    categoryName: 'Monocolor',
  },
  {
    id: 'mono-r',
    colors: 'R',
    name: 'Vermelho',
    label: 'Monocolor — Vermelho',
    category: 'mono',
    categoryName: 'Monocolor',
  },
  {
    id: 'mono-g',
    colors: 'G',
    name: 'Verde',
    label: 'Monocolor — Verde',
    category: 'mono',
    categoryName: 'Monocolor',
  },

  // 3. Guilds (10)
  {
    id: 'guild-azorius',
    colors: 'WU',
    name: 'Azorius',
    label: 'Azorius (WU)',
    category: 'guild',
    categoryName: 'Guildas',
  },
  {
    id: 'guild-dimir',
    colors: 'UB',
    name: 'Dimir',
    label: 'Dimir (UB)',
    category: 'guild',
    categoryName: 'Guildas',
  },
  {
    id: 'guild-rakdos',
    colors: 'BR',
    name: 'Rakdos',
    label: 'Rakdos (BR)',
    category: 'guild',
    categoryName: 'Guildas',
  },
  {
    id: 'guild-gruul',
    colors: 'RG',
    name: 'Gruul',
    label: 'Gruul (RG)',
    category: 'guild',
    categoryName: 'Guildas',
  },
  {
    id: 'guild-selesnya',
    colors: 'GW',
    name: 'Selesnya',
    label: 'Selesnya (GW)',
    category: 'guild',
    categoryName: 'Guildas',
  },
  {
    id: 'guild-orzhov',
    colors: 'WB',
    name: 'Orzhov',
    label: 'Orzhov (WB)',
    category: 'guild',
    categoryName: 'Guildas',
  },
  {
    id: 'guild-izzet',
    colors: 'UR',
    name: 'Izzet',
    label: 'Izzet (UR)',
    category: 'guild',
    categoryName: 'Guildas',
  },
  {
    id: 'guild-golgari',
    colors: 'BG',
    name: 'Golgari',
    label: 'Golgari (BG)',
    category: 'guild',
    categoryName: 'Guildas',
  },
  {
    id: 'guild-boros',
    colors: 'RW',
    name: 'Boros',
    label: 'Boros (RW)',
    category: 'guild',
    categoryName: 'Guildas',
  },
  {
    id: 'guild-simic',
    colors: 'GU',
    name: 'Simic',
    label: 'Simic (GU)',
    category: 'guild',
    categoryName: 'Guildas',
  },

  // 4. Shards & Wedges (10)
  {
    id: 'shard-esper',
    colors: 'WUB',
    name: 'Esper',
    label: 'Esper (WUB)',
    category: 'shard',
    categoryName: 'Shards & Wedges',
  },
  {
    id: 'shard-grixis',
    colors: 'UBR',
    name: 'Grixis',
    label: 'Grixis (UBR)',
    category: 'shard',
    categoryName: 'Shards & Wedges',
  },
  {
    id: 'shard-jund',
    colors: 'BRG',
    name: 'Jund',
    label: 'Jund (BRG)',
    category: 'shard',
    categoryName: 'Shards & Wedges',
  },
  {
    id: 'shard-naya',
    colors: 'RGW',
    name: 'Naya',
    label: 'Naya (RGW)',
    category: 'shard',
    categoryName: 'Shards & Wedges',
  },
  {
    id: 'shard-bant',
    colors: 'GWU',
    name: 'Bant',
    label: 'Bant (GWU)',
    category: 'shard',
    categoryName: 'Shards & Wedges',
  },
  {
    id: 'shard-abzan',
    colors: 'WBG',
    name: 'Abzan',
    label: 'Abzan (WBG)',
    category: 'shard',
    categoryName: 'Shards & Wedges',
  },
  {
    id: 'shard-jeskai',
    colors: 'URW',
    name: 'Jeskai',
    label: 'Jeskai (URW)',
    category: 'shard',
    categoryName: 'Shards & Wedges',
  },
  {
    id: 'shard-sultai',
    colors: 'BGU',
    name: 'Sultai',
    label: 'Sultai (BGU)',
    category: 'shard',
    categoryName: 'Shards & Wedges',
  },
  {
    id: 'shard-mardu',
    colors: 'RWB',
    name: 'Mardu',
    label: 'Mardu (RWB)',
    category: 'shard',
    categoryName: 'Shards & Wedges',
  },
  {
    id: 'shard-temur',
    colors: 'GUR',
    name: 'Temur',
    label: 'Temur (GUR)',
    category: 'shard',
    categoryName: 'Shards & Wedges',
  },

  // 5. Four-Color (5)
  {
    id: 'four-witch-maw',
    colors: 'GWUB',
    name: 'Witch-Maw',
    label: 'Witch-Maw (GWUB / Sem Vermelho)',
    category: 'four',
    categoryName: '4 Cores',
  },
  {
    id: 'four-yore-tiller',
    colors: 'WUBR',
    name: 'Yore-Tiller',
    label: 'Yore-Tiller (WUBR / Sem Verde)',
    category: 'four',
    categoryName: '4 Cores',
  },
  {
    id: 'four-ink-treader',
    colors: 'RGWU',
    name: 'Ink-Treader',
    label: 'Ink-Treader (RGWU / Sem Preto)',
    category: 'four',
    categoryName: '4 Cores',
  },
  {
    id: 'four-glint-eye',
    colors: 'UBRG',
    name: 'Glint-Eye',
    label: 'Glint-Eye (UBRG / Sem Branco)',
    category: 'four',
    categoryName: '4 Cores',
  },
  {
    id: 'four-dune-brood',
    colors: 'BRGW',
    name: 'Dune-Brood',
    label: 'Dune-Brood (BRGW / Sem Azul)',
    category: 'four',
    categoryName: '4 Cores',
  },

  // 6. Five-Color (1)
  {
    id: 'five-wubrg',
    colors: 'WUBRG',
    name: '5 Cores (WUBRG)',
    label: '5 Cores (WUBRG)',
    category: 'five',
    categoryName: '5 Cores',
  },
];

export const POWER_BRACKETS: { value: PowerBracket; label: string; desc: string }[] = [
  { value: 1, label: 'Bracket 1: Precon / Casual Leve', desc: 'Deck de entrada ou precon sem grandes upgrades' },
  { value: 2, label: 'Bracket 2: Casual Médio', desc: 'Sinergia clara, jogos equilibrados e ritmo descontraído' },
  { value: 3, label: 'Bracket 3: Focado / Upgraded', desc: 'Planos de vitória consistentes, boa aceleração e interações' },
  { value: 4, label: 'Bracket 4: Otimizado / High Power', desc: 'Combos rápidos, tutores eficientes, mana base impecável' },
  { value: 5, label: 'Bracket 5: cEDH', desc: 'Competitivo de alto nível, vitórias nos primeiros turnos' },
];

export function createInitialDeckSlot(colorCombination: string): DeckSlotData {
  return {
    color_combination: colorCombination,
    commander_name: '',
    commander_image_url: '',
    moxfield_url: '',
    bracket: null,
    status: 'not_started',
    notes: '',
    updated_at: Date.now(),
  };
}
