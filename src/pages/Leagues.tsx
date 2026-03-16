import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Plus, Calendar, Users, KeyRound } from 'lucide-react';
import PageShell from '../components/layout';
import { Card, Button } from '../components/ui';
import { useLeagueStore } from '../features/leagues/leagueStore';
import { useAuthStore } from '../features/auth/authStore';
import type { League } from '../types';

const LeagueListItem: React.FC<{ league: League; navigate: (path: string) => void; isMine: boolean }> = ({ league, navigate, isMine }) => (
    <div
        className={`p-5 glass rounded-2xl border transition-all cursor-pointer group
            ${isMine ? 'border-purple/30 bg-purple/5 hover:border-purple/60 shadow-[0_0_20px_rgba(139,92,246,0.1)]' : 'border-white/5 hover:border-purple/30'}`}
        onClick={() => navigate(`/league/${league.id}`)}>
        <div className="flex justify-between items-start mb-3">
            <div>
                <h3 className="text-lg font-bold group-hover:text-purple transition-all">
                    {league.name}
                </h3>
                {league.endDate && (
                    <p className="text-xs text-muted flex items-center gap-1 mt-1">
                        <Calendar size={11} /> Termina em {new Date(league.endDate).toLocaleDateString('pt-BR')}
                    </p>
                )}
            </div>
            <div className={`px-2 py-1 glass rounded-lg text-[10px] font-bold ${league.status === 'active' ? 'text-[var(--fp-emerald-hi)]' : 'text-muted'}`}>
                {league.status === 'active' ? 'ATIVA' : 'CONCLUÍDA'}
            </div>
        </div>
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-secondary">
                <Users size={13} /> {league.memberIds.length} membros
            </div>
            <Button variant={isMine ? 'glow' : 'secondary'} size="sm"
                onClick={e => { e.stopPropagation(); navigate(`/league/${league.id}`); }}>
                {isMine ? 'Gerenciar →' : 'Ver Ranking →'}
            </Button>
        </div>
    </div>
);

const Leagues: React.FC = () => {
    const navigate = useNavigate();
    const { user, uiMode } = useAuthStore();
    const { publicLeagues, loadPublicLeagues, isLoading } = useLeagueStore();

    useEffect(() => {
        loadPublicLeagues();
    }, [loadPublicLeagues]);

    const myOrganizedLeagues = publicLeagues.filter(l => l.organizerId === user?.id);
    const otherLeagues = publicLeagues.filter(l => l.organizerId !== user?.id);

    return (
        <PageShell>
            <div className="container py-8 animate-fade-in">
                <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                    <div>
                        <h1 className="text-4xl font-outfit mb-1">
                            {uiMode === 'organizer' ? 'Minhas Ligas' : 'Descobrir Ligas'}
                        </h1>
                        <p className="text-secondary">
                            {uiMode === 'organizer' 
                                ? 'Gerencie suas competições e sistemas de ranking.' 
                                : 'Participe de competições sazonais e suba no ranking.'}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={() => navigate('/join-league')}>
                            <KeyRound size={16} className="mr-2" /> Entrar por Código
                        </Button>
                        {user && !user.isAnonymous && (
                            <Button variant="glow" onClick={() => navigate('/league/create')}>
                                <Plus size={18} className="mr-2" /> Criar Liga
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Live Leagues List */}
                    <Card title={uiMode === 'organizer' ? 'Gerenciamento de Ligas' : 'Ligas Públicas'}>
                        {isLoading ? (
                            <div className="py-10 text-center opacity-40">Carregando...</div>
                        ) : (
                            <div className="flex flex-col gap-8">
                                {uiMode === 'organizer' && (
                                    <div className="flex flex-col gap-4">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--fp-purple-hi)]">Minhas Ligas</h3>
                                        {myOrganizedLeagues.length === 0 ? (
                                            <div className="p-8 text-center glass rounded-2xl border border-dashed border-white/5 opacity-50 italic text-xs">
                                                Você ainda não organizou nenhuma liga.
                                            </div>
                                        ) : (
                                            myOrganizedLeagues.map(league => (
                                                <LeagueListItem key={league.id} league={league} navigate={navigate} isMine={true} />
                                            ))
                                        )}
                                        
                                        {otherLeagues.length > 0 && (
                                            <>
                                                <h3 className="text-xs font-bold uppercase tracking-widest text-secondary mt-4">Outras Ligas Públicas</h3>
                                                {otherLeagues.map(league => (
                                                    <LeagueListItem key={league.id} league={league} navigate={navigate} isMine={false} />
                                                ))}
                                            </>
                                        )}
                                    </div>
                                )}

                                {uiMode === 'player' && (
                                    <div className="flex flex-col gap-4">
                                        {publicLeagues.length === 0 ? (
                                            <div className="p-10 text-center opacity-40 italic text-sm">
                                                Nenhuma liga pública ainda. Seja o primeiro a criar uma!
                                            </div>
                                        ) : (
                                            publicLeagues.map(league => (
                                                <LeagueListItem key={league.id} league={league} navigate={navigate} isMine={league.organizerId === user?.id} />
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>

                    {/* How It Works */}
                    <Card title="Como Funciona">
                        <div className="flex flex-col gap-6">
                            {[
                                { title: 'Crie uma Liga', desc: 'Configure um sistema de pontos sazonal e convide jogadores via link ou código.' },
                                { title: 'Vincule Torneios', desc: 'Gerencie torneios e sincronize automaticamente os resultados ao ranking da liga.' },
                                { title: 'Suba no Ranking', desc: 'A pontuação balanceada garante que os jogadores mais consistentes cheguem ao topo.' }
                            ].map((step, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full glass border border-purple/20 flex items-center justify-center font-bold flex-shrink-0"
                                        style={{ color: 'var(--color-purple)' }}>
                                        {i + 1}
                                    </div>
                                    <div>
                                        <h4 className="font-bold mb-1">{step.title}</h4>
                                        <p className="text-xs text-secondary">{step.desc}</p>
                                    </div>
                                </div>
                            ))}

                            <div className="mt-2 p-4 glass rounded-2xl border border-white/5">
                                <div className="flex items-center gap-2 mb-2">
                                    <Trophy size={16} style={{ color: 'var(--color-gold)' }} />
                                    <p className="text-xs font-bold uppercase tracking-widest">Diferencial</p>
                                </div>
                                <p className="text-xs text-secondary">Ligas FlashPoint suportam a regra "Melhores X Torneios" — apenas seus melhores resultados contam!</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </PageShell>
    );
};

export default Leagues;
