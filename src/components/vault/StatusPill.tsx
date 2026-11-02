import React from 'react';
import type { DeckStatus } from '../../types/vault';
import { Circle, Clock, CheckCircle2 } from 'lucide-react';

interface StatusPillProps {
  status: DeckStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, className = '' }) => {
  switch (status) {
    case 'complete':
      return (
        <span className={`status-pill status-pill--complete ${className}`}>
          <CheckCircle2 size={12} strokeWidth={2.5} />
          Completo
        </span>
      );
    case 'in_progress':
      return (
        <span className={`status-pill status-pill--in_progress ${className}`}>
          <Clock size={12} strokeWidth={2.5} />
          Em Progresso
        </span>
      );
    case 'not_started':
    default:
      return (
        <span className={`status-pill status-pill--not_started ${className}`}>
          <Circle size={10} strokeWidth={2} />
          Não Iniciado
        </span>
      );
  }
};
