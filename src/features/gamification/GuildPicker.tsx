import React, { useState } from 'react';
import { getAllUnlockedTiers, buildGradientText, type MtgTier, type MtgCombination } from './mtgTiers';

interface GuildPickerProps {
    level: number;
    currentGuildId?: string;
    onSelect: (combinationId: string) => Promise<void> | void;
    onClose: () => void;
}

const SUBTYPE_LABELS: Record<string, string> = {
    'guild-allied': 'Guilda Aliada',
    'guild-enemy': 'Guilda Inimiga',
    arc: 'Arco (Alara)',
    wedge: 'Cunha (Khans)',
    'four-color': 'Quatro Cores',
    'five-color': 'Cinco Cores',
};

function ComboBadge({
    combo,
    selected,
    onClick,
}: {
    combo: MtgCombination;
    selected: boolean;
    onClick: () => void;
}) {
    const gradientStr = buildGradientText(combo);
    const isGradient = combo.glowColors.length > 1;
    const isRainbow = combo.glowMode === 'rainbow';

    const glowShadow = isRainbow
        ? '0 0 20px #f9f3e3, 0 0 20px #0e68ab, 0 0 20px #d3202a, 0 0 20px #00733e'
        : combo.glowColors.length >= 2
        ? `0 0 18px ${combo.glowColors[0]}, 0 0 10px ${combo.glowColors[1]}`
        : `0 0 16px ${combo.glowColors[0]}`;

    return (
        <button
            onClick={onClick}
            aria-pressed={selected}
            title={combo.name}
            className="guild-picker-badge"
            style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                padding: '12px 10px',
                borderRadius: '12px',
                border: selected
                    ? `2px solid ${combo.glowColors[0]}`
                    : '2px solid rgba(255,255,255,0.06)',
                background: selected
                    ? 'rgba(255,255,255,0.07)'
                    : 'rgba(255,255,255,0.02)',
                boxShadow: selected ? glowShadow : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease-out',
                minWidth: '90px',
                flex: '1 1 calc(20% - 10px)',
                maxWidth: '130px',
            }}
        >
            {/* Color pips */}
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {combo.glowColors.map((hex, i) => (
                    <span
                        key={i}
                        style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            background: hex,
                            boxShadow: selected ? `0 0 6px ${hex}` : 'none',
                            display: 'inline-block',
                            flexShrink: 0,
                        }}
                    />
                ))}
            </div>

            {/* Symbol */}
            {combo.symbol && (
                <span style={{ fontSize: 18, lineHeight: 1 }}>{combo.symbol}</span>
            )}

            {/* Name */}
            <span
                style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    textAlign: 'center',
                    lineHeight: 1.3,
                    background: isRainbow
                        ? 'linear-gradient(135deg, #f9f3e3, #0e68ab, #d3202a, #00733e)'
                        : isGradient
                        ? gradientStr
                        : undefined,
                    WebkitBackgroundClip: isGradient || isRainbow ? 'text' : undefined,
                    WebkitTextFillColor: isGradient || isRainbow ? 'transparent' : combo.glowColors[0],
                    backgroundClip: isGradient || isRainbow ? 'text' : undefined,
                    color: !isGradient && !isRainbow ? combo.glowColors[0] : undefined,
                }}
            >
                {combo.name}
            </span>

            {/* Subtype label */}
            {combo.subType && (
                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
                    {SUBTYPE_LABELS[combo.subType] ?? combo.subType}
                </span>
            )}

            {/* Selected ring */}
            {selected && (
                <span
                    style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: combo.glowColors[0],
                        boxShadow: `0 0 6px ${combo.glowColors[0]}`,
                    }}
                />
            )}
        </button>
    );
}

export const GuildPicker: React.FC<GuildPickerProps> = ({
    level,
    currentGuildId,
    onSelect,
    onClose,
}) => {
    const unlockedTiers = getAllUnlockedTiers(level);
    const [activeTierIndex, setActiveTierIndex] = useState(() => {
        if (!currentGuildId) return unlockedTiers.length - 1;
        const idx = unlockedTiers.findIndex(t =>
            t.combinations.some(c => c.id === currentGuildId)
        );
        return idx >= 0 ? idx : unlockedTiers.length - 1;
    });
    const [loading, setLoading] = useState(false);

    const activeTier: MtgTier = unlockedTiers[activeTierIndex];

    const handleSelect = async (combo: MtgCombination) => {
        if (loading) return;
        setLoading(true);
        try {
            await onSelect(combo.id);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Escolher Identidade de Cor"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(6px)',
                padding: '16px',
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                style={{
                    background: '#0f1117',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '20px',
                    padding: '24px',
                    width: '100%',
                    maxWidth: '560px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
                }}
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#fff' }}>
                            Identidade de Cor
                        </h2>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                            Escolha qual combinação exibir. Nível atual: <strong style={{ color: '#fff' }}>{level}</strong>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Fechar"
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'rgba(255,255,255,0.4)',
                            fontSize: '20px',
                            cursor: 'pointer',
                            lineHeight: 1,
                            padding: '0 4px',
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Tier tabs */}
                <div
                    style={{
                        display: 'flex',
                        gap: '6px',
                        marginBottom: '20px',
                        flexWrap: 'wrap',
                    }}
                >
                    {unlockedTiers.map((tier, idx) => {
                        const isActive = idx === activeTierIndex;
                        const tierCombo = tier.combinations[0];
                        const borderColor = isActive ? tierCombo.glowColors[0] : 'rgba(255,255,255,0.08)';
                        return (
                            <button
                                key={tier.id}
                                onClick={() => setActiveTierIndex(idx)}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    border: `1px solid ${borderColor}`,
                                    background: isActive ? 'rgba(255,255,255,0.07)' : 'transparent',
                                    color: isActive ? '#fff' : 'rgba(255,255,255,0.4)',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: isActive ? 700 : 400,
                                    transition: 'all 0.15s',
                                    boxShadow: isActive ? `0 0 10px ${tierCombo.glowColors[0]}40` : 'none',
                                }}
                            >
                                <span style={{ marginRight: 4 }}>Tier {tier.tier}</span>
                                {tier.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tier description */}
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginBottom: 16 }}>
                    {activeTier.description}
                </p>

                {/* Combinations grid */}
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px',
                        justifyContent: 'flex-start',
                    }}
                >
                    {activeTier.combinations.map(combo => (
                        <ComboBadge
                            key={combo.id}
                            combo={combo}
                            selected={currentGuildId === combo.id}
                            onClick={() => handleSelect(combo)}
                        />
                    ))}
                </div>

                {loading && (
                    <p style={{ textAlign: 'center', marginTop: 16, fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                        Salvando...
                    </p>
                )}
            </div>
        </div>
    );
};
