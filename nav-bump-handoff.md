# FlashPoint — Nav Bump Shape Handoff
## Para: Antigravity  |  Barra de navegação com bump orgânico

---

## Conceito

A nav é uma **forma SVG única** — pill com um calombo (bump) simétrico
que sai para cima e para baixo no ponto onde fica a logo.
Não são dois elementos separados. O SVG é gerado por JS com curvas Bézier.

---

## Onde aplicar

Componente: `src/components/layout/` → arquivo da nav superior (NavBar, TopNav ou similar).

---

## Passo 1 — Estrutura JSX

Substitua o container da nav pelo seguinte padrão:

```tsx
{/* Nav wrap — espaço extra para o bump */}
<div className="nav-wrap">
  <div className="nav-shape" ref={navRef}>

    {/* Shape SVG — gerado pelo hook abaixo */}
    <svg className="nav-bg-svg" ref={svgRef}>
      <path ref={pathRef} fill="#16161f" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
    </svg>

    {/* Logo no bump */}
    <div className="nav-logo-bump" ref={logoRef}>
      <img src="/logo.png" alt="FlashPoint" />
    </div>

    {/* Conteúdo normal da nav */}
    <div className="nav-content">
      {/* ... itens existentes da nav ... */}
      {/* Adicionar um spacer no centro para não sobrepor a logo: */}
      <div ref={spacerRef} className="nav-logo-spacer" />
      {/* ... restante dos itens ... */}
    </div>

  </div>
</div>
```

---

## Passo 2 — CSS

Adicione ao CSS global ou ao módulo do componente:

```css
/* Wrap: margem vertical para o bump não ser cortado */
.nav-wrap {
  display: flex;
  justify-content: center;
  padding: 0 24px;
  position: relative;
  z-index: 100;
}

.nav-shape {
  position: relative;
  width: 100%;
  max-width: 900px;
  height: 52px;
  /* espaço para o bump acima e abaixo */
  margin: 24px 0 20px;
  /* sombra respeita o contorno orgânico */
  filter: drop-shadow(0 4px 24px rgba(0,0,0,0.7))
          drop-shadow(0 0 1px rgba(255,255,255,0.04));
}

/* SVG posicionado para cobrir o bump acima e abaixo */
.nav-bg-svg {
  position: absolute;
  left: 0;
  width: 100%;
  overflow: visible;
  pointer-events: none;
}

/* Logo centralizada no bump */
.nav-logo-bump {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  pointer-events: none;
}
.nav-logo-bump img {
  width: 42px;
  height: 42px;
  object-fit: contain;
  border-radius: 50%;
}

/* Conteúdo da nav sobre o SVG */
.nav-content {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  padding: 0 12px;
  gap: 4px;
}

/* Spacer que empurra os itens para não ficarem sob a logo */
.nav-logo-spacer {
  flex-shrink: 0;
  /* largura definida pelo hook JS */
}
```

---

## Passo 3 — Hook `useNavBump`

Crie o arquivo `src/hooks/useNavBump.ts`:

```ts
import { useEffect, useRef } from 'react';

const PILL_H  = 52;   // altura da barra em px
const BUMP_R  = 28;   // raio do círculo do bump
const BUMP_W  = 38;   // meia-largura da base de transição
const CORNER  = 26;   // raio das pontas arredondadas da pill

function buildPath(W: number, H: number, bx: number): string {
  const r       = CORNER;
  const br      = BUMP_R;
  const bw      = BUMP_W;
  const top     = 0;
  const bot     = H;
  const bumpTop = top - br * 0.85;   // pico acima
  const bumpBot = bot + br * 0.85;   // pico abaixo

  return [
    `M ${r} ${top}`,
    `L ${bx - bw} ${top}`,
    // bump superior (sobe)
    `C ${bx - bw * 0.4} ${top}, ${bx - br * 0.5} ${bumpTop}, ${bx} ${bumpTop}`,
    `C ${bx + br * 0.5} ${bumpTop}, ${bx + bw * 0.4} ${top}, ${bx + bw} ${top}`,
    `L ${W - r} ${top}`,
    `Q ${W} ${top} ${W} ${top + r}`,
    `L ${W} ${bot - r}`,
    `Q ${W} ${bot} ${W - r} ${bot}`,
    `L ${bx + bw} ${bot}`,
    // bump inferior (desce)
    `C ${bx + bw * 0.4} ${bot}, ${bx + br * 0.5} ${bumpBot}, ${bx} ${bumpBot}`,
    `C ${bx - br * 0.5} ${bumpBot}, ${bx - bw * 0.4} ${bot}, ${bx - bw} ${bot}`,
    `L ${r} ${bot}`,
    `Q ${0} ${bot} ${0} ${bot - r}`,
    `L ${0} ${top + r}`,
    `Q ${0} ${top} ${r} ${top}`,
    `Z`,
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
      const H   = PILL_H;
      const pad = BUMP_R * 0.85;

      // No mobile o bump fica à esquerda (ex: x = 40)
      // No desktop fica no centro
      const bx = isMobile ? 40 : W / 2;

      svgRef.current.setAttribute('viewBox', `0 ${-pad - 2} ${W} ${H + pad * 2 + 4}`);
      svgRef.current.setAttribute('width',  String(W));
      svgRef.current.setAttribute('height', String(H + pad * 2 + 4));
      (svgRef.current as SVGSVGElement).style.top = `${-(pad + 2)}px`;

      pathRef.current.setAttribute('d', buildPath(W, H, bx));

      // Posiciona a logo
      if (logoRef.current) {
        const size = BUMP_R * 2;
        logoRef.current.style.width  = `${size}px`;
        logoRef.current.style.height = `${size}px`;
        logoRef.current.style.left   = `${bx - BUMP_R}px`;
        logoRef.current.style.top    = `${H / 2 - BUMP_R}px`;
      }

      // Largura do spacer central
      if (spacerRef.current) {
        spacerRef.current.style.width = `${BUMP_W * 2 + 8}px`;
      }
    }

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [isMobile]);

  return { navRef, svgRef, pathRef, logoRef, spacerRef };
}
```

---

## Passo 4 — Usar o hook no componente

```tsx
import { useNavBump } from '../../hooks/useNavBump';

const MyNavBar: React.FC = () => {
  const isMobile = window.innerWidth < 680;
  const { navRef, svgRef, pathRef, logoRef, spacerRef } = useNavBump(isMobile);

  return (
    <div className="nav-wrap">
      <div className="nav-shape" ref={navRef}>

        <svg className="nav-bg-svg" ref={svgRef}>
          <path ref={pathRef} fill="#16161f" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        </svg>

        <div className="nav-logo-bump" ref={logoRef}>
          <img src="/logo.png" alt="FlashPoint" />
        </div>

        <div className="nav-content">
          {/* itens da esquerda */}
          <button>JOGADOR</button>
          <button>ORGANIZADOR</button>

          {/* spacer que reserva espaço para a logo no centro */}
          <div ref={spacerRef} className="nav-logo-spacer" />

          {/* itens da direita */}
          <button>CRIAR</button>
          {/* ... restante ... */}
        </div>

      </div>
    </div>
  );
};
```

---

## Valores de referência (ajustáveis)

| Constante | Valor | O que controla |
|---|---|---|
| `PILL_H`  | `52px` | Altura da barra |
| `BUMP_R`  | `28px` | Raio do bump (tamanho do calombo) |
| `BUMP_W`  | `38px` | Largura da base de transição |
| `CORNER`  | `26px` | Arredondamento das pontas da pill |
| `0.85`    | fator | Quanto o bump sai acima/abaixo (0 = sem bump, 1 = bump total) |

---

## Comportamento mobile

No mobile passar `isMobile={true}` para o hook move o bump para `bx = 40`
(lateral esquerda), onde a logo costuma ficar em telas pequenas.

```tsx
const isMobile = useMediaQuery('(max-width: 680px)');
const bump = useNavBump(isMobile);
```
