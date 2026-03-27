import React, { useState } from 'react';
import { Trophy, Star, Zap, Play } from 'lucide-react';
import { Modal, Button, Card } from './ui';
import { useAuthStore } from '../features/auth/authStore';
import { rewardService, XP_CONFIG } from '../features/gamification/rewardService';

interface RewardCenterProps {
    isOpen: boolean;
    onClose: () => void;
}

export const RewardCenter: React.FC<RewardCenterProps> = ({ isOpen, onClose }) => {
    const { user, refreshUser } = useAuthStore();
    const [loading, setLoading] = useState(false);

    if (!user) return null;

    const stats = user.stats || { xp: 0, level: 1, accumulatedPoints: 0 };
    const currentXP = stats.xp || 0;
    const currentLevel = stats.level || 1;
    const nextLevelXP = currentLevel * 1000;
    const progress = (currentXP % 1000) / 10; // Percentage for the bar

    const handleWatchAd = async () => {
        setLoading(true);
        
        // Open Adsterra Smartlink (will open in new tab to not interrupt user flow)
        window.open('https://www.profitablecpmratenetwork.com/mdsxthjg?key=5498e6b6546d13480734d4739f9cd052', '_blank');

        setTimeout(async () => {
            await rewardService.addXP(user.id, XP_CONFIG.BASE_XP_AD, 'WATCH_AD');
            // Give 24h glow
            await rewardService.activateGlow(user.id, '#8b5cf6'); // Purple
            
            // Sync new XP and glow to local store
            if (refreshUser) await refreshUser();

            setLoading(false);
            alert('Recompensa recebida! +50 XP e Brilho Ativo por 24h!');
        }, 3000);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Centro de Recompensas">
            <div className="flex flex-col gap-6 p-2">
                {/* Level Card */}
                <div className="relative p-6 rounded-3xl bg-gradient-to-br from-[#1a0c0c] to-[#080406] border border-white/10 overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Trophy size={80} />
                    </div>
                    
                    <div className="flex items-end gap-3 mb-4">
                        <span className="text-4xl font-black font-outfit text-white">LVL {currentLevel}</span>
                        <span className="text-xs text-muted mb-1 uppercase tracking-widest font-bold">Iniciado</span>
                    </div>

                    <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div 
                            className="h-full bg-gradient-to-r from-accent-primary to-orange-500 transition-all duration-1000"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] font-bold text-muted uppercase tracking-tighter">
                        <span>{currentXP % 1000} XP</span>
                        <span>{nextLevelXP % 1000 || 1000} XP</span>
                    </div>
                </div>

                {/* Rewards Grid */}
                <div className="grid grid-cols-1 gap-4">
                    <Card className="!p-4 border-accent-primary/20 bg-accent-primary/5 hover:bg-accent-primary/10 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-accent-primary/20 flex items-center justify-center text-accent-primary">
                                <Play size={24} fill="currentColor" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-sm">Assistir Anúncio Premiado</h4>
                                <p className="text-[10px] text-muted">Ganha +{XP_CONFIG.BASE_XP_AD} XP e Ativa seu Glow por 24h</p>
                            </div>
                            <Button size="sm" onClick={handleWatchAd} loading={loading}>
                                Iniciar
                            </Button>
                        </div>
                    </Card>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl glass border-white/5 flex flex-col items-center text-center">
                            <Star className="text-yellow-500 mb-2" size={20} />
                            <span className="text-[10px] font-bold uppercase text-muted">Pontos Totais</span>
                            <span className="text-xl font-black">{stats.accumulatedPoints}</span>
                        </div>
                        <div className="p-4 rounded-2xl glass border-white/5 flex flex-col items-center text-center">
                            <Zap className="text-orange-500 mb-2" size={20} />
                            <span className="text-[10px] font-bold uppercase text-muted">Streak Atual</span>
                            <span className="text-xl font-black">0</span>
                        </div>
                    </div>
                </div>

                <p className="text-[9px] text-center text-muted uppercase tracking-widest opacity-50 px-8">
                    Anúncios premiados ajudam a manter o FlashPoint gratuito e em constante evolução.
                </p>
            </div>
        </Modal>
    );
};
