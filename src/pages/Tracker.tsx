import React from 'react';
import { Activity, ShieldAlert, Sparkles, Zap, Heart, Sword } from 'lucide-react';
import PageShell from '../components/layout';
import { Card, Button } from '../components/ui';
import { useNavigate } from 'react-router-dom';

const Tracker: React.FC = () => {
    const navigate = useNavigate();

    return (
        <PageShell>
            <div className="container py-8 max-w-4xl mx-auto animate-fade-in">
                {/* Beta Header */}
                <div className="relative overflow-hidden rounded-3xl p-8 mb-8
                                bg-[linear-gradient(160deg,#130a1a,#1a0c24)]
                                border border-[rgba(139,92,246,0.3)] shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                    <div className="absolute top-0 left-[10%] right-[10%] h-px pointer-events-none"
                         style={{ background: 'linear-gradient(90deg,transparent,rgba(168,85,247,0.8),transparent)' }} />
                    
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0
                                            bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.3)]
                                            shadow-[0_0_30px_rgba(139,92,246,0.25)]">
                                <Activity size={32} className="text-[var(--fp-purple-hi)] animate-pulse-subtle" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="font-[var(--fp-font-display,_'Cinzel_Decorative',serif)] text-3xl md:text-4xl text-white font-black tracking-wide">
                                        FlashPoint Tracker
                                    </h1>
                                    <span className="bg-gradient-to-r from-[var(--fp-purple)] to-[#c0392b] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-[0_0_15px_rgba(139,92,246,0.4)]">
                                        BETA
                                    </span>
                                </div>
                                <p className="text-secondary text-sm mt-1">
                                    Acompanhamento em tempo real de partidas, vida, marcadores e histórico tático.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Beta Notice Banner */}
                <div className="p-5 rounded-2xl bg-[rgba(231,76,60,0.08)] border border-[rgba(231,76,60,0.25)] flex items-start gap-4 mb-8">
                    <ShieldAlert size={24} className="text-[#e74c3c] flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                            Funcionalidade em Estágio Beta
                        </h3>
                        <p className="text-xs text-secondary leading-relaxed">
                            O FlashPoint Tracker está passando por testes finais para oferecer sincronização nativa com as mesas dos seus torneios. Recursos de contagem de vida, marcadores de veneno/comandante e estatísticas ao vivo estarão disponíveis em breve.
                        </p>
                    </div>
                </div>

                {/* Features Preview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <div className="flex flex-col items-center text-center p-4">
                            <div className="w-12 h-12 rounded-xl bg-red/10 border border-red/20 flex items-center justify-center text-red mb-3">
                                <Heart size={24} />
                            </div>
                            <h3 className="font-bold text-white mb-2">Life & Poison Counter</h3>
                            <p className="text-xs text-secondary leading-relaxed">
                                Suporte a mesas de 2 a 6 jogadores com contagem de dano de comandante, veneno, energia e experiência.
                            </p>
                        </div>
                    </Card>

                    <Card>
                        <div className="flex flex-col items-center text-center p-4">
                            <div className="w-12 h-12 rounded-xl bg-purple/10 border border-purple/20 flex items-center justify-center text-purple mb-3">
                                <Zap size={24} />
                            </div>
                            <h3 className="font-bold text-white mb-2">Sincronização com Torneios</h3>
                            <p className="text-xs text-secondary leading-relaxed">
                                Envie os resultados da partida diretamente para a súmula do juiz/organizador com 1 clique ao final do jogo.
                            </p>
                        </div>
                    </Card>

                    <Card>
                        <div className="flex flex-col items-center text-center p-4">
                            <div className="w-12 h-12 rounded-xl bg-blue/10 border border-blue/20 flex items-center justify-center text-blue mb-3">
                                <Sword size={24} />
                            </div>
                            <h3 className="font-bold text-white mb-2">Histórico Tático</h3>
                            <p className="text-xs text-secondary leading-relaxed">
                                Estatísticas de tempo de turno, taxa de vitória por arquétipo e análise de confrontos recentes.
                            </p>
                        </div>
                    </Card>
                </div>

                {/* Back to Events / Explore */}
                <div className="text-center">
                    <Button variant="glow" onClick={() => navigate('/discover')}>
                        <Sparkles size={16} className="mr-2" /> Explorar Torneios e Ligas
                    </Button>
                </div>
            </div>
        </PageShell>
    );
};

export default Tracker;
