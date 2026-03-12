import React from 'react';
 
interface AdPlaceholderProps {
  className?: string;
}
 
/**
 * Placeholder discretizado para futuros banners publicitários.
 * Segue a estética glassmorphism do projeto.
 */
const AdPlaceholder: React.FC<AdPlaceholderProps> = ({ className = '' }) => {
  return (
    <div className={`ad-placeholder ${className}`} aria-hidden="true">
      {/* O texto é injetado via CSS ::before para manter o HTML limpo */}
    </div>
  );
};
 
export default AdPlaceholder;
