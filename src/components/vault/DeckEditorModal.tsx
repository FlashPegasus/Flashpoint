import React, { useState, useEffect, useRef } from 'react';
import type { DeckSlotData, DeckSlotDefinition, ScryfallCard, PowerBracket, DeckStatus } from '../../types/vault';
import { POWER_BRACKETS } from '../../constants/vault/deckDefinitions';
import { searchCommanders, extractCardArt } from '../../services/vault/scryfall';
import { ManaPips } from './ManaPips';
import { X, Search, Check, Loader2, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DeckEditorModalProps {
  definition: DeckSlotDefinition;
  deck: DeckSlotData;
  onSave: (updated: DeckSlotData) => void;
  onClose: () => void;
}

export const DeckEditorModal: React.FC<DeckEditorModalProps> = ({
  definition,
  deck,
  onSave,
  onClose,
}) => {
  // Form State
  const [commanderName, setCommanderName] = useState(deck.commander_name);
  const [imageUrl, setImageUrl] = useState(deck.commander_image_url);
  const [partnerName, setPartnerName] = useState(deck.partner_name || '');
  const [status, setStatus] = useState<DeckStatus>(deck.status);
  const [bracket, setBracket] = useState<PowerBracket | null>(deck.bracket);
  const [nickname, setNickname] = useState(deck.nickname || '');
  const [moxfieldUrl, setMoxfieldUrl] = useState(deck.moxfield_url || '');
  const [archidektUrl, setArchidektUrl] = useState(deck.archidekt_url || '');
  const [notes, setNotes] = useState(deck.notes || '');

  // Autocomplete state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ScryfallCard[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<number | null>(null);

  // Debounced search when typing query
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = window.setTimeout(async () => {
      try {
        const results = await searchCommanders(searchQuery, definition.colors);
        setSearchResults(results.slice(0, 8));
        setShowDropdown(true);
      } catch (err) {
        console.warn('Erro ao buscar comandantes:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, definition.colors]);

  const handleSelectCommander = (card: ScryfallCard) => {
    setCommanderName(card.name);
    const art = extractCardArt(card);
    if (art) {
      setImageUrl(art);
    }
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleClearCommander = () => {
    setCommanderName('');
    setImageUrl('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Trigger confetti if newly completed!
    if (status === 'complete' && deck.status !== 'complete') {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#c5a059', '#d4af37', '#38d67a', '#ffffff'],
      });
    }

    const updated: DeckSlotData = {
      ...deck,
      commander_name: commanderName.trim(),
      commander_image_url: imageUrl,
      partner_name: partnerName.trim() || undefined,
      status,
      bracket,
      nickname: nickname.trim() || undefined,
      moxfield_url: moxfieldUrl.trim(),
      archidekt_url: archidektUrl.trim() || undefined,
      notes: notes.trim(),
      updated_at: Date.now(),
    };

    onSave(updated);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header__title-wrap">
            <ManaPips colors={definition.colors} size="md" />
            <div>
              <h2 className="modal-header__title">{definition.name}</h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {definition.label}
              </span>
            </div>
          </div>
          <button type="button" className="btn btn--ghost btn--icon" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Card Preview Banner */}
            {imageUrl && (
              <div className="modal-card-preview">
                <img src={imageUrl} alt={commanderName} />
                <div className="modal-card-preview__overlay">
                  <div>
                    <strong style={{ color: 'var(--gold-bright)', fontSize: '0.95rem' }}>
                      {commanderName}
                    </strong>
                  </div>
                  <button
                    type="button"
                    className="btn btn--ghost btn--icon"
                    onClick={handleClearCommander}
                    title="Remover arte"
                    style={{ color: '#ff5a62', width: 28, height: 28 }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Commander Autocomplete Search */}
            <div className="form-group autocomplete-box">
              <label className="form-label">Buscar Comandante (Scryfall API)</label>
              <div style={{ position: 'relative' }}>
                <Search
                  size={18}
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
                <input
                  type="text"
                  className="form-input"
                  style={{ width: '100%', paddingLeft: '2.4rem' }}
                  placeholder="Digite o nome de uma criatura lendária..."
                  value={searchQuery || commanderName}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCommanderName(e.target.value);
                  }}
                  onFocus={() => {
                    if (searchResults.length > 0) setShowDropdown(true);
                  }}
                />
                {isSearching && (
                  <Loader2
                    size={18}
                    className="animate-spin"
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gold)' }}
                  />
                )}
              </div>

              {/* Suggestions Dropdown */}
              {showDropdown && searchResults.length > 0 && (
                <div className="autocomplete-dropdown">
                  {searchResults.map((card) => {
                    const art = extractCardArt(card);
                    return (
                      <div
                        key={card.id}
                        className="autocomplete-item"
                        onClick={() => handleSelectCommander(card)}
                      >
                        {art && <img src={art} alt={card.name} className="autocomplete-thumb" />}
                        <div>
                          <div className="autocomplete-name">{card.name}</div>
                          <div className="autocomplete-type">{card.type_line}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Partner / Background */}
            <div className="form-group">
              <label className="form-label">Comandante Parceiro / Background (Opcional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Tymna the Weaver, Raised by Wolves..."
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
              />
            </div>

            {/* Grid 2 Columns: Status & Power Bracket */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {/* Status */}
              <div className="form-group">
                <label className="form-label">Status do Deck</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as DeckStatus)}
                >
                  <option value="not_started">⚪ Não Iniciado</option>
                  <option value="in_progress">🟡 Em Progresso</option>
                  <option value="complete">🟢 Completo</option>
                </select>
              </div>

              {/* Power Bracket */}
              <div className="form-group">
                <label className="form-label">Nível de Poder (Power Bracket)</label>
                <select
                  className="form-select"
                  value={bracket || ''}
                  onChange={(e) => setBracket(e.target.value ? (Number(e.target.value) as PowerBracket) : null)}
                >
                  <option value="">Nenhum bracket selecionado</option>
                  {POWER_BRACKETS.map((b) => (
                    <option key={b.value} value={b.value}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Nickname */}
            <div className="form-group">
              <label className="form-label">Apelido do Deck (Nickname)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Aristocratas Sombrios, Goblin Party..."
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </div>

            {/* Deck Links (Moxfield / Archidekt) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Link no Moxfield</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://www.moxfield.com/decks/..."
                  value={moxfieldUrl}
                  onChange={(e) => setMoxfieldUrl(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Link no Archidekt</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://archidekt.com/decks/..."
                  value={archidektUrl}
                  onChange={(e) => setArchidektUrl(e.target.value)}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label">Anotações & Estratégia</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Combos principais, cartas na lista de desejos, alterações futuras..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="btn btn--secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn--primary">
              <Check size={16} /> Salvar Deck
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
