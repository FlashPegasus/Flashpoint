import React from 'react';
import { X, Library, Target, Layers, Sparkles } from 'lucide-react';

interface WelcomeModalProps {
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ onClose }) => {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header__title-wrap">
            <Library size={20} className="text-gold" />
            <h2 className="modal-header__title">Bem-vindo à Estante de Decks</h2>
          </div>
          <button type="button" className="btn btn--ghost btn--icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Aqui você organiza a sua coleção de decks de Commander e acompanha o desafio de montar um deck para cada combinação de cores.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', marginTop: '0.75rem', fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <Target size={18} className="text-gold" style={{ flexShrink: 0 }} />
              <span>Cada espaço representa uma combinação de cores. Escolha o comandante e marque o status: não iniciado, em construção ou pronto.</span>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <Layers size={18} className="text-gold" style={{ flexShrink: 0 }} />
              <span>Registre o nível de poder, anote ideias e veja seu progresso geral crescer.</span>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <Sparkles size={18} className="text-gold" style={{ flexShrink: 0 }} />
              <span>Sem ideia do que montar? Use o sorteio, e compartilhe sua conquista quando quiser.</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn--primary" onClick={onClose}>
            Começar
          </button>
        </div>
      </div>
    </div>
  );
};
