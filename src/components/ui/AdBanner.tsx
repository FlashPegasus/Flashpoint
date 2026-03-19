import React, { useEffect } from 'react';

interface AdBannerProps {
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Componente para renderizar blocos de anúncios do Google AdSense.
 * Inclui proteção para não quebrar o layout se o script não carregar.
 */
const AdBanner: React.FC<AdBannerProps> = ({ 
  slot, 
  format = 'auto', 
  className = '', 
  style = { display: 'block' } 
}) => {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('Erro ao carregar AdSense:', err);
    }
  }, []);

  return (
    <div className={`ad-container ${className}`} style={{ minHeight: '100px', margin: '20px 0' }}>
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client="ca-pub-1084819601166991"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdBanner;
