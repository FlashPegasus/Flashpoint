import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trophy, Plus, Users, Calendar, ArrowRight, Shield as ShieldIcon, Zap, Eye, EyeOff, LayoutGrid } from 'lucide-react';
import toast from 'react-hot-toast';
import PageShell from '../components/layout';
import { Button } from '../components/ui';
import { useAuthStore } from '../features/auth/authStore';
import { useTournamentStore } from '../features/tournaments/tournamentStore';
import { useLeagueStore } from '../features/leagues/leagueStore';
import { tournamentService } from '../features/tournaments/tournamentService';

/* ── helpers ── */
const statusCfg: Record<string, { label: string; cls: string }> = {
    draft:        { label: 'Rascunho',      cls: 'bg-white/5 text-white/40 border border-white/10' },
    registration: { label: 'Aberto',        cls: 'bg-primary/10 text-primary border border-primary/30' },
    ongoing:      { label: 'Em Andamento',  cls: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' },
    completed:    { label: 'Concluído',     cls: 'bg-amber-500/10 text-amber-400 border border-amber-500/30' },
};

const dicebear = (seed: string, size = 36) =>
    `https://api.dicebear.com/7.x/rings/svg?seed=${encodeURIComponent(seed)}&size=${size}`;

const MyArea: React.FC = () => {
    const { user, updateProfile, uiMode } = useAuthStore();
    const { tournaments, loadTournaments } = useTournamentStore();
    const { myLeagues, loadMyLeagues } = useLeagueStore();
    const [stats, setStats] = React.useState<any>(null);
    const navigate = useNavigate();

    React.useEffect(() => {
        loadTournaments();
        if (user) {
            tournamentService.getUserStats(user.id).then(setStats);
            loadMyLeagues(user.id);
        }
    }, [loadTournaments, loadMyLeagues, user]);

    const myTournaments = React.useMemo(() => 
        tournaments.filter(t => t.organizerId === user?.id),
    [tournaments, user?.id]);

    const participatingTournaments = React.useMemo(() => 
        tournaments.filter(t => (t.participants || []).some(p => p.playerId === user?.id)),
    [tournaments, user?.id]);

    const organizedCount = React.useMemo(() => 
        tournaments.filter(t =>
            t.organizerId === user?.id &&
            t.status === 'completed' &&
            (t.participants || []).filter(p => !p.isAnonymous).length >= 4
        ).length,
    [tournaments, user?.id]);

    const handleTogglePublic = async () => {
        if (!user) return;
        try {
            const newIsPublic = !user.isPublic;
            await updateProfile({ isPublic: newIsPublic });
            toast.success(`Perfil agora é ${newIsPublic ? 'Público' : 'Privado'}`);
        } catch { toast.error('Erro ao atualizar privacidade.'); }
    };


    /* ── stat cards config ── */
    const statCards = [
        {
            label: 'Organizados',
            value: organizedCount,
            icon: <Trophy size={15} />,
            color: 'rgba(192, 57, 43,', // primary rubro
            colorHi: 'var(--fp-primary)',
        },
        {
            label: 'Participando',
            value: participatingTournaments.length,
            icon: <Users size={15} />,
            color: 'rgba(255, 255, 255,',
            colorHi: '#fff',
        },
        {
            label: 'Winrate',
            value: stats?.winRate ?? '0%',
            icon: <ArrowRight size={15} />,
            color: 'rgba(251, 191, 36,', // gold
            colorHi: '#fbbf24',
        },
    ];

    return (
        <PageShell showBackground>
            <div className="container py-8 pb-28 animate-fade-in relative z-10">

                {/* ══════════════════════════════════════
                    HEADER
                ══════════════════════════════════════ */}
                <div className="fp-card overflow-hidden mb-8 p-6 md:p-8 relative">
                    {/* Glow background */}
                    <div className="absolute inset-0 pointer-events-none opacity-20" style={{
                        background: 'radial-gradient(circle at 100% 0%, var(--fp-primary) 0%, transparent 50%)'
                    }} />

                    <div className="relative flex flex-wrap items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-full border-4 border-primary/30 p-1 shadow-glow flex-shrink-0">
                                {user?.avatar
                                    ? <img src={user.avatar} className="w-full h-full object-cover rounded-full" alt="" />
                                    : <img src={dicebear(user?.id || 'default', 80)} className="w-full h-full rounded-full" alt="" />
                                }
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-display font-black text-white mb-2 uppercase tracking-tight">
                                    {uiMode === 'organizer' ? 'Portal do Organizador' : 'Perfil do Jogador'}
                                </h1>
                                <div className="flex items-center gap-3">
                                    <p className="text-muted text-sm capitalize">
                                        Saudações, <span className="text-white font-bold">{user?.name}</span>
                                    </p>
                                    <button
                                        onClick={handleTogglePublic}
                                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all
                                                    ${user?.isPublic
                                                        ? 'bg-primary/20 text-primary border-primary/30 shadow-glow-primary'
                                                        : 'bg-white/5 text-muted border-white/10'
                                                    }`}
                                    >
                                        {user?.isPublic ? <Eye size={10} /> : <EyeOff size={10} />}
                                        {user?.isPublic ? 'Público' : 'Privado'}
                                    </button>
                                </div>
                            </div>
                        </div>


                    </div>
                </div>

                {/* ══════════════════════════════════════
                    QUICK ACTIONS & STATS
                ══════════════════════════════════════ */}
                <div className="flex flex-col lg:flex-row gap-8 mb-12">
                    {/* Stats List */}
                    <div className="flex flex-wrap gap-4 flex-grow">
                        {statCards.map((s, i) => (
                            <div key={i} className="fp-card flex-grow min-w-[140px] p-5 group transition-all hover:-translate-y-1">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-50 group-hover:opacity-100 transition-opacity" style={{ color: s.colorHi }}>
                                    {s.icon} {s.label}
                                </div>
                                <div className="text-4xl font-display font-black" style={{ color: s.colorHi }}>
                                    {s.value}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Primary CTA (Organizer Only) */}
                    {uiMode === 'organizer' && (
                        <div className="flex-shrink-0">
                            <button
                                onClick={() => navigate('/tournament/create')}
                                className="w-full lg:w-auto h-full px-8 py-6 rounded-2xl font-black text-sm uppercase tracking-[0.2em] text-white
                                           bg-gradient-to-br from-primary to-primary-hi
                                           shadow-glow-primary hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group">
                                <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" /> 
                                Criar Novo Torneio
                            </button>
                        </div>
                    )}
                </div>

                {/* ══════════════════════════════════════
                    DASHBOARD SECTIONS
                ══════════════════════════════════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                    {/* LEFT COLUMN: PRIMARY LISTS */}
                    <div className="space-y-12">
                        {/* Section Header */}
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                {uiMode === 'organizer' ? <ShieldIcon size={20} /> : <Trophy size={20} />}
                            </div>
                            <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight">
                                {uiMode === 'organizer' ? 'Meus Torneios' : 'Torneios que participo'}
                            </h2>
                        </div>

                        <div className="grid gap-4">
                            {(uiMode === 'organizer' ? myTournaments : participatingTournaments).length === 0 ? (
                                <div className="fp-card p-12 text-center border-dashed opacity-50">
                                    <Zap size={48} className="mx-auto mb-4 text-muted" />
                                    <h3 className="text-xl font-bold mb-2">Nada por aqui...</h3>
                                    <p className="text-sm text-muted mb-8">Comece agora a organizar ou participar de torneios.</p>
                                    <Button variant="ghost" onClick={() => navigate(uiMode === 'organizer' ? '/tournament/create' : '/discover')}>
                                        {uiMode === 'organizer' ? 'Criar Torneio' : 'Encontrar Torneios'}
                                    </Button>
                                </div>
                            ) : (
                                (uiMode === 'organizer' ? myTournaments : participatingTournaments).map(t => (
                                    <Link key={t.id} to={uiMode === 'organizer' ? `/tournament/${t.id}` : `/tournament/${t.id}/public`} className="group">
                                        <div className="fp-card p-5 group-hover:border-primary/50 transition-all flex justify-between items-center group-hover:bg-white/[0.02]">
                                            <div className="flex gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${statusCfg[t.status]?.cls || ''} bg-opacity-20`}>
                                                    <Calendar size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-white group-hover:text-primary transition-colors uppercase tracking-tight text-lg leading-none mb-2">{t.name}</h3>
                                                    <p className="text-xs text-muted flex items-center gap-2">
                                                        <span className="font-bold text-primary-hi">{t.format}</span>
                                                        <span className="opacity-30">|</span>
                                                        <span>{new Date(t.date).toLocaleDateString('pt-BR')}</span>
                                                        <span className="opacity-30">|</span>
                                                        <span className="flex items-center gap-1"><Users size={12} /> {t.participants?.length || 0}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${statusCfg[t.status]?.cls || ''}`}>
                                                    {statusCfg[t.status]?.label || t.status}
                                                </div>
                                                <ArrowRight size={18} className="text-muted group-hover:text-primary transition-all group-hover:translate-x-1" />
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: SECONDARY LISTS (LEAGUES) */}
                    <div className="space-y-12">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                <LayoutGrid size={20} />
                            </div>
                            <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight">
                                {uiMode === 'organizer' ? 'Minhas Ligas' : 'Ligas que participo'}
                            </h2>
                        </div>

                        <div className="grid gap-4">
                            {myLeagues.length === 0 ? (
                                <div className="fp-card p-12 text-center opacity-40 border-dashed">
                                    <p className="text-sm text-muted">Você ainda não faz parte de nenhuma liga.</p>
                                    <Button variant="ghost" size="sm" className="mt-4" onClick={() => navigate('/leagues')}>Explorar Ligas</Button>
                                </div>
                            ) : (
                                myLeagues.map(l => (
                                    <Link key={l.id} to={`/league/${l.id}`} className="group">
                                        <div className="fp-card p-5 group-hover:border-primary/50 transition-all flex justify-between items-center bg-transparent border-white/5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-muted group-hover:text-primary group-hover:bg-primary/10 transition-all">
                                                    <Users size={18} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-white group-hover:text-primary transition-colors text-sm uppercase tracking-wider">{l.name}</h4>
                                                    <p className="text-[10px] text-muted flex items-center gap-2">
                                                        <span>{l.memberIds?.length || 0} MEMBROS</span>
                                                        <span className="opacity-30">•</span>
                                                        <span className="text-primary-hi font-bold">#{l.standings?.find(s => s.playerId === user?.id)?.rank || '—'} RANK</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {l.organizerId === user?.id && <span className="text-[8px] font-black bg-white/10 text-muted px-2 py-0.5 rounded-full uppercase tracking-tighter">Organizador</span>}
                                                <ArrowRight size={14} className="text-muted group-hover:text-primary transition-all" />
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>

                        {/* Publicidade Section (Re-styled) */}
                        <div className="mt-12 p-8 border border-white/5 bg-[radial-gradient(circle_at_50%_50%,rgba(192,57,43,0.05),transparent)] rounded-3xl text-center relative overflow-hidden group">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted/30 group-hover:text-primary/50 transition-colors">Conteúdo Patrocinado</p>
                        </div>
                    </div>
                </div>
            </div>
        </PageShell>
    );
};

export default MyArea;
