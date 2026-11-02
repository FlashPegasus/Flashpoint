import React, { useRef, useEffect, useState } from 'react';
import type { DeckSlotData, ChallengeStats } from '../../types/vault';
import { DECK_DEFINITIONS } from '../../constants/vault/deckDefinitions';
import { X, Download, Share2, Sparkles, Loader2 } from 'lucide-react';

interface ShareModalProps {
  decks: DeckSlotData[];
  stats: ChallengeStats;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ decks, stats, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);

  // Map decks by id
  const deckMap = new Map(decks.map((d) => [d.color_combination, d]));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas dimensions: 1200 x 675 (16:9 HD)
    const W = 1200;
    const H = 675;
    canvas.width = W;
    canvas.height = H;

    // Draw Dark Background
    const bgGradient = ctx.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, W);
    bgGradient.addColorStop(0, '#161922');
    bgGradient.addColorStop(1, '#08090b');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, W, H);

    // Decorative Gold Border
    ctx.strokeStyle = 'rgba(197, 160, 89, 0.4)';
    ctx.lineWidth = 4;
    ctx.strokeRect(16, 16, W - 32, H - 32);

    ctx.strokeStyle = 'rgba(197, 160, 89, 0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(22, 22, W - 44, H - 44);

    // Header Text
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f0cc75';
    ctx.font = 'bold 32px Georgia, serif';
    ctx.fillText('32 DECK CHALLENGE', W / 2, 65);

    ctx.fillStyle = '#8a7340';
    ctx.font = '600 14px sans-serif';
    ctx.fillText('ESTANTE DE DECKS · MAGIC: THE GATHERING', W / 2, 88);

    // Draw Stats Bar
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(
      `${stats.complete} de 32 Decks Concluídos  ·  ${stats.percent}% de Progresso`,
      W / 2,
      120
    );

    // Draw 32 Deck Tiles (4 rows of 8 columns = 32 slots)
    const cols = 8;
    const tileW = 125;
    const tileH = 105;
    const gap = 12;
    const startX = (W - (cols * tileW + (cols - 1) * gap)) / 2;
    const startY = 150;

    let loadedImages = 0;
    const totalTiles = 32;

    const renderComplete = () => {
      try {
        setDataUrl(canvas.toDataURL('image/png'));
      } catch (err) {
        console.warn('Canvas export tainted/error:', err);
      } finally {
        setIsGenerating(false);
      }
    };

    DECK_DEFINITIONS.forEach((def, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = startX + col * (tileW + gap);
      const y = startY + row * (tileH + gap);

      const deckData = deckMap.get(def.id);
      const isComplete = deckData?.status === 'complete';
      const isInProgress = deckData?.status === 'in_progress';
      const hasCommander = Boolean(deckData?.commander_name);
      const artUrl = deckData?.commander_image_url;

      // Tile Base Box
      ctx.fillStyle = '#12141a';
      ctx.fillRect(x, y, tileW, tileH);

      // Tile Border according to status
      if (isComplete) {
        ctx.strokeStyle = '#38d67a';
        ctx.lineWidth = 2;
      } else if (isInProgress) {
        ctx.strokeStyle = '#f0aa30';
        ctx.lineWidth = 2;
      } else {
        ctx.strokeStyle = 'rgba(197, 160, 89, 0.25)';
        ctx.lineWidth = 1;
      }
      ctx.strokeRect(x, y, tileW, tileH);

      // Function to draw text overlay on tile
      const drawTileText = () => {
        // Gradient overlay
        const grad = ctx.createLinearGradient(x, y, x, y + tileH);
        grad.addColorStop(0, 'rgba(0,0,0,0.2)');
        grad.addColorStop(1, 'rgba(0,0,0,0.85)');
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, tileW, tileH);

        // Slot Name
        ctx.textAlign = 'left';
        ctx.fillStyle = isComplete ? '#38d67a' : '#d4af37';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(def.name, x + 6, y + 18);

        // Commander Name
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px sans-serif';
        const displayName = hasCommander ? deckData!.commander_name : '—';
        const truncated = displayName.length > 18 ? displayName.slice(0, 16) + '...' : displayName;
        ctx.fillText(truncated, x + 6, y + tileH - 10);
      };

      if (artUrl) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = artUrl;
        img.onload = () => {
          ctx.save();
          ctx.beginPath();
          ctx.rect(x, y, tileW, tileH);
          ctx.clip();
          ctx.drawImage(img, x, y, tileW, tileH);
          ctx.restore();
          drawTileText();
          loadedImages++;
          if (loadedImages >= totalTiles) renderComplete();
        };
        img.onerror = () => {
          drawTileText();
          loadedImages++;
          if (loadedImages >= totalTiles) renderComplete();
        };
      } else {
        drawTileText();
        loadedImages++;
        if (loadedImages >= totalTiles) renderComplete();
      }
    });

    // Fallback timer in case external images take time
    const timer = setTimeout(() => {
      renderComplete();
    }, 1500);

    return () => clearTimeout(timer);
  }, [decks, stats]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `32-deck-challenge-${stats.percent}pct.png`;
    a.click();
  };

  const handleNativeShare = async () => {
    if (!dataUrl) return;
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], '32-deck-challenge.png', { type: 'image/png' });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: '32 Deck Challenge — Estante de Decks',
          text: `Meu progresso no 32 Deck Challenge de MTG: ${stats.complete}/32 decks concluídos (${stats.percent}%)!`,
          files: [file],
        });
      } else {
        handleDownload();
      }
    } catch (err) {
      handleDownload();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 740 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header__title-wrap">
            <Sparkles size={20} className="text-gold" />
            <h2 className="modal-header__title">Compartilhar Progresso</h2>
          </div>
          <button type="button" className="btn btn--ghost btn--icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Gere uma imagem com o mosaico dos seus 32 decks para compartilhar no Discord, Instagram ou Reddit!
          </p>

          <div className="share-canvas-container">
            {/* Hidden real canvas */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Visual preview */}
            {isGenerating ? (
              <div
                style={{
                  height: 300,
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#0d0f14',
                  borderRadius: 10,
                  color: 'var(--gold)',
                }}
              >
                <Loader2 size={32} className="animate-spin" />
                <span style={{ marginLeft: 12 }}>Renderizando mosaico em alta definição...</span>
              </div>
            ) : dataUrl ? (
              <img src={dataUrl} alt="32 Deck Challenge Mosaic" className="share-canvas-preview" />
            ) : null}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Fechar
          </button>
          <button type="button" className="btn btn--secondary" onClick={handleDownload} disabled={isGenerating}>
            <Download size={16} /> Baixar Imagem (PNG)
          </button>
          <button type="button" className="btn btn--primary" onClick={handleNativeShare} disabled={isGenerating}>
            <Share2 size={16} /> Compartilhar
          </button>
        </div>
      </div>
    </div>
  );
};
