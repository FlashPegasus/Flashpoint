import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Users, MapPin } from 'lucide-react';
import PageShell from '../components/layout/PageShell';
import { Button, Card } from '../components/ui';
import { useTournamentStore } from '../stores/tournamentStore';
import { useAuthStore } from '../stores/authStore';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import LoadingScreen from '../components/ui/LoadingScreen';
import toast from 'react-hot-toast';

const TournamentPublic: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { activeTournament, loadTournament, addParticipant } = useTournamentStore();

    useEffect(() => {
        if (id) loadTournament(id);
    }, [id, loadTournament]);

    if (!activeTournament) return <LoadingScreen message="Carregando torneio..." />;

    const isJoined = activeTournament.participants.some(p => p.playerId === user?.id);

    const handleJoin = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (id) {
            try {
                await addParticipant(id, { playerId: user.id, name: user.name });
                toast.success('Inscrição confirmada!');
            } catch (err) {
                toast.error('Erro ao entrar no torneio.');
            }
        }
    };

    return (
        <PageShell>
            <div className="container py-8 animate-fade-in">
                <Breadcrumbs
                    items={[
                        { label: 'Descobrir', path: '/discover' },
                        { label: activeTournament.name }
                    ]}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Info */}
                    <div className="lg:col-span-2 flex flex-col gap-8">
                        <div className="glass p-8 rounded-3xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-purple/10 blur-[100px] -mr-32 -mt-32"></div>
                            <div className="relative z-10">
                                <div className="px-3 py-1 glass w-max rounded-full text-xs font-bold uppercase tracking-widest text-purple mb-4" style={{ color: 'var(--color-purple)' }}>
                                    {activeTournament.format === 'multiplayer' ? 'Multijogador' : '1 vs 1'}
                                </div>
                                <h1 className="text-5xl font-outfit mb-4">{activeTournament.name}</h1>
                                <div className="flex gap-6 flex-wrap text-secondary">
                                    <div className="flex items-center gap-2"><Calendar size={18} /> {activeTournament.date}</div>
                                    <div className="flex items-center gap-2"><MapPin size={18} /> {activeTournament.location}</div>
                                    <div className="flex items-center gap-2"><Users size={18} /> {activeTournament.participants.length} / {activeTournament.maxParticipants || '∞'} Jogadores</div>
                                </div>
                            </div>
                        </div>

                        <Card title="Descrição">
                            <p className="text-secondary whitespace-pre-wrap">{activeTournament.description || 'Nenhuma descrição fornecida.'}</p>
                        </Card>

                        <Card title="Classificação">
                            {activeTournament.participants.length === 0 ? (
                                <p className="text-muted italic">Nenhum participante ainda. Seja o primeiro a entrar!</p>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {activeTournament.participants.slice(0, 10).map((p, i) => (
                                        <div key={p.playerId} className="flex justify-between items-center p-3 glass rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-bold w-4">{i + 1}</span>
                                                <span className="font-medium">{p.name}</span>
                                            </div>
                                            <span className="font-bold">{p.totalPoints} pts</span>
                                        </div>
                                    ))}
                                    {activeTournament.participants.length > 10 && <p className="text-center text-xs text-muted py-2">E mais {activeTournament.participants.length - 10} jogadores...</p>}
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Sidebar Actions */}
                    <div className="flex flex-col gap-6">
                        <Card className="sticky top-24">
                            <div className="text-center mb-8">
                                <p className="text-sm text-secondary mb-2">Status do Torneio</p>
                                <div className="text-2xl font-bold uppercase tracking-widest text-purple" style={{ color: 'var(--color-purple)' }}>
                                    {activeTournament.status === 'registration' ? 'Inscrições' : activeTournament.status === 'ongoing' ? 'Em Andamento' : 'Finalizado'}
                                </div>
                            </div>

                            {isJoined ? (
                                <div className="flex flex-col gap-4">
                                    <div className="p-4 bg-green/10 rounded-2xl border border-green/20 text-center">
                                        <p className="text-green font-bold flex items-center justify-center gap-2" style={{ color: 'var(--color-green)' }}>
                                            Tudo pronto!
                                        </p>
                                        <p className="text-[10px] text-green/70 uppercase font-bold mt-1">Você está inscrito</p>
                                    </div>
                                    {user?.id === activeTournament.organizerId ? (
                                        <Button variant="glow" onClick={() => navigate(`/tournament/${id}`)}>Ir para Painel do Organizador</Button>
                                    ) : (
                                        <Button variant="secondary" onClick={() => navigate('/my-area')}>Ir para Minha Área</Button>
                                    )}
                                </div>
                            ) : (
                                <Button variant="glow" className="w-full text-lg py-5" onClick={handleJoin} disabled={activeTournament.status !== 'registration'}>
                                    {activeTournament.status === 'registration' ? 'Entrar no Torneio' : 'Inscrições Encerradas'}
                                </Button>
                            )}

                            <div className="mt-8 pt-8 border-t border-white/5">
                                <h4 className="text-sm font-bold uppercase mb-4 text-muted">Regras</h4>
                                <ul className="text-xs text-secondary flex flex-col gap-2">
                                    <li>• {activeTournament.allowLateRegistration ? 'Inscrição tardia permitida' : 'Sem inscrição tardia'}</li>
                                    <li>• {activeTournament.allowWithdrawal ? 'Saída voluntária permitida' : 'Partidas devem ser concluídas'}</li>
                                    <li>• Fair play e respeito são obrigatórios</li>
                                </ul>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </PageShell>
    );
};

export default TournamentPublic;
