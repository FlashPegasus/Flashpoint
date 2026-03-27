import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CheckInModal from './modals/CheckInModal';
import DeckSelectionModal from './modals/DeckSelectionModal';
import AuthModal from './modals/AuthModal';
import { useAuthStore } from '../features/auth/authStore';

interface CardData {
    colorClass: string;
    icon: string;
    title: React.ReactNode;
    body: string;
    tags: string[];
    action: (arg: any) => void; // Keep any for polymorphic ease, but I'll fix the internal calls
}

const CARDS: CardData[] = [
    {
        colorClass: 'lp-card-0',
        icon: '🏆', title: <>Torneios<br />ao Vivo</>,
        body: 'Brackets em tempo real e resultados instantâneos. Encontre eventos perto de você.',
        tags: ['Live', 'Discover', 'Swiss'],
        action: (nav: any) => nav('/discover')
    },
    {
        colorClass: 'lp-card-1',
        icon: '👑', title: <>Ranking<br />Global</>,
        body: 'O Panteão das Lendas. Veja quem domina o meta e suba no ranking ELO.',
        tags: ['ELO', 'Pódio', 'Stats'],
        action: (nav: any) => nav('/ranking')
    },
    {
        colorClass: 'lp-card-2',
        icon: '⚡', title: <>Check-in<br />Rápido</>,
        body: 'Entrada instantânea em torneios via código. Sem filas, sem complicações.',
        tags: ['Quick', 'Manual', 'Easy'],
        action: (setModal: any) => setModal(true)
    },
    {
        colorClass: 'lp-card-3',
        icon: '🃏', title: <>Decks &<br />Scryfall</>,
        body: 'Consulte cards em alta definição. Integração direta com Scryfall e LigaMagic.',
        tags: ['Cards', 'TCG', 'Search'],
        action: (setModal: any) => setModal(true)
    },
    {
        colorClass: 'lp-card-4',
        icon: '🔥', title: <>Ligas &<br />Comunidade</>,
        body: 'Crie sua própria liga ou junte-se a uma existente. O coração social do FlashPoint.',
        tags: ['Sociável', 'Ligas', 'XP'],
        action: (nav: any) => nav('/leagues')
    },
];

const ANGLES = [-30, -15, 0, 15, 30];

type Phase = 'deck' | 'dealing' | 'fan';

interface FlyState {
    id: number;
    left: number;
    top: number;
    opacity: number;
    transform: string;
    transition: string;
}

export const FanCards: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [phase, setPhase] = useState<Phase>('deck');
    const [active, setActive] = useState(2); // Start with center card
    const [showCheckIn, setShowCheckIn] = useState(false);
    const [showDeckModal, setShowDeckModal] = useState(false);
    const [showAuth, setShowAuth] = useState(false);
    const [flyingCards, setFlyingCards] = useState<FlyState[]>([]);
    
    const deckRef = useRef<HTMLButtonElement>(null);
    const touchStartX = useRef(0);
    const isDragging = useRef(false);

    const handleDeal = () => {
        if (phase !== 'deck' || !deckRef.current) return;

        // Requirement: Must be logged in to deal
        if (!user) {
            setShowAuth(true);
            return;
        }
        
        const rect = deckRef.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        setPhase('dealing');

        // Initial setup for flying cards
        const initialFly: FlyState[] = [0, 1, 2].map(i => ({
            id: i,
            left: cx - 77,
            top: cy - 107,
            opacity: 0,
            transform: 'scale(0.82) rotate(0deg)',
            transition: 'none'
        }));
        setFlyingCards(initialFly);

        // Sequence animation
        const targets = [
            { dx: -180, dy: -130, rot: -30 },
            { dx: 0, dy: -160, rot: 0 },
            { dx: 180, dy: -130, rot: 30 },
        ];

        targets.forEach((t, i) => {
            // First jump out
            setTimeout(() => {
                setFlyingCards(prev => prev.map(f => f.id === i ? {
                    ...f,
                    opacity: 1,
                    transform: 'scale(1) rotate(0deg)',
                    transition: 'opacity 0.22s ease, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)'
                } : f));

                // Then zoom to target and fade
                setTimeout(() => {
                    setFlyingCards(prev => prev.map(f => f.id === i ? {
                        ...f,
                        opacity: 0,
                        transform: `translate(${t.dx}px, ${t.dy}px) rotate(${t.rot}deg) scale(0.7)`,
                        transition: 'opacity 0.3s ease 0.1s, transform 0.55s cubic-bezier(0.4, 0, 0.6, 1)'
                    } : f));
                }, 100 + i * 80);
            }, i * 90);
        });

        setTimeout(() => {
            setPhase('fan');
            setFlyingCards([]);
        }, 750);
    };

    const handleReset = () => {
        setPhase('deck');
        setActive(2);
    };

    const onTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        isDragging.current = false;
    };

    const onTouchMove = (e: React.TouchEvent) => {
        if (Math.abs(e.touches[0].clientX - touchStartX.current) > 8)
            isDragging.current = true;
    };

    const onTouchEnd = (e: React.TouchEvent) => {
        if (!isDragging.current) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(dx) > 40)
            setActive(prev => Math.max(0, Math.min(4, prev + (dx < 0 ? 1 : -1))));
    };

    const triggerCardAction = (idx: number) => {
        if (idx === 3) setShowDeckModal(true);
        else if (idx === 2) setShowCheckIn(true);
        else CARDS[idx].action(navigate);
    };

    const getCardStyle = (index: number, activeIdx: number): React.CSSProperties => {
        const isActive = index === activeIdx;
        const diff = index - activeIdx;
        const angle = ANGLES[index] - ANGLES[activeIdx];
        
        return {
            transform: `rotate(${angle}deg) translateY(${isActive ? -20 : 15}px) scale(${isActive ? 1.05 : 0.85})`,
            zIndex: isActive ? 10 : 5 - Math.abs(diff),
            transition: 'transform 0.45s cubic-bezier(0.4,0,0.2,1), box-shadow 0.35s ease, opacity 0.35s ease',
        };
    };

    return (
        <div className="fan-root">
            {/* ── FLYING CARDS ── */}
            <div className="fan-fly-zone">
                {flyingCards.map(f => (
                    <div 
                        key={f.id} 
                        className="fan-fly-card" 
                        style={{
                            left: f.left,
                            top: f.top,
                            opacity: f.opacity,
                            transform: f.transform,
                            transition: f.transition
                        }}
                    />
                ))}
            </div>

            {/* ── PHASE: DECK ── */}
            <div className={`fan-deck-wrap ${phase !== 'deck' ? 'fan-deck-gone' : ''}`}>
                <button ref={deckRef} className="fan-deck" onClick={handleDeal} aria-label="Distribuir cartas">
                    <div className="fan-dlayer" />
                    <div className="fan-dlayer" />
                    <div className="fan-dlayer">
                        <div className="fan-dface">
                            <span className="fan-dlogo">⚡</span>
                            <span className="fan-dsub">{user ? 'GESTÃO' : 'ENTRAR'}</span>
                        </div>
                    </div>
                </button>
                <p className="fan-deck-sub">Compre uma carta <span className="fan-sparkle">✨</span></p>
            </div>

            {/* ── PHASE: FAN ── */}
            <div className={`fan-stage-wrap ${phase === 'fan' ? 'fan-stage-visible' : ''}`}>
                <div
                    className="fan-stage"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    {CARDS.map((card, i) => (
                        <div
                            key={i}
                            className={`fan-card ${card.colorClass} ${i === active ? 'fan-card-active' : ''}`}
                            style={getCardStyle(i, active)}
                            onClick={() => {
                                if (i === active) triggerCardAction(i);
                                else setActive(i);
                            }}
                            role="button"
                            tabIndex={0}
                        >
                            {/* VERSO */}
                            <div className="fan-card-back" />

                            {/* FRENTE */}
                            <div className="fan-card-front">
                                <div className="fan-hero">
                                    <span className="fan-icon">{card.icon}</span>
                                </div>
                                <div className="fan-body">
                                    <div className="fan-tag">{card.tags[0]}</div>
                                    <div className="fan-title">{card.title}</div>
                                    <div className="fan-line" />
                                    <div className="fan-text">{card.body}</div>
                                    
                                    {i === 3 && active === i && (
                                        <div className="flex gap-2 mt-2 w-full">
                                            <a href="https://scryfall.com" target="_blank" rel="noreferrer" className="flex-1 text-[8px] py-1 border border-white/10 rounded-lg bg-white/5">Scryfall</a>
                                            <a href="https://ligamagic.com.br" target="_blank" rel="noreferrer" className="flex-1 text-[8px] py-1 border border-white/10 rounded-lg bg-white/5">LigaMagic</a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="fan-dots">
                    {CARDS.map((_, i) => (
                        <button
                            key={i}
                            className={`fan-dot ${i === active ? 'fan-dot-on' : ''}`}
                            onClick={() => setActive(i)}
                        />
                    ))}
                </div>

                <p className="fan-swipe-hint">← DESLIZE AS CARTAS →</p>

                <button className="fan-reset-btn" onClick={handleReset}>
                    ↺ EMBARALHAR NOVAMENTE
                </button>
            </div>

            <CheckInModal 
                isOpen={showCheckIn} 
                onClose={() => setShowCheckIn(false)} 
            />

            <DeckSelectionModal 
                isOpen={showDeckModal}
                onClose={() => setShowDeckModal(false)}
            />

            <AuthModal 
                isOpen={showAuth}
                onClose={() => setShowAuth(false)}
                onSuccess={handleDeal}
            />
        </div>
    );
};
