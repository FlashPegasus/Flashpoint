import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trophy, Plus, Users, Calendar, ArrowRight, Trash2, LogOut, Flag, Shield as ShieldIcon, Zap, Search, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import PageShell from '../components/layout';
import { Button } from '../components/ui';
import { useAuthStore } from '../features/auth/authStore';
import { useTournamentStore } from '../features/tournaments/tournamentStore';
import { tournamentService } from '../features/tournaments/tournamentService';

const MyArea: React.FC = () => {
    const { user } = useAuthStore();
    const { tournaments, loadTournaments } = useTournamentStore();
    const { updateProfile } = useAuthStore();
    const [stats, setStats] = React.useState<any>(null);
    const navigate = useNavigate();

    React.useEffect(() => {
        loadTournaments();
        if (user) {
            tournamentService.getUserStats(user.id).then(setStats);
        }
    }, [loadTournaments, user]);

    const myTournaments = tournaments.filter(t => t.organizerId === user?.id);

    // Refined filter for the stats bubble: Completed + >= 4 real players
    const organizedCount = tournaments.filter(t =>
        t.organizerId === user?.id &&
        t.status === 'completed' &&
        t.participants.filter(p => !p.isAnonymous).length >= 4
    ).length;

    const participatingTournaments = tournaments.filter(t => t.participants.some(p => p.playerId === user?.id));

    const handleTogglePublic = async () => {
        if (!user) return;
        try {
            const newIsPublic = !user.isPublic;
            await updateProfile({ isPublic: newIsPublic });
            toast.success(`Perfil agora Ã© ${newIsPublic ? 'PÃºblico' : 'Privado'}`);
        } catch (err) {
            toast.error('Erro ao atualizar privacidade.');
        }
    };

    const handleDeleteTournament = async (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm('Tem certeza que deseja excluir este torneio? Esta aÃ§Ã£o nÃ£o pode ser desfeita.')) {
            try {
                await tournamentService.deleteTournament(id);
                toast.success('Torneio excluÃ­do com sucesso!');
                loadTournaments();
            } catch (err) {
                toast.error('Erro ao excluir torneio.');
            }
        }
    };

    const handleLeaveTournament = async (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm('Tem certeza que deseja cancelar sua inscriÃ§Ã£o neste torneio aberto?')) {
            await tournamentService.removeParticipant(id, user!.id);
            loadTournaments();
        }
    };

    const handleDropTournament = async (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm('Tem certeza que deseja desistir deste torneio? Seu progresso atual serÃ¡ mantido no histÃ³rico.')) {
            await tournamentService.withdrawParticipant(id, user!.id);
            loadTournaments();
        }
    };

    return (
        <PageShell>
            <div className="container py-8 animate-fade-in">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-outfit mb-1">Minha Ãrea</h1>
                        <div className="flex items-center gap-3">
                            <p className="text-secondary text-sm">Bem-vindo(a) de volta, {user?.name}!</p>
                            <button
                                onClick={handleTogglePublic}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${user?.isPublic
                                    ? 'bg-green/10 text-green border-green/20'
                                    : 'bg-white/5 text-muted border-white/10'
                                    }`}
                                title={user?.isPublic ? 'Perfil visÃ­vel para outros' : 'Perfil oculto para outros'}
                            >
                                {user?.isPublic ? <Eye size={12} /> : <EyeOff size={12} />}
                                {user?.isPublic ? 'PERFIL PÃšBLICO' : 'PERFIL PRIVADO'}
                            </button>
                        </div>
                    </div>
                    <Button variant="glow" onClick={() => navigate('/tournament/create')}>
                        <Plus size={18} className="mr-2" /> Novo Torneio
                    </Button>
                </div>

                {/* Stats Strip */}
                <div className="grid grid-cols-3 gap-4 mb-10">
                    {[
                        { label: 'Organizados', value: organizedCount, icon: <Trophy size={16} /> },
                        { label: 'Participando', value: participatingTournaments.length, icon: <Users size={16} /> },
                        { label: 'Tx. de VitÃ³ria', value: stats?.winRate || '0%', icon: <ArrowRight size={16} /> }
                    ].map((stat, i) => (
                        <div key={i} className="glass p-4 rounded-2xl border-white/5">
                            <div className="text-xs text-muted flex items-center gap-1 mb-1">
                                {stat.icon} {stat.label}
                            </div>
                            <div className="text-2xl font-bold font-outfit">{stat.value}</div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Managing Section */}
                    <div>
                        <h2 className="text-2xl font-outfit mb-4 flex items-center gap-2">
                            <ShieldIcon size={20} className="text-purple" style={{ color: 'var(--color-purple)' }} /> Organizando
                        </h2>
                        <div className="flex flex-col gap-4">
                            {myTournaments.length === 0 ? (
                                <div className="glass-card p-10 text-center border-dashed border-2 border-white/5 group hover:border-purple/30 transition-all">
                                    <div className="w-16 h-16 bg-purple/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                        <Zap size={28} className="text-purple" style={{ color: 'var(--color-purple)' }} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Crie seu primeiro evento</h3>
                                    <p className="text-secondary text-sm mb-6 max-w-xs mx-auto">Comece agora a organizar seu torneio. Ã‰ rÃ¡pido, fÃ¡cil e totalmente automatizado.</p>
                                    <Button variant="primary" size="sm" onClick={() => navigate('/tournament/create')}>
                                        ComeÃ§ar Agora
                                    </Button>
                                </div>
                            ) : (
                                myTournaments.map(t => (
                                    <Link key={t.id} to={`/tournament/${t.id}`}>
                                        <div className="glass-card p-5 hover:border-purple/50 transition-all group">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-lg font-bold group-hover:text-purple transition-colors">{t.name}</h3>
                                                    <p className="text-xs text-secondary mt-1 flex items-center gap-1">
                                                        <Calendar size={12} /> {t.date} â€¢ {t.participants.length} Jogadores
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${t.status === 'registration' ? 'bg-purple/10 text-purple' : 'bg-green/10 text-green'}`}>
                                                        {t.status === 'registration' ? 'Aberto' : t.status === 'ongoing' ? 'Em Andamento' : 'ConcluÃ­do'}
                                                    </span>
                                                    <button
                                                        onClick={(e) => handleDeleteTournament(e, t.id)}
                                                        className="text-muted hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                                                        title="Excluir Torneio"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Participating Section */}
                    <div>
                        <h2 className="text-2xl font-outfit mb-4 flex items-center gap-2">
                            <Trophy size={20} className="text-blue" style={{ color: 'var(--color-blue)' }} /> Participando
                        </h2>
                        <div className="flex flex-col gap-4">
                            {participatingTournaments.length === 0 ? (
                                <div className="glass-card p-10 text-center border-dashed border-2 border-white/5 group hover:border-blue/30 transition-all">
                                    <div className="w-16 h-16 bg-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                        <Search size={28} className="text-blue" style={{ color: 'var(--color-blue)' }} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Busque por batalhas</h3>
                                    <p className="text-secondary text-sm mb-6 max-w-xs mx-auto">Explore torneios abertos e inscreva-se para comeÃ§ar a ganhar pontos e subir no ranking.</p>
                                    <Button variant="secondary" size="sm" onClick={() => navigate('/discover')}>
                                        Explorar Torneios
                                    </Button>
                                </div>
                            ) : (
                                participatingTournaments.map(t => (
                                    <Link key={t.id} to={`/tournament/${t.id}/public`}>
                                        <div className="glass-card p-5 hover:border-blue/50 transition-all group relative">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-lg font-bold group-hover:text-blue transition-colors">{t.name}</h3>
                                                    <p className="text-xs text-secondary mt-1">{t.format} â€¢ {t.location}</p>
                                                </div>
                                                <div className="text-right flex items-center gap-4">
                                                    <div className="flex gap-2">
                                                        {t.status === 'registration' && (
                                                            <button
                                                                onClick={(e) => handleLeaveTournament(e, t.id)}
                                                                className="text-muted hover:text-red-400 p-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all"
                                                                title="Sair do Torneio"
                                                            >
                                                                <LogOut size={16} />
                                                            </button>
                                                        )}
                                                        {t.status === 'ongoing' && t.participants.find(p => p.playerId === user?.id)?.status === 'active' && (
                                                            <button
                                                                onClick={(e) => handleDropTournament(e, t.id)}
                                                                className="text-muted hover:text-yellow-400 p-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all"
                                                                title="Desistir"
                                                            >
                                                                <Flag size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-muted">Sua PosiÃ§Ã£o</p>
                                                        <p className="text-lg font-bold font-outfit text-center">#{t.participants.find(p => p.playerId === user?.id)?.rank || '-'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PageShell>
    );
};

export default MyArea;

