export type ColorIdentity = 'W' | 'U' | 'B' | 'R' | 'G';

export type DeckCategory = 'colorless' | 'mono' | 'guild' | 'shard' | 'four' | 'five';

export type DeckStatus = 'not_started' | 'in_progress' | 'complete';

export type PowerBracket = 1 | 2 | 3 | 4 | 5;

export interface DeckSlotDefinition {
  id: string;
  colors: string; // Ex: "", "W", "WU", "WUB", "GWUB", "WUBRG"
  name: string;   // Ex: "Azorius", "Esper", "Colorless"
  label: string;  // Ex: "Azorius (WU)", "Monocolored — White"
  category: DeckCategory;
  categoryName: string; // Ex: "Guildas", "Shards & Wedges"
}

export interface DeckSlotData {
  color_combination: string; // matches DeckSlotDefinition.id
  commander_name: string;
  commander_image_url: string;
  partner_name?: string;
  partner_image_url?: string;
  moxfield_url: string;
  archidekt_url?: string;
  manabox_url?: string;
  bracket: PowerBracket | null;
  status: DeckStatus;
  notes: string;
  nickname?: string;
  updated_at: number;
}

export interface ScryfallCardFace {
  name: string;
  type_line?: string;
  oracle_text?: string;
  mana_cost?: string;
  image_uris?: {
    small?: string;
    normal?: string;
    large?: string;
    art_crop?: string;
  };
}

export interface ScryfallCard {
  id: string;
  name: string;
  type_line?: string;
  oracle_text?: string;
  mana_cost?: string;
  colors?: string[];
  color_identity?: string[];
  image_uris?: {
    small?: string;
    normal?: string;
    large?: string;
    art_crop?: string;
  };
  card_faces?: ScryfallCardFace[];
  artist?: string;
  scryfall_uri?: string;
}

export interface CachedCommander {
  name_lc: string;
  display_name: string;
  card: ScryfallCard;
  updated_at: number;
}

export interface VaultBackup {
  app: 'commander-vault';
  schema_version: number;
  exported_at: string;
  decks: DeckSlotData[];
}

export interface ChallengeStats {
  total: number;
  complete: number;
  inProgress: number;
  notStarted: number;
  percent: number;
  byCategory: Record<DeckCategory, { total: number; complete: number; inProgress: number }>;
}

export type FilterCategory = 'all' | DeckCategory;
export type FilterStatus = 'all' | DeckStatus;
export type SortOption = 'default' | 'name' | 'status' | 'updated';
