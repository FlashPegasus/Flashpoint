import React, { useState, useEffect } from 'react';
import { Settings, Palette, Check, X, Sparkles } from 'lucide-react';

const themes = [
    { id: 'default', name: 'Original Purple', class: '', color: '#8b5cf6' },
    { id: 'red', name: 'Aggro Red', class: 'theme-red', color: '#ef4444' },
    { id: 'blue', name: 'Control Blue', class: 'theme-blue', color: '#3b82f6' },
    { id: 'gold', name: 'Legendary Gold', class: 'theme-gold', color: '#f59e0b' },
];

export const DesignLab: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentTheme, setCurrentTheme] = useState(() => {
        return localStorage.getItem('flashpoint-theme') || 'default';
    });

    useEffect(() => {
        // Remove all theme classes
        themes.forEach(t => {
            if (t.class) document.documentElement.classList.remove(t.class);
        });

        // Add selected theme class
        const theme = themes.find(t => t.id === currentTheme);
        if (theme?.class) {
            document.documentElement.classList.add(theme.class);
            localStorage.setItem('flashpoint-theme', theme.class);
        } else {
            localStorage.removeItem('flashpoint-theme');
        }
    }, [currentTheme]);

    return (
        <div className="fixed left-6 bottom-24 z-[100]">
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-2xl ${isOpen ? 'bg-purple text-white rotate-90' : 'glass text-secondary hover:text-purple hover:scale-110'}`}
                style={isOpen ? { backgroundColor: 'var(--accent-primary)' } : {}}
            >
                {isOpen ? <X size={20} /> : <Settings size={20} className="animate-spin-slow" />}
            </button>

            {/* Sidebar UI */}
            {isOpen && (
                <div className="absolute bottom-16 left-0 w-64 glass-premium p-6 animate-fade-in border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    <div className="flex items-center gap-2 mb-6">
                        <Palette size={18} className="text-purple" style={{ color: 'var(--accent-primary)' }} />
                        <h3 className="font-outfit font-bold text-lg tracking-tight">Design Lab</h3>
                    </div>

                    <div className="space-y-4">
                        <p className="text-[10px] uppercase font-black text-muted tracking-widest">Selecione o Accent</p>
                        <div className="grid grid-cols-2 gap-3">
                            {themes.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setCurrentTheme(t.id)}
                                    className={`relative p-3 rounded-xl border transition-all flex flex-col gap-2 items-center group ${currentTheme === t.id ? 'bg-white/10 border-white/20' : 'bg-black/20 border-white/5 hover:border-white/10'}`}
                                >
                                    <div 
                                        className="w-8 h-8 rounded-lg shadow-inner flex items-center justify-center"
                                        style={{ backgroundColor: t.color }}
                                    >
                                        {currentTheme === t.id && <Check size={14} className="text-white drop-shadow-md" />}
                                    </div>
                                    <span className="text-[9px] font-bold uppercase tracking-tighter text-center leading-none">
                                        {t.name}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/10">
                            <div className="flex items-center gap-2 text-gold mb-2" style={{ color: 'var(--color-gold)' }}>
                                <Sparkles size={14} />
                                <span className="text-[10px] uppercase font-bold">Experimentação Ativa</span>
                            </div>
                            <p className="text-[10px] text-secondary leading-relaxed">
                                Estas cores afetam todos os botões, glows e detalhes de vidro da plataforma em tempo real.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
