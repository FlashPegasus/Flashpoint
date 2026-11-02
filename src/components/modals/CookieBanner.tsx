import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck } from 'lucide-react';
import { Button } from '../ui';

const COOKIE_CONSENT_KEY = 'flashpoint_cookie_consent';

export const CookieBanner: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (!consent) {
            // Small delay for smooth entry
            const timer = setTimeout(() => setIsVisible(true), 1200);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-24 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-[9990] animate-fade-in">
            <div className="glass-card p-5 rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-2xl bg-black/85 flex flex-col gap-4">
                <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[var(--fp-purple)]/15 border border-[var(--fp-purple)]/30 flex items-center justify-center shrink-0 text-[var(--fp-purple-hi)]">
                        <Cookie size={22} />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            Privacidade & Cookies <ShieldCheck size={14} className="text-emerald-400" />
                        </h4>
                        <p className="text-[11px] text-secondary leading-relaxed">
                            Utilizamos cookies e armazenamento local apenas para manter sua sessão, preferências e garantir o funcionamento seguro dos torneios e ligas.
                        </p>
                    </div>
                </div>
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/5">
                    <a
                        href="/privacidade"
                        className="text-[10px] text-muted hover:text-white transition-colors underline underline-offset-2 uppercase tracking-wider font-bold"
                    >
                        Saiba mais
                    </a>
                    <Button
                        variant="glow"
                        size="sm"
                        onClick={handleAccept}
                        className="px-5 py-2 text-xs font-bold uppercase tracking-wider"
                    >
                        Entendido
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CookieBanner;
