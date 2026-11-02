import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type {
  DeckSlotData,
  FilterCategory,
  FilterStatus,
  SortOption,
  ChallengeStats,
  DeckCategory,
} from '../types/vault';
import { DECK_DEFINITIONS, CATEGORY_INFO } from '../constants/vault/deckDefinitions';
import { initAndSeedDB, getAllDecks, saveDeck } from '../services/vault/db';
import { ProgressHero } from '../components/vault/ProgressHero';
import { DeckCard } from '../components/vault/DeckCard';
import { DeckEditorModal } from '../components/vault/DeckEditorModal';
import { ShareModal } from '../components/vault/ShareModal';
import { BackupModal } from '../components/vault/BackupModal';
import { SuggestDeckModal } from '../components/vault/SuggestDeckModal';
import { WelcomeModal } from '../components/vault/WelcomeModal';
import { hasSeenEstanteWelcome, markEstanteWelcomeSeen } from '../services/vault/onboarding';
import { useAuthStore } from '../features/auth/authStore';
import { Search, Share2, RefreshCw, Dices, ArrowLeft, Loader2 } from 'lucide-react';
import '../styles/vault.css';

export const CommanderVault: React.FC = () => {
  const navigate = useNavigate();
  const [decks, setDecks] = useState<DeckSlotData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>('all');
  const [selectedBracket, setSelectedBracket] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('default');

  // Modals
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const { user } = useAuthStore();
  const [showWelcome, setShowWelcome] = useState(() => !!user && !hasSeenEstanteWelcome(user.id));

  const closeWelcome = () => {
    if (user) markEstanteWelcomeSeen(user.id);
    setShowWelcome(false);
  };

  const refreshDecks = async () => {
    try {
      const data = await getAllDecks();
      setDecks(data);
    } catch (err) {
      console.error('Erro ao carregar decks:', err);
    }
  };

  useEffect(() => {
    initAndSeedDB()
      .then((data) => setDecks(data))
      .catch((err) => console.error('Erro no IndexedDB:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const stats: ChallengeStats = useMemo(() => {
    const total = 32;
    let complete = 0;
    let inProgress = 0;
    let notStarted = 0;

    const byCategory: ChallengeStats['byCategory'] = {
      colorless: { total: 1, complete: 0, inProgress: 0 },
      mono: { total: 5, complete: 0, inProgress: 0 },
      guild: { total: 10, complete: 0, inProgress: 0 },
      shard: { total: 10, complete: 0, inProgress: 0 },
      four: { total: 5, complete: 0, inProgress: 0 },
      five: { total: 1, complete: 0, inProgress: 0 },
    };

    const deckMap = new Map(decks.map((d) => [d.color_combination, d]));

    DECK_DEFINITIONS.forEach((def) => {
      const data = deckMap.get(def.id);
      const st = data?.status || 'not_started';

      if (st === 'complete') {
        complete++;
        byCategory[def.category].complete++;
      } else if (st === 'in_progress') {
        inProgress++;
        byCategory[def.category].inProgress++;
      } else {
        notStarted++;
      }
    });

    const percent = Math.round((complete / total) * 100);

    return {
      total,
      complete,
      inProgress,
      notStarted,
      percent,
      byCategory,
    };
  }, [decks]);

  const filteredDefinitions = useMemo(() => {
    const deckMap = new Map(decks.map((d) => [d.color_combination, d]));

    return DECK_DEFINITIONS.filter((def) => {
      const data = deckMap.get(def.id);

      if (selectedCategory !== 'all' && def.category !== selectedCategory) return false;
      const st = data?.status || 'not_started';
      if (selectedStatus !== 'all' && st !== selectedStatus) return false;
      if (selectedBracket !== 'all') {
        if (!data?.bracket || String(data.bracket) !== selectedBracket) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchDef = def.name.toLowerCase().includes(q) || def.label.toLowerCase().includes(q);
        const matchCommander = data?.commander_name?.toLowerCase().includes(q) || false;
        const matchPartner = data?.partner_name?.toLowerCase().includes(q) || false;
        const matchNickname = data?.nickname?.toLowerCase().includes(q) || false;
        const matchNotes = data?.notes?.toLowerCase().includes(q) || false;

        return matchDef || matchCommander || matchPartner || matchNickname || matchNotes;
      }

      return true;
    }).sort((a, b) => {
      const dataA = deckMap.get(a.id);
      const dataB = deckMap.get(b.id);

      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'status') {
        const priority: Record<string, number> = { complete: 1, in_progress: 2, not_started: 3 };
        return (priority[dataA?.status || 'not_started'] || 3) - (priority[dataB?.status || 'not_started'] || 3);
      }
      if (sortBy === 'updated') {
        return (dataB?.updated_at || 0) - (dataA?.updated_at || 0);
      }
      return 0;
    });
  }, [decks, selectedCategory, selectedStatus, selectedBracket, searchQuery, sortBy]);

  const handleSaveDeck = async (updated: DeckSlotData) => {
    await saveDeck(updated);
    setDecks((prev) =>
      prev.map((d) => (d.color_combination === updated.color_combination ? updated : d))
    );
    setEditingSlotId(null);
  };

  const editingDeckData = useMemo(() => {
    if (!editingSlotId) return null;
    const def = DECK_DEFINITIONS.find((d) => d.id === editingSlotId);
    const data =
      decks.find((d) => d.color_combination === editingSlotId) || {
        color_combination: editingSlotId,
        commander_name: '',
        commander_image_url: '',
        moxfield_url: '',
        bracket: null,
        status: 'not_started',
        notes: '',
        updated_at: Date.now(),
      };
    return def ? { definition: def, data } : null;
  }, [editingSlotId, decks]);

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          color: 'var(--gold)',
        }}
      >
        <Loader2 size={40} className="animate-spin" />
        <h2 style={{ fontFamily: 'Cinzel, Georgia, serif', fontSize: '1.4rem' }}>
          Carregando 32 Deck Challenge...
        </h2>
      </div>
    );
  }

  return (
    <div className="app-container pb-24">
      {/* Header with Flashpoint Back navigation */}
      <header className="app-header">
        <div className="app-header__top">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn--secondary btn--icon"
              onClick={() => navigate(-1)}
              title="Voltar ao Flashpoint"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="app-header__title">32 Deck Challenge</h1>
              <span className="app-header__subtitle">
                Estante de Decks · Rastreie seus 32 decks de EDH no Flashpoint
              </span>
            </div>
          </div>

          <div className="app-header__actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => setShowSuggestModal(true)}
              title="Sortear próximo deck"
            >
              <Dices size={16} /> O Que Montar?
            </button>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => setShowShareModal(true)}
              title="Gerar imagem de compartilhamento"
            >
              <Share2 size={16} /> Compartilhar
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--icon"
              onClick={() => setShowBackupModal(true)}
              title="Backup e Dados"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Progress Hero */}
      <ProgressHero
        stats={stats}
        onCategoryClick={(cat) => setSelectedCategory(cat as DeckCategory)}
      />

      {/* Category Tabs */}
      <nav className="category-tabs" aria-label="Filtro de categorias">
        <button
          type="button"
          className={`category-tab ${selectedCategory === 'all' ? 'category-tab--active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          Todos os 32
        </button>
        {(Object.keys(CATEGORY_INFO) as DeckCategory[]).map((cat) => (
          <button
            key={cat}
            type="button"
            className={`category-tab ${selectedCategory === cat ? 'category-tab--active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {CATEGORY_INFO[cat].label}
          </button>
        ))}
      </nav>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar__search">
          <Search size={16} className="toolbar__search-icon" />
          <input
            type="text"
            className="toolbar__input"
            placeholder="Buscar por cor, comandante ou apelido..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="toolbar__filters">
          <select
            className="toolbar__select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as FilterStatus)}
          >
            <option value="all">Status: Todos</option>
            <option value="not_started">Não Iniciado</option>
            <option value="in_progress">Em Progresso</option>
            <option value="complete">Completo</option>
          </select>

          <select
            className="toolbar__select"
            value={selectedBracket}
            onChange={(e) => setSelectedBracket(e.target.value)}
          >
            <option value="all">Bracket: Todos</option>
            <option value="1">Bracket 1 (Precon)</option>
            <option value="2">Bracket 2 (Casual)</option>
            <option value="3">Bracket 3 (Upgraded)</option>
            <option value="4">Bracket 4 (Otimizado)</option>
            <option value="5">Bracket 5 (cEDH)</option>
          </select>

          <select
            className="toolbar__select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            <option value="default">Ordem WUBRG</option>
            <option value="name">Nome (A-Z)</option>
            <option value="status">Status</option>
            <option value="updated">Mais Recentes</option>
          </select>
        </div>
      </div>

      {/* Decks Grid */}
      {filteredDefinitions.length === 0 ? (
        <div
          style={{
            padding: '3rem',
            textAlign: 'center',
            background: 'var(--surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-gold)',
            color: 'var(--text-muted)',
          }}
        >
          <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            Nenhum deck encontrado com os filtros selecionados.
          </p>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => {
              setSelectedCategory('all');
              setSelectedStatus('all');
              setSelectedBracket('all');
              setSearchQuery('');
            }}
          >
            Limpar Filtros
          </button>
        </div>
      ) : (
        <main className="deck-grid">
          {filteredDefinitions.map((def) => {
            const data =
              decks.find((d) => d.color_combination === def.id) || {
                color_combination: def.id,
                commander_name: '',
                commander_image_url: '',
                moxfield_url: '',
                bracket: null,
                status: 'not_started',
                notes: '',
                updated_at: Date.now(),
              };

            return (
              <DeckCard
                key={def.id}
                definition={def}
                data={data}
                onClick={() => setEditingSlotId(def.id)}
              />
            );
          })}
        </main>
      )}

      {/* Modals */}
      {editingDeckData && (
        <DeckEditorModal
          definition={editingDeckData.definition}
          deck={editingDeckData.data}
          onSave={handleSaveDeck}
          onClose={() => setEditingSlotId(null)}
        />
      )}

      {showShareModal && (
        <ShareModal
          decks={decks}
          stats={stats}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {showBackupModal && (
        <BackupModal
          onDataChanged={refreshDecks}
          onClose={() => setShowBackupModal(false)}
        />
      )}

      {showWelcome && <WelcomeModal onClose={closeWelcome} />}

      {showSuggestModal && (
        <SuggestDeckModal
          decks={decks}
          onSelectSlot={(slotId) => setEditingSlotId(slotId)}
          onClose={() => setShowSuggestModal(false)}
        />
      )}
    </div>
  );
};
export default CommanderVault;
