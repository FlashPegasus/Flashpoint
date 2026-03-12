import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdPlaceholder from '../../components/ui/AdPlaceholder';

// ── Feature card data ──────────────────────────────────────────────────────
const CARDS = [
    {
        rank: 'A', suit: '♠', colorClass: 'lp-card-0',
        icon: '🏆', title: <>Torneios<br />ao Vivo</>,
        body: 'Swiss automático ou mata-mata customizável. Brackets visuais em tempo real com resultados instantâneos.',
        tags: ['Swiss', 'Bracket', 'Live'],
    },
    {
        rank: 'K', suit: '♦', colorClass: 'lp-card-1',
        icon: '👑', title: <>Ranking<br />Global</>,
        body: 'Pódio visual animado para Top 3. ELO por temporada, perfil público e histórico de batalhas.',
        tags: ['ELO', 'Pódio', 'Perfil'],
    },
    {
        rank: 'Q', suit: '♥', colorClass: 'lp-card-2',
        icon: '✈️', title: <>Check-in<br />Rápido</>,
        body: 'Inscrição guiada passo a passo. Confirmação visual e notificações automáticas antes da rodada.',
        tags: ['Steps', 'Notif', 'Mobile'],
    },
    {
        rank: 'J', suit: '♣', colorClass: 'lp-card-3',
        icon: '🃏', title: <>Decks &<br />Scryfall</>,
        body: 'Cartas de Magic e Commander via Scryfall API em alta resolução. Zero custo de armazenamento.',
        tags: ['Scryfall', 'Commander', 'API'],
    },
    {
        rank: '10', suit: '♠', colorClass: 'lp-card-4',
        icon: '🔥', title: <>Streaks &<br />Stats</>,
        body: 'Sequência de vitórias com indicadores pulsantes. Winrate por formato e conquistas desbloqueáveis.',
        tags: ['Streak', 'Winrate', 'XP'],
    },
];

// ── Base rotations matching CSS staircase ──────────────────────────────────
const ROTATIONS = [-8, -4, 0, 4, 8];

const LandingHero: React.FC = () => {
    const navigate = useNavigate();
    const handRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [activeIdx, setActiveIdx] = useState<number | null>(null);
    const [isShuffling, setIsShuffling] = useState(false);
    const [deckCount, setDeckCount] = useState(40);
    const [isDrawing, setIsDrawing] = useState(false);
    const deckTopRef = useRef<HTMLDivElement>(null);

    // ── Card selection with shuffle animation ──────────────────────────
    const selectCard = useCallback((clickedIdx: number) => {
        if (isShuffling) return;

        // Deselect if clicking active card
        if (activeIdx === clickedIdx) {
            setActiveIdx(null);
            return;
        }

        setIsShuffling(true);
        setActiveIdx(null); // clear previous active while shuffling

        // Apply shuffle classes to siblings
        cardRefs.current.forEach((card, i) => {
            if (!card || i === clickedIdx) return;
            card.classList.remove('lp-shuffle-l', 'lp-shuffle-r');
            void card.offsetWidth; // force reflow
            card.classList.add(i < clickedIdx ? 'lp-shuffle-l' : 'lp-shuffle-r');
        });

        // Pop animation on clicked card
        setTimeout(() => {
            cardRefs.current.forEach(c => {
                if (c) c.classList.remove('lp-shuffle-l', 'lp-shuffle-r');
            });
            const clickedCard = cardRefs.current[clickedIdx];
            if (clickedCard) {
                clickedCard.classList.add('lp-shuffle-pop');
                setTimeout(() => {
                    if (clickedCard) clickedCard.classList.remove('lp-shuffle-pop');
                    setActiveIdx(clickedIdx);
                    setIsShuffling(false);
                }, 380);
            } else {
                setIsShuffling(false);
            }
        }, 520);
    }, [isShuffling, activeIdx]);

    // ── Parallax on hover ────────────────────────────────────────────────
    useEffect(() => {
        const cleanups: (() => void)[] = [];

        cardRefs.current.forEach((card) => {
            if (!card) return;
            const inner = card.querySelector<HTMLDivElement>('.lp-card-inner');
            if (!inner) return;

            const onMove = (e: MouseEvent) => {
                if (card.classList.contains('lp-active')) return;
                const r = card.getBoundingClientRect();
                const dx = ((e.clientX - r.left) / r.width - 0.5) * 16;
                const dy = ((e.clientY - r.top) / r.height - 0.5) * 16;
                inner.style.transform = `perspective(500px) rotateY(${dx}deg) rotateX(${-dy}deg)`;
            };
            const onLeave = () => { inner.style.transform = ''; };

            card.addEventListener('mousemove', onMove);
            card.addEventListener('mouseleave', onLeave);
            cleanups.push(() => {
                card.removeEventListener('mousemove', onMove);
                card.removeEventListener('mouseleave', onLeave);
            });
        });

        return () => cleanups.forEach(fn => fn());
    }, []); // only attach once on mount

    // ── Click outside to deselect ───────────────────────────────────────
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (isShuffling) return;
            const target = e.target as HTMLElement;
            if (!target.closest('.lp-feature-card') && !target.closest('.lp-deck-top')) {
                setActiveIdx(null);
            }
        };
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, [isShuffling]);

    // ── Deck draw → navigate to /login ──────────────────────────────────
    const handleDeckDraw = () => {
        if (isDrawing) return;
        setIsDrawing(true);
        const top = deckTopRef.current;
        if (top) top.classList.add('lp-drawing');

        setTimeout(() => {
            setDeckCount(prev => Math.max(0, prev - 1));
            if (top) top.classList.remove('lp-drawing');
            setIsDrawing(false);
            navigate('/login');
        }, 680);
    };

    return (
        <>
            {/* Static background layers */}
            <div className="landing-bg-mesh" aria-hidden="true" />
            <div className="landing-grid-lines" aria-hidden="true" />

            {/* ── HERO TEXT ── */}
            <section className="lp-hero">
                <h1 style={{ animation: 'lp-fadeDown 0.7s 0.07s ease both' }}>
                    <span className="line1">Sua Arena de</span>
                    <span className="line2">Trading Cards</span>
                </h1>
                <p className="lp-hero-sub">
                    Gerencie torneios, domine ligas e acompanhe seu ranking — feito para jogadores sérios.
                </p>
            </section>

            {/* ── SCENE ── */}
            <div className="lp-scene">

                {/* HAND */}
                <div
                    className={`lp-card-hand${activeIdx !== null ? ' lp-has-active' : ''}`}
                    ref={handRef}
                >
                    {CARDS.map((card, idx) => (
                        <div
                            key={idx}
                            ref={el => { cardRefs.current[idx] = el; }}
                            className={[
                                'lp-feature-card',
                                card.colorClass,
                                activeIdx === idx ? 'lp-active' : '',
                            ].join(' ')}
                            style={{ '--r': `${ROTATIONS[idx]}deg` } as React.CSSProperties}
                            onClick={() => selectCard(idx)}
                            role="button"
                            tabIndex={0}
                            aria-label={`Feature card ${idx + 1}`}
                        >
                            <div className="lp-card-inner">
                                <div className="lp-card-rank">{card.rank}</div>
                                <div className="lp-card-icon-wrap">{card.icon}</div>
                                <div className="lp-card-title">{card.title}</div>
                                <div className="lp-card-body">{card.body}</div>
                                <div className="lp-card-tags">
                                    {card.tags.map(t => (
                                        <span key={t} className="lp-ctag">{t}</span>
                                    ))}
                                </div>
                                <div className="lp-card-suit">{card.suit}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* DECK */}
                <div className="lp-deck-zone">
                    <div className="lp-deck-card" />
                    <div className="lp-deck-card" />
                    <div className="lp-deck-card" />
                    <div className="lp-deck-card" />
                    <div
                        className="lp-deck-top"
                        ref={deckTopRef}
                        onClick={handleDeckDraw}
                        role="button"
                        tabIndex={0}
                        aria-label="Entrar no jogo"
                    >
                        <div className="lp-deck-count">{deckCount}</div>
                        <div className="lp-deck-symbol">
                            <span>⚡</span>
                            <small>Entrar</small>
                        </div>
                    </div>
                    <div className="lp-deck-label">Comprar carta</div>
                </div>
 
                <AdPlaceholder className="lp-hero-ad" />
 
            </div>
        </>
    );
};

export default LandingHero;
