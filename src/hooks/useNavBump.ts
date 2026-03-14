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
      if (svgRef.current) {
        svgRef.current.style.top = `${-(pad + 2)}px`;
      }
      
      // If mobile, return a flat path instead of the bump logic
      if (isMobile) {
        pathRef.current.setAttribute('d', [
            `M ${CORNER} 0`,
            `L ${W - CORNER} 0`,
            `Q ${W} 0 ${W} ${CORNER}`,
            `L ${W} ${PILL_H - CORNER}`,
            `Q ${W} ${PILL_H} ${W - CORNER} ${PILL_H}`,
            `L ${CORNER} ${PILL_H}`,
            `Q 0 ${PILL_H} 0 ${PILL_H - CORNER}`,
            `L 0 ${CORNER}`,
            `Q 0 0 ${CORNER} 0 Z`
        ].join(' '));
      } else {
        pathRef.current.setAttribute('d', buildPath(W, PILL_H, bx));
      }

      if (logoRef.current) {
        // Increase logo to 150% (BUMP_R * 3 instead of 2)
        const size = BUMP_R * 3; 
        logoRef.current.style.width  = `${size}px`;
        logoRef.current.style.height = `${size}px`;
        logoRef.current.style.left   = isMobile ? '20px' : `${bx - size / 2}px`;
        // Adjust vertical alignment: if mobile, move it up slightly to look centered in the flat bar
        logoRef.current.style.top    = isMobile ? `${(PILL_H / 2 - size / 2) - 4}px` : `${PILL_H / 2 - size / 2}px`;
      }
      
      if (spacerRef.current) {
        spacerRef.current.style.width = isMobile ? '0px' : `${BUMP_W * 2 + 8}px`;
      }
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [isMobile]);

  return { navRef, svgRef, pathRef, logoRef, spacerRef };
}
