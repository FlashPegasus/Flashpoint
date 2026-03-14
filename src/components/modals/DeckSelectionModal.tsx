import React from 'react';
import { X, ExternalLink, Library, Search } from 'lucide-react';

interface DeckSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const DeckSelectionModal: React.FC<DeckSelectionModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const options = [
        {
            name: 'Scryfall',
            desc: 'A melhor ferramenta de busca de cards do mundo.',
            url: 'https://scryfall.com',
            icon: <Search className="text-primary" />,
            color: 'border-primary/30 hover:border-primary/60'
        },
        {
            name: 'LigaMagic',
            desc: 'Marketplace e database líder no mercado brasileiro.',
            url: 'https://www.ligamagic.com.br',
            icon: <Library className="text-amber-500" />,
            color: 'border-amber-500/30 hover:border-amber-500/60'
        }
    ];

    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-void/80 backdrop-blur-md animate-fade-in">
            <div className="relative w-full max-w-md fp-card p-8 animate-slide-up border-primary/30">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-muted hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-display font-black mb-2 uppercase tracking-tighter">
                        Base de <span className="text-primary">Conhecimento</span>
                    </h2>
                    <p className="text-sm text-muted">Escolha onde deseja pesquisar seus cards.</p>
                </div>

                <div className="grid gap-4">
                    {options.map((opt) => (
                        <a 
                            key={opt.name}
                            href={opt.url}
                            target="_blank"
                            rel="noreferrer"
                            className={`flex items-center gap-4 p-5 bg-white/5 border rounded-2xl transition-all hover:bg-white/10 group ${opt.color}`}
                        >
                            <div className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-xl group-hover:scale-110 transition-transform">
                                {opt.icon}
                            </div>
                            <div className="flex-grow">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white">{opt.name}</p>
                                <p className="text-[9px] text-muted line-clamp-1">{opt.desc}</p>
                            </div>
                            <ExternalLink size={16} className="text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                    ))}
                </div>

                <p className="mt-8 text-[9px] text-muted text-center uppercase tracking-widest opacity-30">
                    FlashPoint v2.0 · Conexão com bases externas
                </p>
            </div>
        </div>
    );
};

export default DeckSelectionModal;
