import type { ScryfallCard } from '../../types/vault';
import { getCachedCommander, cacheCommander } from './db';

const SCRYFALL_API_BASE = 'https://api.scryfall.com';

export function extractCardArt(card: ScryfallCard): string | null {
  // If single face
  if (card.image_uris?.art_crop) {
    return card.image_uris.art_crop;
  }
  if (card.image_uris?.normal) {
    return card.image_uris.normal;
  }

  // If double-faced or MDFC
  if (card.card_faces && card.card_faces.length > 0) {
    // Prefer the face that is legendary or specifies it can be commander
    const commanderFace =
      card.card_faces.find(
        (f) =>
          f.type_line?.includes('Legendary') ||
          f.oracle_text?.toLowerCase().includes('can be your commander')
      ) || card.card_faces[0];

    return commanderFace.image_uris?.art_crop || commanderFace.image_uris?.normal || null;
  }

  return null;
}

export async function searchCommanders(
  query: string,
  colors?: string
): Promise<ScryfallCard[]> {
  const cleanQuery = query.trim();
  if (cleanQuery.length < 2) return [];

  // Scryfall query syntax
  // is:commander matches legendary creatures, planeswalkers with commander clause, backgrounds, etc.
  let q = `is:commander ${cleanQuery}`;
  if (colors !== undefined) {
    // If exact color match is desired, can use identity<= or identity=
    // For broader user ease, let's keep it flexible or filter
    if (colors === '') {
      q += ' identity:C';
    } else {
      q += ` identity<=${colors}`;
    }
  }

  const url = `${SCRYFALL_API_BASE}/cards/search?q=${encodeURIComponent(
    q
  )}&unique=cards&order=name`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (res.status === 404) {
      return [];
    }

    if (!res.ok) {
      throw new Error(`Scryfall API error: ${res.statusText}`);
    }

    const data = await res.json();
    const cards: ScryfallCard[] = data.data || [];

    // Cache results in background for instant offline reuse
    cards.slice(0, 10).forEach((card) => {
      cacheCommander(card.name, card);
    });

    return cards;
  } catch (err: any) {
    // Try local cache fallback if offline
    const cached = await getCachedCommander(cleanQuery);
    if (cached) {
      return [cached];
    }
    throw err;
  }
}

export async function getCommanderExact(name: string): Promise<ScryfallCard | null> {
  const cleanName = name.trim();
  if (!cleanName) return null;

  // Check cache first
  const cached = await getCachedCommander(cleanName);
  if (cached) return cached;

  const url = `${SCRYFALL_API_BASE}/cards/named?exact=${encodeURIComponent(cleanName)}`;
  try {
    const res = await fetch(url);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Scryfall API error: ${res.statusText}`);

    const card: ScryfallCard = await res.json();
    await cacheCommander(card.name, card);
    return card;
  } catch (err) {
    console.warn(`Could not fetch exact card "${name}":`, err);
    return null;
  }
}
