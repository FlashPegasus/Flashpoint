# FlashPoint — Master Handoff
## Para: Antigravity | Design Overhaul Completo
### Paleta: Rubro/Dark · Glassmorphism · Neo-Modern TCG

---

## ÍNDICE

1. [Ordem de Aplicação](#ordem)
2. [Passo 1 — CSS Base](#css)
3. [Passo 2 — Páginas TSX](#tsx)
4. [Passo 3 — Nav Bump](#nav)
5. [Passo 4 — Landing Page Cards](#cards)
6. [O que NÃO tocar](#nao-tocar)
7. [Checklist Final](#checklist)

---

## 1. ORDEM DE APLICAÇÃO {#ordem}

**Siga esta ordem exata.** CSS primeiro, TSX depois — caso contrário as classes não existem e o site quebra.

```
① tokens.css         → src/styles/tokens.css       (CRIAR pasta se não existir)
② index.css          → src/index.css                (SUBSTITUIR inteiro)
③ MyArea.tsx         → src/pages/MyArea.tsx
④ TournamentDashboard.tsx → src/pages/TournamentDashboard.tsx
⑤ Discover.tsx       → src/pages/Discover.tsx
⑥ Profile.tsx        → src/pages/Profile.tsx
⑦ LeagueDashboard.tsx → src/pages/LeagueDashboard.tsx
⑧ LeagueCreate.tsx   → src/pages/LeagueCreate.tsx
⑨ JoinTournament.tsx → src/pages/JoinTournament.tsx
⑩ JoinLeague.tsx     → src/pages/JoinLeague.tsx
⑪ Nav Bump           → src/components/layout/ (ver Passo 3)
⑫ Landing Cards      → flashpoint-landing.html (ver Passo 4)
```

---

## 2. PASSO 1 — CSS BASE {#css}

### 2a. Criar `src/styles/tokens.css`

```css
@layer base {
  :root {
    /* FUNDO */
    --fp-void:         #080406;
    --fp-surface:      #130a0a;
    --fp-card-bg:      linear-gradient(160deg, #130a0a, #1a0c0c);
    --fp-glass:        rgba(255,255,255,0.04);
    --fp-glass-mid:    rgba(19,10,10,0.88);
    --fp-glass-blur:   blur(20px) saturate(180%);

    /* BORDAS */
    --fp-border:       rgba(192,57,43,0.18);
    --fp-border-hi:    rgba(192,57,43,0.35);
    --fp-border-lo:    rgba(255,255,255,0.05);
    --fp-border-neu:   rgba(255,255,255,0.07);

    /* ACENTO PRINCIPAL — Vermelho */
    --fp-primary:      #c0392b;
    --fp-primary-hi:   #e74c3c;
    --fp-primary-lo:   rgba(192,57,43,0.15);
    --fp-primary-glow: rgba(192,57,43,0.35);

    /* ACENTO SECUNDÁRIO — Laranja */
    --fp-amber:        #e67e22;
    --fp-amber-hi:     #f39c12;
    --fp-amber-lo:     rgba(230,126,34,0.15);

    /* DOURADO — ligas / pódio */
    --fp-gold:         #d4ac0d;
    --fp-gold-hi:      #f1c40f;
    --fp-gold-lo:      rgba(212,172,13,0.15);

    /* VERDE — live / sucesso */
    --fp-emerald:      #1e8449;
    --fp-emerald-hi:   #27ae60;
    --fp-emerald-lo:   rgba(30,132,73,0.15);

    /* TEXTO */
    --fp-text:         #f0e6e6;
    --fp-text-hi:      #ffffff;
    --fp-muted:        #7a5c5c;
    --fp-subtle:       #a07070;

    /* TIPOGRAFIA */
    --fp-font-display: 'Cinzel Decorative', serif;
    --fp-font-ui:      'Outfit', sans-serif;
    --fp-font-body:    'Inter', system-ui, sans-serif;

    /* RADII */
    --fp-r-sm: 8px;  --fp-r-md: 12px;
    --fp-r-lg: 16px; --fp-r-xl: 20px;
    --fp-r-pill: 100px;

    /* SOMBRAS */
    --fp-shadow-md:      0 8px 32px rgba(0,0,0,0.6);
    --fp-shadow-lg:      0 20px 60px rgba(0,0,0,0.7);
    --fp-shadow-primary: 0 0 30px rgba(192,57,43,0.3);
    --fp-shadow-gold:    0 0 24px rgba(212,172,13,0.25);
    --fp-inner-glow:     inset 0 1px 1px rgba(255,255,255,0.06);

    /* TRANSIÇÕES */
    --fp-ease:      cubic-bezier(0.23, 1, 0.32, 1);
    --fp-ease-back: cubic-bezier(0.34, 1.56, 0.64, 1);
    --fp-duration:  0.35s;
  }
}
```

### 2b. Substituir `src/index.css` inteiro

```css
@import "tailwindcss";
@import "./styles/tokens.css";
@import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Outfit:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');

@theme {
  --color-blue:   #0ea5e9;
  --color-red:    #ef4444;
  --color-green:  #22c55e;
  --color-gold:   #f59e0b;
  --color-purple: #8b5cf6;
  --bg-dark:      #080406;
  --bg-glass:     rgba(255,255,255,0.04);
  --border-glass: rgba(192,57,43,0.18);
  --font-base:    'Inter', system-ui, sans-serif;
  --font-outfit:  'Outfit', sans-serif;
  --font-display: 'Cinzel Decorative', serif;
}

@layer base {
  body {
    font-family: var(--fp-font-body);
    background-color: var(--fp-void);
    color: var(--fp-text);
    line-height: 1.6;
    min-height: 100vh;
    overflow-x: hidden;
    scrollbar-width: thin;
    scrollbar-color: rgba(192,57,43,0.3) transparent;
  }
  h1, h2, h3, h4 { font-family: var(--fp-font-display); }
  button, label, nav, .font-ui { font-family: var(--fp-font-ui); }
  ::-webkit-scrollbar       { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(192,57,43,0.3); border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--fp-primary); }
}

/* Fundo global — mesh escuro vináceo */
body::before {
  content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none;
  background-image:
    radial-gradient(circle at 0%   0%,   rgba(192,57,43,0.14) 0%, transparent 50%),
    radial-gradient(circle at 100% 100%, rgba(146,43,33,0.10)  0%, transparent 50%),
    radial-gradient(circle at 50%  50%,  rgba(19,10,10,0)      0%, rgba(8,4,6,1) 100%);
}

/* Grid sutil */
body::after {
  content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none;
  background-image:
    linear-gradient(rgba(192,57,43,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(192,57,43,0.025) 1px, transparent 1px);
  background-size: 64px 64px;
}

@layer utilities {

  /* Glass */
  .glass {
    background: var(--fp-glass);
    backdrop-filter: var(--fp-glass-blur);
    -webkit-backdrop-filter: var(--fp-glass-blur);
    border: 1px solid var(--fp-border-neu);
    box-shadow: var(--fp-inner-glow);
  }
  .glass-card {
    background: rgba(19,10,10,0.7);
    backdrop-filter: blur(16px);
    border: 1px solid var(--fp-border);
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  }

  /* fp-card */
  .fp-card {
    background: linear-gradient(160deg, #130a0a, #1a0c0c);
    backdrop-filter: blur(20px);
    border: 1px solid var(--fp-border);
    border-radius: var(--fp-r-lg);
    box-shadow: var(--fp-shadow-md);
    transition: transform var(--fp-duration) var(--fp-ease),
                border-color var(--fp-duration) var(--fp-ease),
                box-shadow var(--fp-duration) var(--fp-ease);
  }
  .fp-card:hover {
    transform: translateY(-3px);
    border-color: var(--fp-border-hi);
    box-shadow: var(--fp-shadow-lg), var(--fp-shadow-primary);
  }

  /* Botões */
  .fp-btn-primary {
    background: linear-gradient(135deg, var(--fp-primary), var(--fp-amber));
    border: none; border-radius: var(--fp-r-md);
    color: white; font-family: var(--fp-font-ui); font-weight: 700;
    cursor: pointer;
    transition: opacity 0.18s, transform 0.18s;
    box-shadow: 0 0 24px var(--fp-primary-glow);
  }
  .fp-btn-primary:hover  { opacity: 0.88; transform: translateY(-1px); }
  .fp-btn-primary:active { transform: translateY(0); }

  .fp-btn-ghost {
    background: var(--fp-glass);
    border: 1px solid var(--fp-border-hi);
    border-radius: var(--fp-r-md);
    color: var(--fp-text); font-family: var(--fp-font-ui); font-weight: 600;
    cursor: pointer;
    transition: background var(--fp-duration), border-color var(--fp-duration);
  }
  .fp-btn-ghost:hover {
    background: var(--fp-primary-lo);
    border-color: rgba(192,57,43,0.4);
  }

  /* Live dot */
  .fp-live-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--fp-emerald-hi);
    box-shadow: 0 0 8px var(--fp-emerald-hi);
    animation: livePulse 1.5s ease-in-out infinite;
  }
  @keyframes livePulse {
    0%,100% { opacity:1; transform:scale(1);   box-shadow: 0 0 8px var(--fp-emerald-hi); }
    50%      { opacity:.6; transform:scale(1.5); box-shadow: 0 0 16px var(--fp-emerald-hi); }
  }

  /* Badges */
  .fp-badge {
    display: inline-flex; align-items: center; gap: 5px;
    border-radius: var(--fp-r-pill); padding: 3px 10px;
    font-family: var(--fp-font-ui); font-size: 0.7rem;
    font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase;
  }
  .fp-badge-live     { background: var(--fp-emerald-lo); border: 1px solid rgba(30,132,73,0.3);  color: var(--fp-emerald-hi); }
  .fp-badge-upcoming { background: var(--fp-primary-lo); border: 1px solid rgba(192,57,43,0.3);  color: var(--fp-primary-hi); }
  .fp-badge-finished { background: rgba(255,255,255,0.05); border: 1px solid var(--fp-border-lo); color: var(--fp-muted); }

  /* Skeleton */
  .fp-skeleton {
    background: linear-gradient(90deg,
      rgba(255,255,255,0.04) 0%,
      rgba(255,255,255,0.08) 50%,
      rgba(255,255,255,0.04) 100%);
    background-size: 200% 100%;
    animation: skeletonShimmer 1.6s ease infinite;
    border-radius: var(--fp-r-sm);
  }
  @keyframes skeletonShimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* Gradientes de texto */
  .fp-gradient-text {
    background: linear-gradient(135deg, var(--fp-primary-hi), var(--fp-amber-hi));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .fp-gradient-text-gold {
    background: linear-gradient(135deg, var(--fp-gold), var(--fp-gold-hi));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }

  /* Animações */
  .fp-fade-in  { animation: fpFadeIn  0.5s var(--fp-ease) both; }
  .fp-slide-up { animation: fpSlideUp 0.5s var(--fp-ease) both; }
  @keyframes fpFadeIn  { from { opacity: 0; }                        to { opacity: 1; } }
  @keyframes fpSlideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

  .fp-stagger-1 { animation-delay: 0.05s; }
  .fp-stagger-2 { animation-delay: 0.10s; }
  .fp-stagger-3 { animation-delay: 0.15s; }
  .fp-stagger-4 { animation-delay: 0.20s; }
  .fp-stagger-5 { animation-delay: 0.25s; }

  .fp-bottom-safe { padding-bottom: max(env(safe-area-inset-bottom, 0px), 16px); }
}

/* Utilitários legados (mantidos para compatibilidade) */
.container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }

@keyframes float {
  0%,100% { transform: translateY(0); }
  50%      { transform: translateY(-10px); }
}
.animate-float { animation: float 6s ease-in-out infinite; }

@keyframes pulseSlow {
  0%,100% { opacity: 1; } 50% { opacity: 0.5; }
}
.animate-pulse-slow { animation: pulseSlow 4s cubic-bezier(0.4,0,0.6,1) infinite; }
```

---

## 3. PASSO 2 — PÁGINAS TSX {#tsx}

Substitua cada arquivo na pasta `src/pages/`:

| Arquivo entregue | Destino |
|---|---|
| `MyArea.tsx` | `src/pages/MyArea.tsx` |
| `TournamentDashboard.tsx` | `src/pages/TournamentDashboard.tsx` |
| `Discover.tsx` | `src/pages/Discover.tsx` |
| `Profile.tsx` | `src/pages/Profile.tsx` |
| `LeagueDashboard.tsx` | `src/pages/LeagueDashboard.tsx` |
| `LeagueCreate.tsx` | `src/pages/LeagueCreate.tsx` |
| `JoinTournament.tsx` | `src/pages/JoinTournament.tsx` |
| `JoinLeague.tsx` | `src/pages/JoinLeague.tsx` |

Nenhum import, store, hook ou lógica de negócio foi alterado. Somente o JSX visual.

---

## 4. PASSO 3 — NAV BUMP {#nav}

O componente de navegação superior precisa de três ajustes:

### 4a. Cor da pill

Localize o container principal da nav. Aplique:

```css
background: #16161f;           /* ANTES era diferente */
border: 1px solid rgba(255,255,255,0.08);
border-radius: 100px;
backdrop-filter: blur(20px);
box-shadow: 0 4px 32px rgba(0,0,0,0.6);
```

### 4b. Bump orgânico (forma SVG única)

O bump da logo deve ser uma **forma SVG única** — não dois elementos separados.
Instale o hook `useNavBump` em `src/hooks/useNavBump.ts`:

```ts
import { useEffect, useRef } from 'react';

const PILL_H = 52;
const BUMP_R = 28;
const BUMP_W = 38;
const CORNER = 26;

function buildPath(W: number, H: number, bx: number): string {
  const bumpTop = 0 - BUMP_R * 0.85;
  const bumpBot = H + BUMP_R * 0.85;
  return [
    `M ${CORNER} 0`,
    `L ${bx - BUMP_W} 0`,
    `C ${bx - BUMP_W * 0.4} 0, ${bx - BUMP_R * 0.5} ${bumpTop}, ${bx} ${bumpTop}`,
    `C ${bx + BUMP_R * 0.5} ${bumpTop}, ${bx + BUMP_W * 0.4} 0, ${bx + BUMP_W} 0`,
    `L ${W - CORNER} 0`,
    `Q ${W} 0 ${W} ${CORNER}`,
    `L ${W} ${H - CORNER}`,
    `Q ${W} ${H} ${W - CORNER} ${H}`,
    `L ${bx + BUMP_W} ${H}`,
    `C ${bx + BUMP_W * 0.4} ${H}, ${bx + BUMP_R * 0.5} ${bumpBot}, ${bx} ${bumpBot}`,
    `C ${bx - BUMP_R * 0.5} ${bumpBot}, ${bx - BUMP_W * 0.4} ${H}, ${bx - BUMP_W} ${H}`,
    `L ${CORNER} ${H}`,
    `Q 0 ${H} 0 ${H - CORNER}`,
    `L 0 ${CORNER}`,
    `Q 0 0 ${CORNER} 0 Z`,
  ].join(' ');
}

export function useNavBump(isMobile = false) {
  const navRef    = useRef<HTMLDivElement>(null);
  const svgRef    = useRef<SVGSVGElement>(null);
  const pathRef   = useRef<SVGPathElement>(null);
  const logoRef   = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function update() {
      const el = navRef.current;
      if (!el || !svgRef.current || !pathRef.current) return;
      const W   = el.offsetWidth;
      const pad = BUMP_R * 0.85;
      const bx  = isMobile ? 40 : W / 2;

      svgRef.current.setAttribute('viewBox', `0 ${-pad - 2} ${W} ${PILL_H + pad * 2 + 4}`);
      svgRef.current.setAttribute('width',  String(W));
      svgRef.current.setAttribute('height', String(PILL_H + pad * 2 + 4));
      (svgRef.current as any).style.top = `${-(pad + 2)}px`;
      pathRef.current.setAttribute('d', buildPath(W, PILL_H, bx));

      if (logoRef.current) {
        logoRef.current.style.width  = `${BUMP_R * 2}px`;
        logoRef.current.style.height = `${BUMP_R * 2}px`;
        logoRef.current.style.left   = `${bx - BUMP_R}px`;
        logoRef.current.style.top    = `${PILL_H / 2 - BUMP_R}px`;
      }
      if (spacerRef.current) spacerRef.current.style.width = `${BUMP_W * 2 + 8}px`;
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [isMobile]);

  return { navRef, svgRef, pathRef, logoRef, spacerRef };
}
```

### 4c. JSX da nav

```tsx
// No componente de nav:
const { navRef, svgRef, pathRef, logoRef, spacerRef } = useNavBump(isMobile);

<div className="nav-shape" ref={navRef} style={{ position:'relative', height:'52px', margin:'20px 0', filter:'drop-shadow(0 4px 24px rgba(0,0,0,0.7))' }}>

  <svg ref={svgRef} style={{ position:'absolute', overflow:'visible' }}>
    <path ref={pathRef} fill="#16161f" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
  </svg>

  {/* Logo no bump */}
  <div ref={logoRef} style={{ position:'absolute', zIndex:5, display:'flex', alignItems:'center', justifyContent:'center' }}>
    <img src="/logo.png" style={{ width:'40px', height:'40px', borderRadius:'50%', objectFit:'contain' }} alt="FlashPoint" />
  </div>

  {/* Conteúdo */}
  <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', padding:'0 12px', gap:'4px' }}>
    {/* itens da esquerda */}
    <div ref={spacerRef} style={{ flexShrink:0 }} /> {/* reserva espaço da logo */}
    {/* itens da direita */}
  </div>
</div>
```

---

## 5. PASSO 4 — LANDING PAGE CARDS {#cards}

No arquivo `flashpoint-landing.html`, aplique as mudanças abaixo.

### 5a. HTML — remover de TODAS as 5 cartas

```html
<!-- APAGAR estas duas linhas em cada .feature-card: -->
<div class="card-rank">A</div>   <!-- ou K, Q, J, 10 -->
<div class="card-suit">♠</div>   <!-- ou ♦, ♥, ♣ -->
```

### 5b. HTML — adicionar em CADA carta (dentro de `.card-inner`, como primeiros filhos)

```html
<div class="edge-glow"></div>
<div class="corner corner-tl"></div>
<div class="corner corner-tr"></div>
<div class="corner corner-bl"></div>
<div class="corner corner-br"></div>
<div class="card-divider"></div>  <!-- entre .card-title e .card-body -->
```

### 5c. CSS — substituir estilos das cartas

```css
/* Remover: .card-rank { ... } e .card-suit { ... } */

.card-inner {
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,0.12);
  background: linear-gradient(160deg, #0d0b1e 0%, #111028 40%, #0a0d1e 100%);
  backdrop-filter: blur(28px);
  padding: 20px 14px 16px;
  position: relative; overflow: hidden;
  transition: border-color .4s, box-shadow .4s;
}

/* Foil holográfico */
.card-inner::before {
  content: ''; position: absolute; inset: 0; border-radius: 18px;
  background:
    radial-gradient(ellipse 90% 60% at 50% 0%,  rgba(167,139,250,0.18), transparent 55%),
    radial-gradient(ellipse 60% 40% at 20% 70%, rgba(6,182,212,0.12),   transparent 50%),
    radial-gradient(ellipse 50% 35% at 80% 80%, rgba(16,185,129,0.08),  transparent 50%);
  opacity: 0; transition: opacity .4s; pointer-events: none;
}
.feature-card:hover .card-inner::before,
.feature-card.active .card-inner::before { opacity: 1; }

/* Linhas de energia */
.card-inner::after {
  content: ''; position: absolute; inset: 0; border-radius: 18px;
  background: repeating-linear-gradient(105deg,
    transparent 0px, transparent 18px,
    rgba(167,139,250,0.03) 18px, rgba(167,139,250,0.03) 19px);
  pointer-events: none;
}

/* Brilho de borda superior */
.edge-glow {
  position: absolute; top: 0; left: 10%; right: 10%; height: 2px;
  border-radius: 18px 18px 0 0;
  opacity: 0; transition: opacity .4s;
}
.feature-card:hover .edge-glow,
.feature-card.active .edge-glow { opacity: 1; }

/* Cantos ornamentais */
.corner { position: absolute; width: 16px; height: 16px; pointer-events: none; opacity: 0; transition: opacity .4s; }
.corner-tl { top:10px;    left:10px;  border-left:1.5px solid; border-top:1.5px solid;    border-radius:3px 0 0 0; }
.corner-tr { top:10px;    right:10px; border-right:1.5px solid; border-top:1.5px solid;   border-radius:0 3px 0 0; }
.corner-bl { bottom:10px; left:10px;  border-left:1.5px solid; border-bottom:1.5px solid; border-radius:0 0 0 3px; }
.corner-br { bottom:10px; right:10px; border-right:1.5px solid; border-bottom:1.5px solid; border-radius:0 0 3px 0; }
.feature-card:hover .corner, .feature-card.active .corner { opacity: 1; }

/* Divisor */
.card-divider {
  width: 70%; height: 1px;
  background: linear-gradient(90deg, transparent, currentColor, transparent);
  opacity: 0.25; margin-bottom: 10px; position: relative; z-index: 1;
}

/* Ícone com glow */
.card-icon-wrap {
  width: 62px; height: 62px; border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.9rem; flex-shrink: 0; margin-bottom: 12px;
  border: 1px solid; transition: transform .35s, box-shadow .35s;
  position: relative; z-index: 1;
}
.feature-card:hover .card-icon-wrap,
.feature-card.active .card-icon-wrap { transform: scale(1.15) translateY(-4px); }
```

### 5d. CSS — blocos de cor por carta (substituir `.card-0` até `.card-4`)

```css
/* CARD 0 — Purple */
.card-0 .card-inner { border-color: rgba(139,92,246,.35); }
.card-0 .card-icon-wrap { background: rgba(139,92,246,.15); border-color: rgba(167,139,250,.2); box-shadow: 0 0 20px rgba(139,92,246,.25); }
.card-0 .card-title { color: #c4b5fd; text-shadow: 0 0 12px rgba(167,139,250,.6); }
.card-0 .card-divider { color: #a78bfa; }
.card-0 .corner { border-color: rgba(167,139,250,.5); }
.card-0 .edge-glow { background: linear-gradient(90deg, transparent 10%, rgba(167,139,250,.8) 50%, transparent 90%); }
.card-0 .ctag { background: rgba(139,92,246,.15); border: 1px solid rgba(167,139,250,.3); color: #c4b5fd; }
.card-0:hover .card-inner, .card-0.active .card-inner { border-color: rgba(167,139,250,.8); box-shadow: 0 0 0 1px rgba(167,139,250,.2), 0 0 40px rgba(139,92,246,.4), 0 28px 60px rgba(0,0,0,.7); }
.card-0:hover .card-icon-wrap, .card-0.active .card-icon-wrap { background: rgba(139,92,246,.22); box-shadow: 0 0 30px rgba(139,92,246,.5); }

/* CARD 1 — Gold */
.card-1 .card-inner { border-color: rgba(245,158,11,.35); }
.card-1 .card-icon-wrap { background: rgba(245,158,11,.13); border-color: rgba(251,191,36,.2); box-shadow: 0 0 20px rgba(245,158,11,.22); }
.card-1 .card-title { color: #fbbf24; text-shadow: 0 0 12px rgba(245,158,11,.6); }
.card-1 .card-divider { color: #f59e0b; }
.card-1 .corner { border-color: rgba(251,191,36,.5); }
.card-1 .edge-glow { background: linear-gradient(90deg, transparent 10%, rgba(251,191,36,.8) 50%, transparent 90%); }
.card-1 .ctag { background: rgba(245,158,11,.13); border: 1px solid rgba(251,191,36,.3); color: #fbbf24; }
.card-1:hover .card-inner, .card-1.active .card-inner { border-color: rgba(251,191,36,.8); box-shadow: 0 0 0 1px rgba(251,191,36,.2), 0 0 40px rgba(245,158,11,.4), 0 28px 60px rgba(0,0,0,.7); }
.card-1:hover .card-icon-wrap, .card-1.active .card-icon-wrap { background: rgba(245,158,11,.22); box-shadow: 0 0 30px rgba(245,158,11,.5); }

/* CARD 2 — Cyan */
.card-2 .card-inner { border-color: rgba(6,182,212,.35); }
.card-2 .card-icon-wrap { background: rgba(6,182,212,.13); border-color: rgba(34,211,238,.2); box-shadow: 0 0 20px rgba(6,182,212,.22); }
.card-2 .card-title { color: #22d3ee; text-shadow: 0 0 12px rgba(6,182,212,.6); }
.card-2 .card-divider { color: #06b6d4; }
.card-2 .corner { border-color: rgba(34,211,238,.5); }
.card-2 .edge-glow { background: linear-gradient(90deg, transparent 10%, rgba(34,211,238,.8) 50%, transparent 90%); }
.card-2 .ctag { background: rgba(6,182,212,.13); border: 1px solid rgba(34,211,238,.3); color: #22d3ee; }
.card-2:hover .card-inner, .card-2.active .card-inner { border-color: rgba(34,211,238,.8); box-shadow: 0 0 0 1px rgba(34,211,238,.2), 0 0 40px rgba(6,182,212,.4), 0 28px 60px rgba(0,0,0,.7); }
.card-2:hover .card-icon-wrap, .card-2.active .card-icon-wrap { background: rgba(6,182,212,.22); box-shadow: 0 0 30px rgba(6,182,212,.5); }

/* CARD 3 — Emerald */
.card-3 .card-inner { border-color: rgba(16,185,129,.35); }
.card-3 .card-icon-wrap { background: rgba(16,185,129,.13); border-color: rgba(52,211,153,.2); box-shadow: 0 0 20px rgba(16,185,129,.22); }
.card-3 .card-title { color: #34d399; text-shadow: 0 0 12px rgba(16,185,129,.6); }
.card-3 .card-divider { color: #10b981; }
.card-3 .corner { border-color: rgba(52,211,153,.5); }
.card-3 .edge-glow { background: linear-gradient(90deg, transparent 10%, rgba(52,211,153,.8) 50%, transparent 90%); }
.card-3 .ctag { background: rgba(16,185,129,.13); border: 1px solid rgba(52,211,153,.3); color: #34d399; }
.card-3:hover .card-inner, .card-3.active .card-inner { border-color: rgba(52,211,153,.8); box-shadow: 0 0 0 1px rgba(52,211,153,.2), 0 0 40px rgba(16,185,129,.4), 0 28px 60px rgba(0,0,0,.7); }
.card-3:hover .card-icon-wrap, .card-3.active .card-icon-wrap { background: rgba(16,185,129,.22); box-shadow: 0 0 30px rgba(16,185,129,.5); }

/* CARD 4 — Rose */
.card-4 .card-inner { border-color: rgba(244,63,94,.35); }
.card-4 .card-icon-wrap { background: rgba(244,63,94,.13); border-color: rgba(251,113,133,.2); box-shadow: 0 0 20px rgba(244,63,94,.22); }
.card-4 .card-title { color: #fb7185; text-shadow: 0 0 12px rgba(244,63,94,.6); }
.card-4 .card-divider { color: #f43f5e; }
.card-4 .corner { border-color: rgba(251,113,133,.5); }
.card-4 .edge-glow { background: linear-gradient(90deg, transparent 10%, rgba(251,113,133,.8) 50%, transparent 90%); }
.card-4 .ctag { background: rgba(244,63,94,.13); border: 1px solid rgba(251,113,133,.3); color: #fb7185; }
.card-4:hover .card-inner, .card-4.active .card-inner { border-color: rgba(251,113,133,.8); box-shadow: 0 0 0 1px rgba(251,113,133,.2), 0 0 40px rgba(244,63,94,.4), 0 28px 60px rgba(0,0,0,.7); }
.card-4:hover .card-icon-wrap, .card-4.active .card-icon-wrap { background: rgba(244,63,94,.22); box-shadow: 0 0 30px rgba(244,63,94,.5); }
```

---

## 6. O QUE NÃO TOCAR {#nao-tocar}

```
src/features/          → lógica de negócio, stores, services — INTOCÁVEL
src/types/             → tipos TypeScript — INTOCÁVEL
src/utils/             → helpers — INTOCÁVEL
src/hooks/             → apenas ADICIONAR useNavBump.ts
src/components/ui/     → componentes Button, Card, Input, Modal — INTOCÁVEL
src/components/layout/ → PageShell, BottomNav — apenas ajuste visual da nav
App.tsx                → rotas — INTOCÁVEL
Firebase / Firestore   → INTOCÁVEL
```

---

## 7. CHECKLIST FINAL {#checklist}

Antes de considerar concluído, verificar:

- [ ] `src/styles/tokens.css` existe e está importado no `index.css`
- [ ] `body` tem fundo `#080406` (vináceo escuro), não preto puro
- [ ] Grid sutil (linhas 64px) visível ao fundo
- [ ] Nav pill com fundo `#16161f` e bump orgânico SVG
- [ ] Logo centrada dentro do bump, sem costuras visíveis entre pill e bump
- [ ] Cards da landing sem rank (A/K/Q/J/10) e sem naipe (♠♥♦♣)
- [ ] Hover nas cartas: foil holográfico + cantos + brilho de borda
- [ ] Botões de CTA com gradiente vermelho→laranja (não vermelho sólido)
- [ ] Espaço Publicitário presente em todas as páginas (rodapé discreto)
- [ ] BottomNav com `fp-bottom-safe` para safe area do Android

---

*Handoff gerado em 14/03/2026 — FlashPoint Design Overhaul v2.0*
