import React from 'react';
import type { DeckSlotData, DeckSlotDefinition } from '../../types/vault';
import { ManaPips } from './ManaPips';
import { StatusPill } from './StatusPill';
import { ExternalLink, Sparkles, Shield } from 'lucide-react';

interface DeckCardProps {
  definition: DeckSlotDefinition;
  data: DeckSlotData;
  onClick: () => void;
}

export const DeckCard: React.FC<DeckCardProps> = ({ definition, data, onClick }) => {
  // Determine specific CSS border class for mono colors
  let monoClass = '';
  if (definition.category === 'mono' && definition.colors) {
    monoClass = `deck-card--mono-${definition.colors.toLowerCase()}`;
  } else if (definition.category === 'colorless') {
    monoClass = 'deck-card--mono-b';
  }

  const hasCommander = Boolean(data.commander_name.trim());
  const hasArt = Boolean(data.commander_image_url);

  return (
    <div className={`deck-card ${monoClass}`} onClick={onClick} role="button" tabIndex={0}>
      {/* Top Banner with Card Art Crop */}
      <div className="deck-card__art-wrap">
        {hasArt ? (
          <img
            src={data.commander_image_url}
            alt={data.commander_name}
            className="deck-card__art"
            loading="lazy"
          />
        ) : (
          <div className="deck-card__art-placeholder">
            <ManaPips colors={definition.colors} size="lg" />
          </div>
        )}
        <div className="deck-card__art-gradient" />

        {/* Top Badges */}
        <div className="deck-card__top-pips">
          <ManaPips colors={definition.colors} size="sm" />
        </div>
        <div className="deck-card__top-status">
          <StatusPill status={data.status} />
        </div>
      </div>

      {/* Card Content Body */}
      <div className="deck-card__body">
        <span className="deck-card__category-label">{definition.categoryName}</span>

        <h3 className="deck-card__name">
          {data.nickname ? data.nickname : definition.name}
        </h3>

        <div className={`deck-card__commander ${!hasCommander ? 'deck-card__commander--empty' : ''}`}>
          {hasCommander ? data.commander_name : 'Escolher Comandante...'}
        </div>

        {data.partner_name && (
          <div className="deck-card__partner">
            <Sparkles size={11} className="text-gold" />
            <span>+ {data.partner_name}</span>
          </div>
        )}

        {/* Footer with Bracket & External Links */}
        <div className="deck-card__footer">
          {data.bracket ? (
            <span className="bracket-badge" title={`Nível de poder: Bracket ${data.bracket}`}>
              <Shield size={11} style={{ marginRight: 4 }} /> Bracket {data.bracket}
            </span>
          ) : (
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Sem bracket</span>
          )}

          <div className="deck-card__links" onClick={(e) => e.stopPropagation()}>
            {data.moxfield_url && (
              <a
                href={data.moxfield_url}
                target="_blank"
                rel="noopener noreferrer"
                className="deck-card__link"
                title="Abrir no Moxfield"
              >
                Moxfield <ExternalLink size={11} />
              </a>
            )}
            {data.archidekt_url && (
              <a
                href={data.archidekt_url}
                target="_blank"
                rel="noopener noreferrer"
                className="deck-card__link"
                title="Abrir no Archidekt"
              >
                Archidekt <ExternalLink size={11} />
              </a>
            )}
            {data.manabox_url && (
              <a
                href={data.manabox_url}
                target="_blank"
                rel="noopener noreferrer"
                className="deck-card__link"
                title="Abrir no ManaBox"
              >
                ManaBox <ExternalLink size={11} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
