import React from 'react';
import { Trophy, Plus, Calendar, Star } from 'lucide-react';
import PageShell from '../components/layout/PageShell';
import { Card, Button } from '../components/ui';

const Leagues: React.FC = () => {
    return (
        <PageShell>
            <div className="container py-8 animate-fade-in">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-outfit mb-1">Ligas</h1>
                        <p className="text-secondary">Competição sazonal e sistemas de ranking.</p>
                    </div>
                    <Button variant="glow">
                        <Plus size={18} className="mr-2" /> Criar Liga
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card title="Ligas Abertas">
                        <div className="flex flex-col gap-4">
                            <div className="p-6 glass rounded-2xl border-white/5 group hover:border-purple/30 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold group-hover:text-purple transition-all">Campeonato Regional S1</h3>
                                        <p className="text-xs text-muted flex items-center gap-1 mt-1"><Calendar size={12} /> Termina em Dez 2026</p>
                                    </div>
                                    <div className="px-2 py-1 glass rounded-lg text-[10px] font-bold text-gold" style={{ color: 'var(--color-gold)' }}>ATIVA</div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Trophy size={14} className="text-purple" style={{ color: 'var(--color-purple)' }} />
                                        <span className="text-sm">48 Participantes</span>
                                    </div>
                                    <Button variant="secondary" size="sm">Ver Tabela</Button>
                                </div>
                            </div>

                            <div className="p-10 text-center opacity-40 italic text-sm">
                                Mais ligas chegando em breve...
                            </div>
                        </div>
                    </Card>

                    <Card title="Como Funciona">
                        <div className="flex flex-col gap-6">
                            {[
                                { title: 'Crie uma Liga', desc: 'Configure um sistema de pontos sazonal e convide jogadores.' },
                                { title: 'Vincule Eventos', desc: 'Gerencie torneios e sincronize automaticamente os resultados para a liga.' },
                                { title: 'Suba no Ranking', desc: 'A pontuação balanceada garante que os jogadores mais consistentes cheguem ao topo.' }
                            ].map((step, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full glass border border-purple/20 flex items-center justify-center font-bold text-purple flex-shrink-0" style={{ color: 'var(--color-purple)' }}>
                                        {i + 1}
                                    </div>
                                    <div>
                                        <h4 className="font-bold mb-1">{step.title}</h4>
                                        <p className="text-xs text-secondary">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                            <div className="mt-4 p-4 glass rounded-2xl border-white/5 flex items-center gap-3">
                                <Star size={20} className="text-gold" style={{ color: 'var(--color-gold)' }} />
                                <p className="text-[10px] uppercase font-bold tracking-widest">Recurso Premium (Em Breve)</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </PageShell>
    );
};

export default Leagues;
