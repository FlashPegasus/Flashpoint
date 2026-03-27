import React, { useEffect, useRef } from 'react';

interface AdsterraBannerProps {
  className?: string;
}

const AdsterraBanner: React.FC<AdsterraBannerProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && !containerRef.current.querySelector('script')) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = 'https://pl28988017.profitablecpmratenetwork.com/4094886cf41cf0b03e6e7856a41cd684/invoke.js';
      
      containerRef.current.appendChild(script);
    }
  }, []);

  return (
    <div className={`flex justify-center items-center my-6 w-full overflow-hidden ${className}`}>
      <div ref={containerRef} id="container-4094886cf41cf0b03e6e7856a41cd684"></div>
    </div>
  );
};

export default AdsterraBanner;
