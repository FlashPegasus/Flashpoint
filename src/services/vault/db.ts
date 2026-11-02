import { openDB, type IDBPDatabase } from 'idb';
import type { DeckSlotData, CachedCommander, VaultBackup, ScryfallCard } from '../../types/vault';
import { DECK_DEFINITIONS, createInitialDeckSlot } from '../../constants/vault/deckDefinitions';

const DB_NAME = 'commander-vault';
const DB_VERSION = 2;
const BACKUP_SCHEMA_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

export function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('decks')) {
          db.createObjectStore('decks', { keyPath: 'color_combination' });
        }
        if (!db.objectStoreNames.contains('commander_cache')) {
          db.createObjectStore('commander_cache', { keyPath: 'name_lc' });
        }
      },
    });
  }
  return dbPromise;
}

export async function initAndSeedDB(): Promise<DeckSlotData[]> {
  const db = await getDB();
  const tx = db.transaction('decks', 'readwrite');
  const store = tx.objectStore('decks');

  // Verify and seed all 32 combinations
  for (const def of DECK_DEFINITIONS) {
    const existing = await store.get(def.id);
    if (!existing) {
      await store.put(createInitialDeckSlot(def.id));
    }
  }
  await tx.done;

  return getAllDecks();
}

export async function getAllDecks(): Promise<DeckSlotData[]> {
  const db = await getDB();
  const all = await db.getAll('decks');
  
  // Sort according to canonical DECK_DEFINITIONS order
  const orderMap = new Map(DECK_DEFINITIONS.map((d, index) => [d.id, index]));
  return all.sort((a, b) => {
    const orderA = orderMap.get(a.color_combination) ?? 99;
    const orderB = orderMap.get(b.color_combination) ?? 99;
    return orderA - orderB;
  });
}

export async function getDeck(colorCombination: string): Promise<DeckSlotData | undefined> {
  const db = await getDB();
  return db.get('decks', colorCombination);
}

export async function saveDeck(deck: DeckSlotData): Promise<void> {
  const db = await getDB();
  const updatedDeck: DeckSlotData = {
    ...deck,
    updated_at: Date.now(),
  };
  await db.put('decks', updatedDeck);
}

export async function getCachedCommander(name: string): Promise<ScryfallCard | null> {
  try {
    const db = await getDB();
    const key = name.trim().toLowerCase();
    const record = (await db.get('commander_cache', key)) as CachedCommander | undefined;
    return record ? record.card : null;
  } catch (err) {
    console.warn('Commander cache lookup error:', err);
    return null;
  }
}

export async function cacheCommander(name: string, card: ScryfallCard): Promise<void> {
  try {
    const db = await getDB();
    const key = name.trim().toLowerCase();
    const record: CachedCommander = {
      name_lc: key,
      display_name: name.trim(),
      card,
      updated_at: Date.now(),
    };
    await db.put('commander_cache', record);
  } catch (err) {
    console.warn('Commander cache write error:', err);
  }
}

export async function exportBackup(): Promise<string> {
  const decks = await getAllDecks();
  const backup: VaultBackup = {
    app: 'commander-vault',
    schema_version: BACKUP_SCHEMA_VERSION,
    exported_at: new Date().toISOString(),
    decks,
  };
  return JSON.stringify(backup, null, 2);
}

export async function importBackup(jsonString: string): Promise<{ success: boolean; importedCount: number; message: string }> {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, importedCount: 0, message: 'Arquivo JSON inválido.' };
    }
    if (!Array.isArray(parsed.decks)) {
      return { success: false, importedCount: 0, message: 'Arquivo de backup não contém a lista de decks.' };
    }

    const validIds = new Set(DECK_DEFINITIONS.map(d => d.id));
    const db = await getDB();
    const tx = db.transaction('decks', 'readwrite');
    const store = tx.objectStore('decks');
    let imported = 0;

    for (const item of parsed.decks) {
      if (item && typeof item.color_combination === 'string' && validIds.has(item.color_combination)) {
        const slotData: DeckSlotData = {
          color_combination: item.color_combination,
          commander_name: typeof item.commander_name === 'string' ? item.commander_name : '',
          commander_image_url: typeof item.commander_image_url === 'string' ? item.commander_image_url : '',
          partner_name: typeof item.partner_name === 'string' ? item.partner_name : '',
          partner_image_url: typeof item.partner_image_url === 'string' ? item.partner_image_url : '',
          moxfield_url: typeof item.moxfield_url === 'string' ? item.moxfield_url : '',
          archidekt_url: typeof item.archidekt_url === 'string' ? item.archidekt_url : '',
          manabox_url: typeof item.manabox_url === 'string' ? item.manabox_url : '',
          bracket: [1, 2, 3, 4, 5].includes(item.bracket) ? item.bracket : null,
          status: ['not_started', 'in_progress', 'complete'].includes(item.status) ? item.status : 'not_started',
          notes: typeof item.notes === 'string' ? item.notes : '',
          nickname: typeof item.nickname === 'string' ? item.nickname : '',
          updated_at: typeof item.updated_at === 'number' ? item.updated_at : Date.now(),
        };
        await store.put(slotData);
        imported++;
      }
    }
    await tx.done;

    return {
      success: true,
      importedCount: imported,
      message: `${imported} decks importados com sucesso!`,
    };
  } catch (err: any) {
    return {
      success: false,
      importedCount: 0,
      message: `Erro ao importar backup: ${err.message || 'Formato desconhecido'}`,
    };
  }
}

export async function resetAllDecks(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('decks', 'readwrite');
  const store = tx.objectStore('decks');
  for (const def of DECK_DEFINITIONS) {
    await store.put(createInitialDeckSlot(def.id));
  }
  await tx.done;
}
