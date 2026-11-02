import React, { useState } from 'react';
import type { DeckSlotData, DeckSlotDefinition } from '../../types/vault';
import { DECK_DEFINITIONS } from '../../constants/vault/deckDefinitions';
import { ManaPips } from './ManaPips';
import { X, Dices, ArrowRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SuggestDeckModalProps {
  decks: DeckSlotData[];
  onSelectSlot: (slotId: string) => void;
  onClose: () => void;
}

export const SuggestDeckModal: React.FC<SuggestDeckModalProps> = ({
  decks,
  onSelectSlot,
  onClose,
}) => {
  const [selectedDefinition, setSelectedDefinition] = useState<DeckSlotDefinition | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const deckMap = new Map(decks.map((d) => [d.color_combination, d]));

  const rollRandom = (filter: 'not_started' | 'in_progress' | 'any') => {
    setIsRolling(true);

    const candidates = DECK_DEFINITIONS.filter((def) => {
      const data = deckMap.get(def.id);
      if (filter === 'any') return true;
      return (data?.status || 'not_started') === filter;
    });

    if (candidates.length === 0) {
      setIsRolling(false);
      return;
    }

    // Simulate roulette roll
    let counter = 0;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * candidates.length);
      setSelectedDefinition(candidates[randomIdx]);
      counter++;
      if (counter > 12) {
        clearInterval(interval);
        const finalCandidate = candidates[Math.floor(Math.random() * candidates.length)];
        setSelectedDefinition(finalCandidate);
        setIsRolling(false);
        confetti({
          particleCount: 50,
          spread: 50,
          origin: { y: 0.6 },
          colors: ['#c5a059', '#3d9fd4', '#d3202a'],
        });
      }
    }, 80);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header__title-wrap">
            <Dices size={20} className="text-gold" />
            <h2 className="modal-header__title">O Que Construir a Seguir?</h2>
          </div>
          <button type="button" className="btn btn--ghost btn--icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Sem inspiração para o próximo deck? Deixe a Estante de Decks sortear um desafio para você!
          </p>

          <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn btn--secondary"
              disabled={isRolling}
              onClick={() => rollRandom('not_started')}
            >
              <Dices size={16} /> Sortear Slot Vazio
            </button>
            <button
              type="button"
              className="btn btn--secondary"
              disabled={isRolling}
              onClick={() => rollRandom('in_progress')}
            >
              <Sparkles size={16} /> Retomar Em Progresso
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              disabled={isRolling}
              onClick={() => rollRandom('any')}
            >
              Qualquer dos 32
            </button>
          </div>

          {selectedDefinition && (
            <div
              style={{
                marginTop: '1.5rem',
                padding: '1.5rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-gold-strong)',
                boxShadow: 'var(--shadow-gold)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <ManaPips colors={selectedDefinition.colors} size="lg" />
              <h3 style={{ fontSize: '1.4rem', color: 'var(--gold-bright)' }}>
                {selectedDefinition.name}
              </h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {selectedDefinition.label} ({selectedDefinition.categoryName})
              </span>

              <button
                type="button"
                className="btn btn--primary"
                style={{ marginTop: '0.5rem' }}
                onClick={() => {
                  onSelectSlot(selectedDefinition.id);
                  onClose();
                }}
              >
                Abrir e Construir Este Deck <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
