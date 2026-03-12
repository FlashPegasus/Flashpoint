import React, { useEffect, useRef } from 'react';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e'];

const LandingParticles: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const isMobile = window.innerWidth <= 680;
        const count = isMobile ? 12 : 22;

        const particles: HTMLDivElement[] = [];

        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.className = 'lp-particle';
            const size = Math.random() * 2.5 + 1;
            const color = COLORS[Math.floor(Math.random() * COLORS.length)];
            const duration = Math.random() * 14 + 9;
            const delay = Math.random() * 10;
            const left = Math.random() * 100;

            p.style.cssText = [
                `left:${left}%`,
                `background:${color}`,
                `width:${size}px`,
                `height:${size}px`,
                `animation-duration:${duration}s`,
                `animation-delay:${delay}s`,
                `will-change:transform`,
            ].join(';');

            container.appendChild(p);
            particles.push(p);
        }

        return () => {
            particles.forEach(p => p.remove());
        };
    }, []);

    return <div className="lp-particles" ref={containerRef} aria-hidden="true" />;
};

export default LandingParticles;
