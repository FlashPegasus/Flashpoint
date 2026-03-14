# FlashPoint — Card Design Handoff
## Para: Antigravity  |  Contexto: Redesign das feature cards da landing page

---

## O que foi decidido

As **feature cards da mão de cartas** (animação da landing page) foram redesenhadas.
O objetivo era elevar o visual mantendo toda a lógica de interação existente intacta.

A principal mudança de conceito:  
**Remover qualquer referência a baralho convencional** (rank A/K/Q, naipes ♠♥♦♣)  
→ as cartas agora são objetos do universo FlashPoint, não cartas de baú.

---

## O que REMOVER do HTML atual

Em cada `.feature-card`, remova estas duas divs:

```html
<!-- REMOVER ISTO -->
<div class="card-rank">A</div>

<!-- REMOVER ISTO -->
<div class="card-suit">♠</div>
```

Resultado esperado de cada carta:

```html
<div class="feature-card card-0" onclick="selectCard(this,0)">
  <div class="card-inner">
    <div class="card-icon-wrap">🏆</div>
    <div class="card-title">Torneios<br>ao Vivo</div>
    <div class="card-divider"></div>
    <div class="card-body">...</div>
    <div class="card-tags">...</div>
  </div>
</div>
```

---

## O que ADICIONAR ao CSS

Substitua os estilos das classes abaixo. O restante do CSS (animações, posicionamento, deck, modal) **não muda**.

### 1. Remover os estilos de `.card-rank` e `.card-suit`

Apague estas linhas inteiras do CSS:
```css
.card-rank { ... }
.card-suit { ... }
```

E nos blocos de cor (`.card-0` até `.card-4`), remova as referências:
```css
/* APAGAR em cada bloco de cor: */
.card-X .card-rank, .card-X .card-suit { color: ...; }
```

---

### 2. Novo `.card-inner` — base premium

```css
.card-inner {
  width: 100%; height: 100%;
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,0.12);
  background: linear-gradient(160deg, #0d0b1e 0%, #111028 40%, #0a0d1e 100%);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  display: flex; flex-direction: column;
  align-items: center;
  padding: 20px 14px 16px;
  position: relative; overflow: hidden;
  transition: border-color .4s, box-shadow .4s, background .35s;
}
```

### 3. Foil holográfico no hover (`::before`)

```css
.card-inner::before {
  content: '';
  position: absolute; inset: 0;
  border-radius: 18px;
  background:
    radial-gradient(ellipse 90% 60% at 50% 0%,  rgba(167,139,250,0.18), transparent 55%),
    radial-gradient(ellipse 60% 40% at 20% 70%, rgba(6,182,212,0.12),   transparent 50%),
    radial-gradient(ellipse 50% 35% at 80% 80%, rgba(16,185,129,0.08),  transparent 50%);
  opacity: 0;
  transition: opacity .4s;
  pointer-events: none;
}
.feature-card:hover .card-inner::before,
.feature-card.active .card-inner::before { opacity: 1; }
```

### 4. Linhas de energia (`::after`)

```css
.card-inner::after {
  content: '';
  position: absolute; inset: 0;
  border-radius: 18px;
  background: repeating-linear-gradient(
    105deg,
    transparent 0px, transparent 18px,
    rgba(167,139,250,0.03) 18px, rgba(167,139,250,0.03) 19px
  );
  pointer-events: none;
}
```

### 5. Brilho de borda superior

Adicione esta div dentro de cada `.card-inner` (primeira filha):
```html
<div class="edge-glow"></div>
```

```css
.edge-glow {
  position: absolute; top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent 10%, rgba(167,139,250,0.8) 50%, transparent 90%);
  border-radius: 18px 18px 0 0;
  opacity: 0;
  transition: opacity .4s;
}
.feature-card:hover .edge-glow,
.feature-card.active .edge-glow { opacity: 1; }
```

### 6. Cantos ornamentais (4 cantos, aparecem no hover)

Adicione estas 4 divs dentro de cada `.card-inner`:
```html
<div class="corner corner-tl"></div>
<div class="corner corner-tr"></div>
<div class="corner corner-bl"></div>
<div class="corner corner-br"></div>
```

```css
.corner {
  position: absolute; width: 16px; height: 16px;
  pointer-events: none; opacity: 0;
  transition: opacity .4s;
}
.corner-tl { top: 10px;    left: 10px;  border-left: 1.5px solid rgba(167,139,250,0.5); border-top: 1.5px solid rgba(167,139,250,0.5);    border-radius: 3px 0 0 0; }
.corner-tr { top: 10px;    right: 10px; border-right: 1.5px solid rgba(167,139,250,0.5); border-top: 1.5px solid rgba(167,139,250,0.5);   border-radius: 0 3px 0 0; }
.corner-bl { bottom: 10px; left: 10px;  border-left: 1.5px solid rgba(167,139,250,0.5); border-bottom: 1.5px solid rgba(167,139,250,0.5); border-radius: 0 0 0 3px; }
.corner-br { bottom: 10px; right: 10px; border-right: 1.5px solid rgba(167,139,250,0.5); border-bottom: 1.5px solid rgba(167,139,250,0.5); border-radius: 0 0 3px 0; }

.feature-card:hover .corner,
.feature-card.active .corner { opacity: 1; }
```

### 7. Ícone — novo estilo com glow

```css
.card-icon-wrap {
  width: 62px; height: 62px;
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.9rem;
  flex-shrink: 0; margin-bottom: 12px;
  transition: transform .35s, box-shadow .35s, background .35s;
  position: relative; z-index: 1;
}
.feature-card:hover .card-icon-wrap,
.feature-card.active .card-icon-wrap {
  transform: scale(1.15) translateY(-4px);
}
```

### 8. Divisor entre título e corpo (NOVO elemento)

Adicione esta div no HTML de cada carta, entre `.card-title` e `.card-body`:
```html
<div class="card-divider"></div>
```

```css
.card-divider {
  width: 70%; height: 1px;
  background: linear-gradient(90deg, transparent, currentColor, transparent);
  opacity: 0.25;
  margin-bottom: 10px;
  position: relative; z-index: 1;
}
```

### 9. Tags — novo estilo colorido por carta

```css
.ctag {
  border-radius: 100px;
  padding: 2px 8px;
  font-size: .57rem; font-weight: 600;
  white-space: nowrap;
  /* cor herdada do bloco de cor da carta — ver seção abaixo */
}
```

---

## Blocos de cor por carta (substitui os blocos `.card-0` até `.card-4`)

```css
/* ── CARD 0 — Purple (Torneios ao Vivo) ── */
.card-0 .card-inner { border-color: rgba(139,92,246,.35); }
.card-0 .card-icon-wrap { background: rgba(139,92,246,.15); border: 1px solid rgba(167,139,250,.2); box-shadow: 0 0 20px rgba(139,92,246,.25), inset 0 1px 1px rgba(255,255,255,.08); }
.card-0 .card-title  { color: #c4b5fd; text-shadow: 0 0 12px rgba(167,139,250,.6); }
.card-0 .card-divider { color: #a78bfa; }
.card-0 .ctag { background: rgba(139,92,246,.15); border: 1px solid rgba(167,139,250,.3); color: #c4b5fd; }
.card-0:hover .card-inner, .card-0.active .card-inner { border-color: rgba(167,139,250,.8); box-shadow: 0 0 0 1px rgba(167,139,250,.2), 0 0 40px rgba(139,92,246,.4), 0 0 80px rgba(139,92,246,.15), 0 28px 60px rgba(0,0,0,.7); }
.card-0:hover .card-icon-wrap, .card-0.active .card-icon-wrap { background: rgba(139,92,246,.22); box-shadow: 0 0 30px rgba(139,92,246,.5), inset 0 1px 1px rgba(255,255,255,.12); }
.card-0 .corner { border-color: rgba(167,139,250,.5); }
.card-0 .edge-glow { background: linear-gradient(90deg, transparent 10%, rgba(167,139,250,.8) 50%, transparent 90%); }

/* ── CARD 1 — Gold (Ranking Global) ── */
.card-1 .card-inner { border-color: rgba(245,158,11,.35); }
.card-1 .card-icon-wrap { background: rgba(245,158,11,.13); border: 1px solid rgba(251,191,36,.2); box-shadow: 0 0 20px rgba(245,158,11,.22), inset 0 1px 1px rgba(255,255,255,.08); }
.card-1 .card-title  { color: #fbbf24; text-shadow: 0 0 12px rgba(245,158,11,.6); }
.card-1 .card-divider { color: #f59e0b; }
.card-1 .ctag { background: rgba(245,158,11,.13); border: 1px solid rgba(251,191,36,.3); color: #fbbf24; }
.card-1:hover .card-inner, .card-1.active .card-inner { border-color: rgba(251,191,36,.8); box-shadow: 0 0 0 1px rgba(251,191,36,.2), 0 0 40px rgba(245,158,11,.4), 0 0 80px rgba(245,158,11,.12), 0 28px 60px rgba(0,0,0,.7); }
.card-1:hover .card-icon-wrap, .card-1.active .card-icon-wrap { background: rgba(245,158,11,.22); box-shadow: 0 0 30px rgba(245,158,11,.5), inset 0 1px 1px rgba(255,255,255,.12); }
.card-1 .corner { border-color: rgba(251,191,36,.5); }
.card-1 .edge-glow { background: linear-gradient(90deg, transparent 10%, rgba(251,191,36,.8) 50%, transparent 90%); }

/* ── CARD 2 — Cyan (Check-in Rápido) ── */
.card-2 .card-inner { border-color: rgba(6,182,212,.35); }
.card-2 .card-icon-wrap { background: rgba(6,182,212,.13); border: 1px solid rgba(34,211,238,.2); box-shadow: 0 0 20px rgba(6,182,212,.22), inset 0 1px 1px rgba(255,255,255,.08); }
.card-2 .card-title  { color: #22d3ee; text-shadow: 0 0 12px rgba(6,182,212,.6); }
.card-2 .card-divider { color: #06b6d4; }
.card-2 .ctag { background: rgba(6,182,212,.13); border: 1px solid rgba(34,211,238,.3); color: #22d3ee; }
.card-2:hover .card-inner, .card-2.active .card-inner { border-color: rgba(34,211,238,.8); box-shadow: 0 0 0 1px rgba(34,211,238,.2), 0 0 40px rgba(6,182,212,.4), 0 0 80px rgba(6,182,212,.12), 0 28px 60px rgba(0,0,0,.7); }
.card-2:hover .card-icon-wrap, .card-2.active .card-icon-wrap { background: rgba(6,182,212,.22); box-shadow: 0 0 30px rgba(6,182,212,.5), inset 0 1px 1px rgba(255,255,255,.12); }
.card-2 .corner { border-color: rgba(34,211,238,.5); }
.card-2 .edge-glow { background: linear-gradient(90deg, transparent 10%, rgba(34,211,238,.8) 50%, transparent 90%); }

/* ── CARD 3 — Emerald (Decks & Scryfall) ── */
.card-3 .card-inner { border-color: rgba(16,185,129,.35); }
.card-3 .card-icon-wrap { background: rgba(16,185,129,.13); border: 1px solid rgba(52,211,153,.2); box-shadow: 0 0 20px rgba(16,185,129,.22), inset 0 1px 1px rgba(255,255,255,.08); }
.card-3 .card-title  { color: #34d399; text-shadow: 0 0 12px rgba(16,185,129,.6); }
.card-3 .card-divider { color: #10b981; }
.card-3 .ctag { background: rgba(16,185,129,.13); border: 1px solid rgba(52,211,153,.3); color: #34d399; }
.card-3:hover .card-inner, .card-3.active .card-inner { border-color: rgba(52,211,153,.8); box-shadow: 0 0 0 1px rgba(52,211,153,.2), 0 0 40px rgba(16,185,129,.4), 0 0 80px rgba(16,185,129,.12), 0 28px 60px rgba(0,0,0,.7); }
.card-3:hover .card-icon-wrap, .card-3.active .card-icon-wrap { background: rgba(16,185,129,.22); box-shadow: 0 0 30px rgba(16,185,129,.5), inset 0 1px 1px rgba(255,255,255,.12); }
.card-3 .corner { border-color: rgba(52,211,153,.5); }
.card-3 .edge-glow { background: linear-gradient(90deg, transparent 10%, rgba(52,211,153,.8) 50%, transparent 90%); }

/* ── CARD 4 — Rose (Streaks & Stats) ── */
.card-4 .card-inner { border-color: rgba(244,63,94,.35); }
.card-4 .card-icon-wrap { background: rgba(244,63,94,.13); border: 1px solid rgba(251,113,133,.2); box-shadow: 0 0 20px rgba(244,63,94,.22), inset 0 1px 1px rgba(255,255,255,.08); }
.card-4 .card-title  { color: #fb7185; text-shadow: 0 0 12px rgba(244,63,94,.6); }
.card-4 .card-divider { color: #f43f5e; }
.card-4 .ctag { background: rgba(244,63,94,.13); border: 1px solid rgba(251,113,133,.3); color: #fb7185; }
.card-4:hover .card-inner, .card-4.active .card-inner { border-color: rgba(251,113,133,.8); box-shadow: 0 0 0 1px rgba(251,113,133,.2), 0 0 40px rgba(244,63,94,.4), 0 0 80px rgba(244,63,94,.12), 0 28px 60px rgba(0,0,0,.7); }
.card-4:hover .card-icon-wrap, .card-4.active .card-icon-wrap { background: rgba(244,63,94,.22); box-shadow: 0 0 30px rgba(244,63,94,.5), inset 0 1px 1px rgba(255,255,255,.12); }
.card-4 .corner { border-color: rgba(251,113,133,.5); }
.card-4 .edge-glow { background: linear-gradient(90deg, transparent 10%, rgba(251,113,133,.8) 50%, transparent 90%); }
```

---

## HTML final de uma carta (modelo completo)

```html
<div class="feature-card card-0" onclick="selectCard(this,0)">
  <div class="card-inner">
    <div class="edge-glow"></div>
    <div class="corner corner-tl"></div>
    <div class="corner corner-tr"></div>
    <div class="corner corner-bl"></div>
    <div class="corner corner-br"></div>
    <div class="card-icon-wrap">🏆</div>
    <div class="card-title">Torneios<br>ao Vivo</div>
    <div class="card-divider"></div>
    <div class="card-body">Pareamento suíço em tempo real. Brackets automáticos com sincronização instantânea.</div>
    <div class="card-tags">
      <span class="ctag">Swiss</span>
      <span class="ctag">Live</span>
      <span class="ctag">Sync</span>
    </div>
  </div>
</div>
```

Repita o padrão para as cartas 1–4 trocando: `card-X`, `onclick`, ícone, título, corpo e tags.

---

## O que NÃO mudar

- Toda a lógica JavaScript (`selectCard`, `drawCard`, `openModal`, etc.)
- Posicionamento das cartas (`.card-hand`, nth-child positions, rotações)
- Animações de shuffle (`shuffleLeft`, `shuffleRight`, `shufflePop`)
- Deck zone e modal de login
- Nav pill, hero, pódio, footer
- CSS mobile/tablet responsivo das cartas

---

## Resumo visual das mudanças

| Antes | Depois |
|---|---|
| `.card-rank` (A/K/Q/J/10) no canto direito superior | **Removido** |
| `.card-suit` (♠♥♦♣) no canto direito inferior | **Removido** |
| Canto ornamental fixo só no topo esquerdo | **4 cantos** aparecem no hover |
| Fundo sólido glass genérico | **Gradient** linear azul-escuro premium |
| Sem divisor entre título e corpo | **Divisor** gradiente colorido por carta |
| Tags brancas genéricas | **Tags coloridas** pela cor de cada carta |
| Ícone sem borda | **Ícone** com border + glow no hover |
| Glow simples no hover | **Foil holográfico** (3 radiais) + linhas de energia + brilho de borda |
