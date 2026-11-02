import React from 'react';
import { MANA_CONFIG, MANA_PIPES } from '../../constants/vault/deckDefinitions';

interface ManaPipsProps {
  colors: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ManaPips: React.FC<ManaPipsProps> = ({ colors, size = 'md', className = '' }) => {
  // Extract canonical MTG colors in WUBRG order
  const activeColors = MANA_PIPES.filter((c) => colors.toUpperCase().includes(c));

  if (activeColors.length === 0) {
    // Colorless
    return (
      <div className={`mana-pips ${className}`}>
        <span
          className={`mana-pip mana-pip--C mana-pip--${size}`}
          title="Incolor (Colorless)"
        >
          {MANA_CONFIG.C.symbol}
        </span>
      </div>
    );
  }

  return (
    <div className={`mana-pips ${className}`} aria-label={colors}>
      {activeColors.map((color) => {
        const config = MANA_CONFIG[color];
        return (
          <span
            key={color}
            className={`mana-pip mana-pip--${color} mana-pip--${size}`}
            title={config.name}
          >
            {config.symbol}
          </span>
        );
      })}
    </div>
  );
};
