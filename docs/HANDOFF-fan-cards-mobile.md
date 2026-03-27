# HANDOFF — Feature Cards Mobile (Leque / Fan Carousel)

**Projeto:** FlashPoint (`flashpoint-anti.web.app`)  
**Stack:** React + TypeScript + Vite + Tailwind CSS v4 + Firebase  
**Data:** 2026-03-26  
**Aplica em:** Landing page (`/`) — seção de feature cards  

---

## Contexto

A seção de feature cards da landing page usava efeito **hover foil holográfico** — ótimo em desktop, mas sem impacto real em mobile (touch). O objetivo desta mudança é adicionar uma experiência mobile-first: ao tocar no baralho, as cartas saem em animação e se dispõem em **leque na mão**, igual a segurar cartas de TCG. Em desktop o comportamento atual (hover foil) é **mantido intacto**.

---

## Ordem de aplicação

```
1. Instalar dependências (nenhuma nova)
2. Criar hook  → src/hooks/useMobile.ts
3. Editar CSS  → src/styles/tokens.css  (adicionar tokens de carta)
4. Criar comp  → src/components/FanCards.tsx
5. Editar page → src/pages/Home.tsx  (ou onde estiver a seção de features)
```

> **Regra do projeto:** CSS antes de TSX. Não inverter a ordem.

---

## 1. Hook `useMobile.ts`

Cria se ainda não existir. Detecta touch para alternar comportamento.

```ts
// src/hooks/useMobile.ts
import { useEffect, useState } from 'react';

export function useMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth < breakpoint
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [breakpoint]);

  return isMobile;
}
```

---

## 2. Tokens CSS

Adicionar ao final de `src/styles/tokens.css`:

```css
/* ── Feature Card Fan (mobile) ── */
--fan-card-w: 200px;
--fan-card-h: 280px;
--fan-angle-side: 22deg;
--fan-rise-active: -18px;
--fan-scale-side: 0.88;
--fan-transition: 0.45s cubic-bezier(0.4, 0, 0.2, 1);
```

---

## 3. Componente `FanCards.tsx`

Criar em `src/components/FanCards.tsx`.

### Dados das cartas

```ts
const CARDS = [
  {
    id: 'torneios',
    pip: 'T',
    suit: '◆',
    tag: 'GESTÃO COMPLETA',
    title: 'TORNEIOS',
    icon: '⚔️',
    text: 'Suíço, mata-mata e Commander. Pares e resultados em tempo real para todos os jogadores.',
  },
  {
    id: 'ligas',
    pip: 'L',
    suit: '♠',
    tag: 'TEMPORADAS & RANKING',
    title: 'LIGAS',
    icon: '🏆',
    text: 'Pontuação acumulada e ranking atualizado automaticamente após cada torneio.',
  },
  {
    id: 'dashboard',
    pip: 'D',
    suit: '♥',
    tag: 'STATS AO VIVO',
    title: 'DASHBOARD',
    icon: '📊',
    text: 'Acompanhe rodadas, matchups e classificação geral instantaneamente.',
  },
];
```

### Lógica de ângulo do leque

```ts
// ângulos de repouso por índice (0 = esquerda, 1 = centro, 2 = direita)
const ANGLES = [-22, 0, 22];

function getCardStyle(index: number, active: number): React.CSSProperties {
  const isActive = index === active;
  return {
    transform: `rotate(${ANGLES[index]}deg) translateY(${isActive ? -18 : 10}px) scale(${isActive ? 1 : 0.88})`,
    zIndex: isActive ? 10 : index === 1 ? 3 : 1,
    boxShadow: isActive
      ? '0 18px 50px rgba(192,57,43,.5), 0 0 0 1px rgba(231,76,60,.3)'
      : '0 4px 14px rgba(0,0,0,.6)',
    transition: 'transform 0.45s cubic-bezier(0.4,0,0.2,1), box-shadow 0.35s ease, opacity 0.35s ease',
  };
}
```

### JSX completo

```tsx
import { useState, useRef } from 'react';

type Phase = 'deck' | 'dealing' | 'fan';

export function FanCards() {
  const [phase, setPhase] = useState<Phase>('deck');
  const [active, setActive] = useState(1); // começa na carta central
  const touchStartX = useRef(0);
  const isDragging  = useRef(false);

  /* ── Deal ── */
  function handleDeal() {
    if (phase !== 'deck') return;
    setPhase('dealing');
    setTimeout(() => setPhase('fan'), 680);
  }

  /* ── Reset ── */
  function handleReset() {
    setPhase('deck');
    setActive(1);
  }

  /* ── Swipe ── */
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    isDragging.current  = false;
  }
  function onTouchMove(e: React.TouchEvent) {
    if (Math.abs(e.touches[0].clientX - touchStartX.current) > 8)
      isDragging.current = true;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (!isDragging.current) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40)
      setActive(prev => Math.max(0, Math.min(2, prev + (dx < 0 ? 1 : -1))));
  }

  return (
    <div className="fan-root">

      {/* ── PHASE: DECK ── */}
      <div
        className={`fan-deck-wrap ${phase !== 'deck' ? 'fan-deck-gone' : ''}`}
        aria-hidden={phase !== 'deck'}
      >
        <button className="fan-deck" onClick={handleDeal} aria-label="Distribuir cartas">
          <div className="fan-dlayer" />
          <div className="fan-dlayer" />
          <div className="fan-dlayer">
            <div className="fan-dface">
              <span className="fan-dlogo">FP</span>
              <span className="fan-dsub">FLASHPOINT</span>
              <span className="fan-dhint">▶ TOQUE PARA VER</span>
            </div>
          </div>
        </button>
        <p className="fan-deck-sub">Descubra as funcionalidades</p>
      </div>

      {/* ── PHASE: FAN ── */}
      <div
        className={`fan-stage-wrap ${phase === 'fan' ? 'fan-stage-visible' : ''}`}
        aria-hidden={phase !== 'fan'}
      >
        {/* Leque */}
        <div
          className="fan-stage"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {CARDS.map((card, i) => (
            <div
              key={card.id}
              className={`fan-card ${i === active ? 'fan-card-active' : ''}`}
              style={getCardStyle(i, active)}
              onClick={() => setActive(i)}
              role="button"
              tabIndex={0}
              aria-label={`Ver ${card.title}`}
            >
              {/* VERSO */}
              <div className="fan-card-back" />

              {/* FRENTE */}
              <div className="fan-card-front">
                <div className="fan-pip fan-pip-tl">
                  <span className="fan-pip-num">{card.pip}</span>
                  <span className="fan-pip-suit">{card.suit}</span>
                </div>
                <div className="fan-pip fan-pip-br">
                  <span className="fan-pip-num">{card.pip}</span>
                  <span className="fan-pip-suit">{card.suit}</span>
                </div>
                <div className="fan-hero">
                  <span className="fan-icon">{card.icon}</span>
                </div>
                <div className="fan-body">
                  <div className="fan-tag">{card.tag}</div>
                  <div className="fan-title">{card.title}</div>
                  <div className="fan-line" />
                  <div className="fan-text">{card.text}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="fan-dots" role="tablist">
          {CARDS.map((_, i) => (
            <button
              key={i}
              className={`fan-dot ${i === active ? 'fan-dot-on' : ''}`}
              onClick={() => setActive(i)}
              aria-label={`Carta ${i + 1}`}
              role="tab"
              aria-selected={i === active}
            />
          ))}
        </div>

        <p className="fan-swipe-hint">← DESLIZE AS CARTAS →</p>

        <button className="fan-reset-btn" onClick={handleReset}>
          ↺ BARALHAR NOVAMENTE
        </button>
      </div>

    </div>
  );
}
```

---

## 4. CSS das classes (adicionar em `src/index.css` ou módulo dedicado)

```css
/* ════════════════════════════════════════
   FAN CARDS — Mobile Feature Section
   Só ativo em mobile (max-width: 767px).
   Desktop mantém o comportamento atual.
════════════════════════════════════════ */

@media (max-width: 767px) {

  .fan-root {
    position: relative;
    width: 100%;
    overflow: hidden;
  }

  /* ── DECK PHASE ── */
  .fan-deck-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2.5rem 1rem 3rem;
    transition: opacity .35s ease, transform .4s ease;
  }
  .fan-deck-wrap.fan-deck-gone {
    opacity: 0;
    transform: scale(.88);
    pointer-events: none;
    position: absolute;
    width: 100%;
  }

  .fan-deck {
    position: relative;
    width: 155px; height: 215px;
    background: transparent;
    border: none;
    cursor: pointer;
    margin-bottom: 1.4rem;
    -webkit-tap-highlight-color: transparent;
  }
  .fan-deck:active { transform: scale(.97); }

  .fan-dlayer {
    position: absolute; inset: 0;
    border-radius: 12px;
    background: linear-gradient(145deg, #1a0a0f 0%, #2d1018 40%, #1a0a0f 100%);
    border: 2px solid rgba(192,57,43,.45);
  }
  .fan-dlayer:nth-child(1) { transform: translate(-7px,-7px) rotate(-5deg); opacity:.7; }
  .fan-dlayer:nth-child(2) { transform: translate(-3px,-3px) rotate(-2deg); opacity:.85; }
  .fan-dlayer:nth-child(3) { transform: none; }

  .fan-dlayer::before {
    content: '';
    position: absolute; inset: 6px;
    border-radius: 8px;
    border: 1px solid rgba(192,57,43,.3);
  }
  .fan-dlayer::after {
    content: '';
    position: absolute; inset: 10px;
    border-radius: 5px;
    background:
      repeating-linear-gradient(45deg,  rgba(192,57,43,.06) 0,rgba(192,57,43,.06) 1px, transparent 1px, transparent 9px),
      repeating-linear-gradient(-45deg, rgba(192,57,43,.06) 0,rgba(192,57,43,.06) 1px, transparent 1px, transparent 9px);
  }

  .fan-dface {
    position: absolute; inset: 0;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    z-index: 2; gap: .35rem;
  }
  .fan-dlogo  { font-family: 'Cinzel', serif; font-size: 1.4rem; font-weight: 900; color: #e74c3c; letter-spacing: .2em; text-shadow: 0 0 18px rgba(231,76,60,.6); }
  .fan-dsub   { font-size: .56rem; color: rgba(240,230,230,.22); letter-spacing: .26em; }
  .fan-dhint  { font-size: .65rem; color: rgba(231,76,60,.65); letter-spacing: .1em; margin-top: .5rem; animation: fan-pulse 2s ease-in-out infinite; }
  .fan-deck-sub { font-size: .78rem; color: #b89090; font-style: italic; }

  @keyframes fan-pulse { 0%,100%{opacity:.4} 50%{opacity:1} }

  /* ── FAN PHASE ── */
  .fan-stage-wrap {
    display: none;
    flex-direction: column;
    align-items: center;
    opacity: 0;
    transform: translateY(24px);
    transition: opacity .5s ease, transform .5s ease;
    padding-bottom: 2.5rem;
  }
  .fan-stage-wrap.fan-stage-visible {
    display: flex;
    opacity: 1;
    transform: none;
  }

  .fan-stage {
    position: relative;
    width: 100%;
    height: 360px;
    overflow: hidden;
    touch-action: pan-y;
  }

  /* Cards — pivot at bottom center */
  .fan-card {
    position: absolute;
    width: 200px; height: 280px;
    border-radius: 14px;
    transform-origin: 50% 100%;
    left: calc(50% - 100px);
    bottom: 0;
    will-change: transform;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
  }

  /* VERSO */
  .fan-card-back {
    position: absolute; inset: 0;
    border-radius: 14px;
    background: linear-gradient(150deg, #1a0a0f 0%, #2d1018 45%, #1a0a0f 100%);
    border: 2px solid rgba(192,57,43,.35);
    transition: opacity .35s ease;
  }
  .fan-card-back::before {
    content: '';
    position: absolute; inset: 7px;
    border-radius: 10px;
    border: 1px solid rgba(192,57,43,.22);
  }
  .fan-card-back::after {
    content: '';
    position: absolute; inset: 12px;
    border-radius: 7px;
    background:
      repeating-linear-gradient(45deg,  rgba(192,57,43,.05) 0,rgba(192,57,43,.05) 1px, transparent 1px, transparent 10px),
      repeating-linear-gradient(-45deg, rgba(192,57,43,.05) 0,rgba(192,57,43,.05) 1px, transparent 1px, transparent 10px);
  }

  /* FRENTE */
  .fan-card-front {
    position: absolute; inset: 0;
    border-radius: 14px;
    background: linear-gradient(160deg, #160b0e 0%, #200f14 55%, #130a0c 100%);
    border: 2px solid rgba(192,57,43,.5);
    opacity: 0;
    transition: opacity .35s ease;
    overflow: hidden;
    display: flex; flex-direction: column;
  }
  .fan-card-front::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(115deg,
      transparent 20%,
      rgba(212,172,13,.07) 38%,
      rgba(231,76,60,.13) 47%,
      rgba(212,172,13,.07) 56%,
      transparent 72%);
    pointer-events: none;
  }

  /* Flip frente/verso */
  .fan-card-active .fan-card-front { opacity: 1; }
  .fan-card-active .fan-card-back  { opacity: 0; }

  /* Pips */
  .fan-pip { position: absolute; display: flex; flex-direction: column; align-items: center; line-height: 1; }
  .fan-pip-tl { top: 9px; left: 11px; }
  .fan-pip-br { bottom: 9px; right: 11px; transform: rotate(180deg); }
  .fan-pip-num  { font-family: 'Cinzel', serif; font-size: .8rem; font-weight: 900; color: #e74c3c; }
  .fan-pip-suit { font-size: .72rem; color: #e74c3c; margin-top: -.1rem; }

  /* Hero */
  .fan-hero {
    flex: 1;
    display: flex; align-items: center; justify-content: center;
    border-bottom: 1px solid rgba(192,57,43,.1);
    background: radial-gradient(ellipse 55% 60% at 50% 50%, rgba(192,57,43,.12) 0%, transparent 70%);
    position: relative; overflow: hidden;
  }
  .fan-hero::after {
    content: '';
    position: absolute; inset: 0;
    background:
      repeating-linear-gradient(45deg,  rgba(192,57,43,.02) 0,rgba(192,57,43,.02) 1px, transparent 1px, transparent 14px),
      repeating-linear-gradient(-45deg, rgba(192,57,43,.02) 0,rgba(192,57,43,.02) 1px, transparent 1px, transparent 14px);
  }
  .fan-icon { font-size: 3rem; z-index: 1; }

  /* Body */
  .fan-body  { padding: .9rem 1rem 1rem; }
  .fan-tag   { font-size: .56rem; letter-spacing: .16em; color: rgba(212,172,13,.55); font-family: 'Cinzel', serif; }
  .fan-title { font-family: 'Cinzel', serif; font-size: 1.05rem; font-weight: 900; color: #e74c3c; letter-spacing: .1em; margin-top: .2rem; text-shadow: 0 0 14px rgba(231,76,60,.35); }
  .fan-line  { height: 1px; background: linear-gradient(to right, rgba(192,57,43,.3), transparent); margin: .7rem 0; }
  .fan-text  { font-size: .82rem; color: #b89090; line-height: 1.6; }

  /* Dots */
  .fan-dots { display: flex; gap: .6rem; margin-top: .8rem; }
  .fan-dot  {
    width: 7px; height: 7px; border-radius: 50%;
    background: rgba(192,57,43,.22);
    border: none; cursor: pointer; padding: 0;
    transition: background .25s, transform .25s;
    -webkit-tap-highlight-color: transparent;
  }
  .fan-dot-on { background: #e74c3c; transform: scale(1.4); }

  /* Hints & reset */
  .fan-swipe-hint {
    margin-top: .5rem;
    font-size: .62rem; letter-spacing: .12em;
    color: rgba(240,230,230,.18);
    animation: fan-pulse 3.5s ease-in-out infinite;
  }
  .fan-reset-btn {
    margin-top: 1.2rem;
    background: transparent;
    border: 1px solid rgba(192,57,43,.28);
    border-radius: 999px;
    padding: .5rem 1.6rem;
    color: rgba(231,76,60,.5);
    font-family: 'Cinzel', serif;
    font-size: .63rem; letter-spacing: .12em;
    cursor: pointer;
    transition: background .2s, color .2s, border-color .2s;
    -webkit-tap-highlight-color: transparent;
  }
  .fan-reset-btn:active {
    background: rgba(192,57,43,.1);
    color: #e74c3c;
    border-color: #e74c3c;
  }

} /* end @media mobile */
```

---

## 5. Onde encaixar na `Home.tsx`

Localizar a seção de feature cards existente (provavelmente algo como `<section id="features">` ou `<div className="features-grid">`).

**Em mobile**, substituir o grid atual pelo `<FanCards />`.  
**Em desktop**, manter exatamente o que está.

```tsx
import { FanCards } from '@/components/FanCards';
import { useMobile } from '@/hooks/useMobile';

// dentro do componente Home:
const isMobile = useMobile();

// na seção de features:
{isMobile ? (
  <FanCards />
) : (
  // ... seu grid de cards com hover foil existente, sem alteração
)}
```

---

## Comportamento esperado

| Situação | Resultado |
|---|---|
| Mobile, phase `deck` | Baralho empilhado com hint pulsante |
| Toque no baralho | Cartas voam em leque, transição suave |
| Phase `fan`, carta central | Frente revelada, card elevado |
| Phase `fan`, cartas laterais | Verso escuro, inclinadas, pontas visíveis |
| Toque em carta lateral | Ela avança ao centro, frente revelada |
| Swipe esquerda/direita | Navega entre cartas |
| Botão "↺ Baralhar" | Volta ao deck |
| Desktop (> 767px) | Componente `FanCards` não renderiza — comportamento original |

---

## Sem novas dependências

Nenhum pacote novo. Usa apenas React hooks nativos (`useState`, `useRef`) e CSS puro dentro do `@media` guard.

---

## Checklist Antigravity

- [ ] Criar `src/hooks/useMobile.ts`
- [ ] Adicionar tokens em `src/styles/tokens.css`
- [ ] Criar `src/components/FanCards.tsx`
- [ ] Adicionar CSS no `src/index.css` (dentro do `@media (max-width: 767px)`)
- [ ] Editar `Home.tsx` — import + condicional mobile/desktop
- [ ] Testar em viewport mobile (375px) e desktop (1280px)
- [ ] Confirmar que o hover foil desktop não foi afetado
