import React from 'react';
import type { ChallengeStats } from '../../types/vault';
import { CATEGORY_INFO } from '../../constants/vault/deckDefinitions';
import { ProgressRing } from './ProgressRing';
import { Trophy, Sparkles } from 'lucide-react';

interface ProgressHeroProps {
  stats: ChallengeStats;
  onCategoryClick?: (category: string) => void;
}

export const ProgressHero: React.FC<ProgressHeroProps> = ({ stats, onCategoryClick }) => {
  const categories = Object.keys(CATEGORY_INFO) as Array<keyof typeof CATEGORY_INFO>;

  return (
    <section className="progress-hero">
      <ProgressRing percent={stats.percent} />

      <div className="progress-info">
        <div className="progress-info__headline">
          <Trophy size={22} className="text-gold" />
          <span>
            Seu Desafio: <strong>{stats.complete} de {stats.total}</strong> Decks Finalizados
          </span>
          {stats.complete === stats.total && (
            <span className="badge" style={{ background: 'rgba(30, 180, 90, 0.25)', color: '#38d67a' }}>
              <Sparkles size={12} /> Desafio Conquistado!
            </span>
          )}
        </div>

        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
          {stats.inProgress} decks em andamento · {stats.notStarted} slots aguardando seu próximo comandante
        </p>

        <div className="progress-categories-grid">
          {categories.map((catKey) => {
            const catStats = stats.byCategory[catKey];
            const info = CATEGORY_INFO[catKey];

            return (
              <div
                key={catKey}
                className="category-stat-card"
                onClick={() => onCategoryClick?.(catKey)}
                style={{ cursor: onCategoryClick ? 'pointer' : 'default' }}
                title={`${info.description} (Clique para filtrar)`}
              >
                <span className="category-stat-name">{info.label.split(' ')[0]}</span>
                <span className="category-stat-numbers">
                  <span>{catStats.complete}</span> / {catStats.total}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
