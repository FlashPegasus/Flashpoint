# FlashPoint — CSS Handoff (fix quebra do site)
## Para: Antigravity  |  Prioridade: URGENTE — aplicar antes de qualquer TSX

---

## Por que o site quebrou

Os arquivos `MyArea.tsx` e `TournamentDashboard.tsx` usam classes CSS customizadas
(`fp-card`, `fp-btn-primary`, `fp-btn-ghost`) e variáveis CSS (`--fp-purple`, `--fp-cyan` etc.)
que **não existem ainda no projeto**.

Elas precisam ser declaradas no CSS global **antes** de qualquer componente que as use.

---

## Passo 1 — Criar o arquivo de tokens

Crie o arquivo `src/styles/tokens.css` com este conteúdo exato:

```css
@layer base {
  :root {
    --fp-void:        #020408;
    --fp-deep:        #0a0a14;
    --fp-surface:     #0f172a;
    --fp-surface-hi:  rgba(15,23,42,0.92);

    --fp-glass:       rgba(255,255,255,0.04);
    --fp-glass-mid:   rgba(12,11,24,0.82);
    --fp-glass-blur:  blur(20px) saturate(180%);

    --fp-border:      rgba(255,255,255,0.08);
    --fp-border-hi:   rgba(255,255,255,0.14);
    --fp-border-lo:   rgba(255,255,255,0.05);

    --fp-purple:      #8b5cf6;
    --fp-purple-hi:   #a78bfa;
    --fp-purple-lo:   rgba(139,92,246,0.15);
    --fp-purple-glow: rgba(139,92,246,0.35);

    --fp-cyan:        #06b6d4;
    --fp-cyan-hi:     #22d3ee;
    --fp-cyan-lo:     rgba(6,182,212,0.15);

    --fp-emerald:     #10b981;
    --fp-emerald-hi:  #34d399;
    --fp-emerald-lo:  rgba(16,185,129,0.15);

    --fp-gold:        #f59e0b;
    --fp-gold-hi:     #fbbf24;
    --fp-gold-lo:     rgba(245,158,11,0.15);

    --fp-rose:        #f43f5e;
    --fp-rose-hi:     #fb7185;
    --fp-rose-lo:     rgba(244,63,94,0.15);

    --fp-text:        #e2e8f0;
    --fp-text-hi:     #ffffff;
    --fp-muted:       #64748b;
    --fp-subtle:      #94a3b8;

    --fp-font-display: 'Cinzel Decorative', serif;
    --fp-font-ui:      'Outfit', sans-serif;
    --fp-font-body:    'Inter', system-ui, sans-serif;

    --fp-r-xs:   6px;
    --fp-r-sm:   8px;
    --fp-r-md:   12px;
    --fp-r-lg:   16px;
    --fp-r-xl:   20px;
    --fp-r-pill: 100px;

    --fp-shadow-sm:     0 2px 8px rgba(0,0,0,0.4);
    --fp-shadow-md:     0 8px 32px rgba(0,0,0,0.5);
    --fp-shadow-lg:     0 20px 60px rgba(0,0,0,0.6);
    --fp-shadow-purple: 0 0 30px rgba(139,92,246,0.3);
    --fp-shadow-cyan:   0 0 30px rgba(6,182,212,0.3);
    --fp-shadow-gold:   0 0 24px rgba(245,158,11,0.3);
    --fp-inner-glow:    inset 0 1px 1px rgba(255,255,255,0.08);

    --fp-ease:          cubic-bezier(0.23, 1, 0.32, 1);
    --fp-ease-back:     cubic-bezier(0.34, 1.56, 0.64, 1);
    --fp-duration:      0.35s;
    --fp-duration-fast: 0.18s;
  }
}
```

---

## Passo 2 — Substituir src/index.css

Substitua o conteúdo completo de `src/index.css` por:

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

  --bg-dark:      #020408;
  --bg-card:      rgba(15,23,42,0.92);
  --bg-glass:     rgba(255,255,255,0.04);
  --border-glass: rgba(255,255,255,0.08);
  --inner-glow:   inset 0 1px 1px 0 rgba(255,255,255,0.08);

  --text-primary:   #e2e8f0;
  --text-secondary: #94a3b8;
  --text-muted:     #64748b;

  --shadow-glow-purple: 0 0 30px rgba(139,92,246,0.25);
  --shadow-glow-blue:   0 0 30px rgba(14,165,233,0.2);
  --radius-lg:  1rem;
  --radius-2xl: 1.5rem;

  --font-base:    'Inter', system-ui, sans-serif;
  --font-outfit:  'Outfit', sans-serif;
  --font-display: 'Cinzel Decorative', serif;
}

@layer base {
  :root {
    --fs-base: clamp(0.95rem, 0.85rem + 0.4vw, 1.1rem);
    --transition-premium: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  }

  body {
    font-family: var(--font-base);
    background-color: var(--fp-void);
    color: var(--fp-text);
    line-height: 1.6;
    font-size: var(--fs-base);
    min-height: 100vh;
    overflow-x: hidden;
    scrollbar-width: thin;
    scrollbar-color: rgba(139,92,246,0.35) transparent;
  }

  h1, h2, h3, h4, .font-display { font-family: var(--fp-font-display); }
  h5, h6, button, .font-ui, label, nav { font-family: var(--fp-font-ui); }

  ::-webkit-scrollbar       { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--fp-purple); }
}

/* Fundo global */
body::before {
  content: "";
  position: fixed; inset: 0; z-index: -1; pointer-events: none;
  background-image:
    radial-gradient(circle at 0% 0%,    rgba(139,92,246,0.14) 0%, transparent 50%),
    radial-gradient(circle at 100% 100%, rgba(6,182,212,0.10)  0%, transparent 50%),
    radial-gradient(circle at 50% 50%,  rgba(15,23,42,0) 0%, rgba(2,4,8,1) 100%);
}

/* Grid sutil */
body::after {
  content: "";
  position: fixed; inset: 0; z-index: -1; pointer-events: none;
  background-image:
    linear-gradient(rgba(139,92,246,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(139,92,246,0.025) 1px, transparent 1px);
  background-size: 64px 64px;
}

.mesh-gradient {
  background:
    radial-gradient(at 0%   0%,   rgba(139,92,246,0.2)  0, transparent 50%),
    radial-gradient(at 50%  0%,   rgba(14,165,233,0.15) 0, transparent 50%),
    radial-gradient(at 100% 0%,   rgba(245,158,11,0.1)  0, transparent 50%);
  background-size: 200% 200%;
  animation: meshFlow 15s ease infinite;
}
@keyframes meshFlow {
  0%   { background-position: 0%   50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0%   50%; }
}

@layer utilities {

  /* ── Glass ── */
  .glass {
    background: var(--fp-glass);
    backdrop-filter: var(--fp-glass-blur);
    -webkit-backdrop-filter: var(--fp-glass-blur);
    border: 1px solid var(--fp-border);
    box-shadow: var(--fp-inner-glow);
  }

  .glass-card {
    background: rgba(15,23,42,0.6);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow: 0 8px 32px 0 rgba(0,0,0,0.37);
  }

  /* ── fp-card ── */
  .fp-card {
    background: var(--fp-glass-mid);
    backdrop-filter: blur(20px);
    border: 1px solid var(--fp-border-hi);
    border-radius: var(--fp-r-lg);
    box-shadow: var(--fp-shadow-md);
    transition:
      transform var(--fp-duration) var(--fp-ease),
      border-color var(--fp-duration) var(--fp-ease),
      box-shadow var(--fp-duration) var(--fp-ease);
  }
  .fp-card:hover {
    transform: translateY(-3px);
    border-color: rgba(139,92,246,0.4);
    box-shadow: var(--fp-shadow-lg), var(--fp-shadow-purple);
  }

  /* ── Botões ── */
  .fp-btn-primary {
    background: linear-gradient(135deg, var(--fp-purple), var(--fp-cyan));
    border: none;
    border-radius: var(--fp-r-md);
    color: white;
    font-family: var(--fp-font-ui);
    font-weight: 700;
    cursor: pointer;
    transition: opacity var(--fp-duration-fast), transform var(--fp-duration-fast);
    box-shadow: 0 0 24px var(--fp-purple-glow);
  }
  .fp-btn-primary:hover  { opacity: 0.88; transform: translateY(-1px); }
  .fp-btn-primary:active { transform: translateY(0); }

  .fp-btn-ghost {
    background: var(--fp-glass);
    border: 1px solid var(--fp-border-hi);
    border-radius: var(--fp-r-md);
    color: var(--fp-text);
    font-family: var(--fp-font-ui);
    font-weight: 600;
    cursor: pointer;
    transition: background var(--fp-duration), border-color var(--fp-duration);
  }
  .fp-btn-ghost:hover {
    background: var(--fp-purple-lo);
    border-color: rgba(139,92,246,0.4);
  }

  /* ── Live dot ── */
  .fp-live-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--fp-emerald);
    box-shadow: 0 0 8px var(--fp-emerald);
    animation: livePulse 1.5s ease-in-out infinite;
  }
  @keyframes livePulse {
    0%, 100% { opacity: 1; transform: scale(1);   box-shadow: 0 0 8px var(--fp-emerald); }
    50%       { opacity: 0.6; transform: scale(1.5); box-shadow: 0 0 16px var(--fp-emerald); }
  }

  /* ── Badges ── */
  .fp-badge {
    display: inline-flex; align-items: center; gap: 5px;
    border-radius: var(--fp-r-pill);
    padding: 3px 10px;
    font-family: var(--fp-font-ui);
    font-size: 0.7rem; font-weight: 700;
    letter-spacing: 0.8px; text-transform: uppercase;
  }
  .fp-badge-live     { background: var(--fp-emerald-lo); border: 1px solid rgba(16,185,129,0.3); color: var(--fp-emerald-hi); }
  .fp-badge-upcoming { background: var(--fp-purple-lo);  border: 1px solid rgba(139,92,246,0.3); color: var(--fp-purple-hi); }
  .fp-badge-finished { background: rgba(255,255,255,0.05); border: 1px solid var(--fp-border); color: var(--fp-muted); }
  .fp-badge-org      { background: var(--fp-purple); border: none; color: white; }

  /* ── Skeleton ── */
  .fp-skeleton {
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0.04) 0%,
      rgba(255,255,255,0.09) 50%,
      rgba(255,255,255,0.04) 100%
    );
    background-size: 200% 100%;
    animation: skeletonShimmer 1.6s ease infinite;
    border-radius: var(--fp-r-sm);
  }
  @keyframes skeletonShimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* ── Gradientes de texto ── */
  .fp-gradient-text {
    background: linear-gradient(135deg, var(--fp-purple-hi), var(--fp-cyan-hi));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .fp-gradient-text-gold {
    background: linear-gradient(135deg, var(--fp-gold), var(--fp-gold-hi));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* ── Hover glows ── */
  .fp-hover-purple:hover { box-shadow: var(--fp-shadow-purple); border-color: rgba(139,92,246,0.5) !important; }
  .fp-hover-cyan:hover   { box-shadow: var(--fp-shadow-cyan);   border-color: rgba(6,182,212,0.5)  !important; }
  .fp-hover-gold:hover   { box-shadow: var(--fp-shadow-gold);   border-color: rgba(245,158,11,0.5) !important; }

  /* ── Animações ── */
  .fp-fade-in  { animation: fpFadeIn  0.5s var(--fp-ease) both; }
  .fp-slide-up { animation: fpSlideUp 0.5s var(--fp-ease) both; }
  @keyframes fpFadeIn  { from { opacity: 0; } to { opacity: 1; } }
  @keyframes fpSlideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

  .fp-stagger-1 { animation-delay: 0.05s; }
  .fp-stagger-2 { animation-delay: 0.10s; }
  .fp-stagger-3 { animation-delay: 0.15s; }
  .fp-stagger-4 { animation-delay: 0.20s; }
  .fp-stagger-5 { animation-delay: 0.25s; }

  /* ── Safe area (Capacitor) ── */
  .fp-bottom-safe {
    padding-bottom: max(env(safe-area-inset-bottom, 0px), 16px);
  }
}

/* Mana colors (mantidos do original) */
.text-mana-blue   { color: #0ea5e9; text-shadow: 0 0 10px rgba(14,165,233,0.3); }
.text-mana-red    { color: #ef4444; text-shadow: 0 0 10px rgba(239,68,68,0.3); }
.text-mana-green  { color: #22c55e; text-shadow: 0 0 10px rgba(34,197,94,0.3); }
.text-mana-purple { color: #8b5cf6; text-shadow: 0 0 15px rgba(139,92,246,0.4); }
.text-mana-gold   { color: #f59e0b; text-shadow: 0 0 10px rgba(245,158,11,0.3); }

.hover-glow-purple:hover {
  box-shadow: 0 0 20px rgba(139,92,246,0.3);
  border-color: rgba(139,92,246,0.5);
}

.container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }

/* Animações legadas (mantidas para compatibilidade) */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-10px); }
}
.animate-float { animation: float 6s ease-in-out infinite; }

@keyframes pulseSlow {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}
.animate-pulse-slow { animation: pulseSlow 4s cubic-bezier(0.4,0,0.6,1) infinite; }

::-webkit-scrollbar       { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: var(--color-purple); }
```

---

## Passo 3 — Verificar estrutura de arquivos

Confirme que a pasta existe:

```
src/
  styles/
    tokens.css   ← criado no Passo 1
  index.css      ← substituído no Passo 2
```

---

## O que NÃO mudar

- Nenhum arquivo `.tsx` — o problema é só no CSS
- Nenhuma configuração do Vite, Tailwind ou Firebase
- Nenhum arquivo dentro de `src/features/` ou `src/components/`

---

## Por que isso é necessário

Os arquivos `MyArea.tsx` e `TournamentDashboard.tsx` usam estas classes:

| Classe | Definida em |
|---|---|
| `fp-card` | `index.css` → `@layer utilities` |
| `fp-btn-primary` | `index.css` → `@layer utilities` |
| `fp-btn-ghost` | `index.css` → `@layer utilities` |
| `fp-live-dot` | `index.css` → `@layer utilities` |
| `fp-badge`, `fp-badge-*` | `index.css` → `@layer utilities` |
| `fp-skeleton` | `index.css` → `@layer utilities` |
| `fp-gradient-text` | `index.css` → `@layer utilities` |
| `--fp-purple`, `--fp-cyan` etc. | `tokens.css` |

Sem esses dois arquivos no lugar, o browser não encontra nenhuma dessas definições
e os componentes ficam sem estilo — causando a quebra visual.
