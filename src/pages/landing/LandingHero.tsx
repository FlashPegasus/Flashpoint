import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/authStore';
import CheckInModal from '../../components/modals/CheckInModal';
import DeckSelectionModal from '../../components/modals/DeckSelectionModal';

// ── Feature card data ──────────────────────────────────────────────────────
const CARDS = [
    {
        rank: '', suit: '', colorClass: 'lp-card-0',
        icon: '🏆', title: <>Torneios<br />ao Vivo</>,
        body: 'Brackets em tempo real e resultados instantâneos. Encontre eventos perto de você.',
        tags: ['Live', 'Discover', 'Swiss'],
        action: (nav: any) => nav('/discover')
    },
    {
        rank: '', suit: '', colorClass: 'lp-card-1',
        icon: '👑', title: <>Ranking<br />Global</>,
        body: 'O Panteão das Lendas. Veja quem domina o meta e suba no ranking ELO.',
        tags: ['ELO', 'Pódio', 'Stats'],
        action: (nav: any) => nav('/ranking')
    },
    {
        rank: '', suit: '', colorClass: 'lp-card-2',
        icon: '⚡', title: <>Check-in<br />Rápido</>,
        body: 'Entrada instantânea em torneios via código. Sem filas, sem complicações.',
        tags: ['Quick', 'Manual', 'Easy'],
        action: (setModal: any) => setModal(true)
    },
    {
        rank: '', suit: '', colorClass: 'lp-card-3',
        icon: '🃏', title: <>Decks &<br />Scryfall</>,
        body: 'Consulte cards em alta definição. Integração direta com Scryfall e LigaMagic.',
        tags: ['Cards', 'TCG', 'Search'],
        action: (setModal: any) => setModal(true)
    },
    {
        rank: '', suit: '', colorClass: 'lp-card-4',
        icon: '🔥', title: <>Ligas &<br />Comunidade</>,
        body: 'Crie sua própria liga ou junte-se a uma existente. O coração social do FlashPoint.',
        tags: ['Sociável', 'Ligas', 'XP'],
        action: (nav: any) => nav('/leagues')
    },
];

// ── Base rotations matching CSS staircase ──────────────────────────────────
const ROTATIONS = [-8, -4, 0, 4, 8];

const LandingHero: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const handRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [activeIdx, setActiveIdx] = useState<number | null>(null);
    const [isShuffling, setIsShuffling] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [showCheckIn, setShowCheckIn] = useState(false);
    const [showDeckModal, setShowDeckModal] = useState(false);
    const deckTopRef = useRef<HTMLDivElement>(null);

    // ── Execute action logic ───────────────────────────────────────────
    const triggerAction = useCallback((idx: number) => {
        const card = CARDS[idx];
        if (idx === 3) setShowDeckModal(true);
        else if (idx === 2) card.action(setShowCheckIn);
        else card.action(navigate);
    }, [navigate]);

    // ── Card selection with shuffle animation ──────────────────────────
    const selectCard = useCallback((clickedIdx: number) => {
        if (isShuffling) return;

        const isMobile = window.innerWidth <= 768;
        
        // On PC, if hovering handles expansion, click should trigger action immediately
        if (!isMobile) {
            triggerAction(clickedIdx);
            return;
        }

        // On mobile, if already active, trigger action immediately
        if (activeIdx === clickedIdx) {
            triggerAction(clickedIdx);
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
    }, [isShuffling, activeIdx, triggerAction]);

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
            if (top) top.classList.remove('lp-drawing');
            setIsDrawing(false);
            if (user) {
                navigate('/my-area');
            } else {
                navigate('/login');
            }
        }, 680);
    };

    return (
        <>
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
                                <div className="lp-holographic"></div>
                                <div className="lp-edge-glow"></div>
                                <div className="lp-card-icon-wrap">{card.icon}</div>
                                <div className="lp-card-title">{card.title}</div>
                                <div className="lp-card-divider"></div>
                                <div className="lp-card-body">{card.body}</div>
                                
                                {idx === 3 ? (
                                    <div className="flex gap-2 mt-4 relative z-20 group-[.lp-active]:opacity-100 group-[.lp-active]:translate-y-0 opacity-0 translate-y-4 transition-all duration-300">
                                        <a href="https://scryfall.com" target="_blank" rel="noreferrer" className="flex-1 text-center px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 active:scale-95 transition-all">Scryfall</a>
                                        <a href="https://www.ligamagic.com.br" target="_blank" rel="noreferrer" className="flex-1 text-center px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 active:scale-95 transition-all">LigaMagic</a>
                                    </div>
                                ) : (
                                    <button 
                                        className="mt-6 px-6 py-3 bg-accent-primary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl opacity-0 group-[.lp-active]:opacity-100 transition-all active:scale-95 shadow-glow"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            triggerAction(idx);
                                        }}
                                    >
                                        Explorar Arena
                                    </button>
                                )}

                                <div className="lp-card-tags">
                                    {card.tags.map(t => (
                                        <span key={t} className="lp-ctag">{t}</span>
                                    ))}
                                </div>
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
                        <div className="lp-deck-symbol">
                            <span>⚡</span>
                            <small>{user ? 'Gestão' : 'Entrar'}</small>
                        </div>
                    </div>
                    <div className="lp-deck-label">Comprar carta</div>
                </div>
            </div>

            <CheckInModal 
                isOpen={showCheckIn} 
                onClose={() => setShowCheckIn(false)} 
            />

            <DeckSelectionModal 
                isOpen={showDeckModal}
                onClose={() => setShowDeckModal(false)}
            />
        </>
    );
};

export default LandingHero;
