import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trophy, Plus, Users, Calendar, ArrowRight, Trash2, LogOut, Flag, Shield as ShieldIcon, Zap, Search, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import PageShell from '../components/layout';
import { Button } from '../components/ui';
import { useAuthStore } from '../features/auth/authStore';
import { useTournamentStore } from '../features/tournaments/tournamentStore';
import { tournamentService } from '../features/tournaments/tournamentService';

/* ── helpers ── */
const statusCfg: Record<string, { label: string; cls: string }> = {
    draft:        { label: 'Rascunho',      cls: 'bg-white/5 text-white/40 border border-white/10' },
    registration: { label: 'Aberto',        cls: 'bg-[rgba(139,92,246,0.15)] text-[#c4b5fd] border border-[rgba(167,139,250,0.3)]' },
    ongoing:      { label: 'Em Andamento',  cls: 'bg-[rgba(16,185,129,0.15)] text-[#34d399] border border-[rgba(52,211,153,0.3)]' },
    completed:    { label: 'Concluído',     cls: 'bg-[rgba(245,158,11,0.13)] text-[#fbbf24] border border-[rgba(251,191,36,0.3)]' },
};

const dicebear = (seed: string, size = 36) =>
    `https://api.dicebear.com/7.x/rings/svg?seed=${encodeURIComponent(seed)}&size=${size}`;

const MyArea: React.FC = () => {
    const { user, updateProfile } = useAuthStore();
    const { tournaments, loadTournaments } = useTournamentStore();
    const [stats, setStats] = React.useState<any>(null);
    const navigate = useNavigate();

    React.useEffect(() => {
        loadTournaments();
        if (user) tournamentService.getUserStats(user.id).then(setStats);
    }, [loadTournaments, user]);

    const myTournaments            = tournaments.filter(t => t.organizerId === user?.id);
    const participatingTournaments = tournaments.filter(t => t.participants.some(p => p.playerId === user?.id));
    const organizedCount           = tournaments.filter(t =>
        t.organizerId === user?.id &&
        t.status === 'completed' &&
        t.participants.filter(p => !p.isAnonymous).length >= 4
    ).length;

    const handleTogglePublic = async () => {
        if (!user) return;
        try {
            const newIsPublic = !user.isPublic;
            await updateProfile({ isPublic: newIsPublic });
            toast.success(`Perfil agora é ${newIsPublic ? 'Público' : 'Privado'}`);
        } catch { toast.error('Erro ao atualizar privacidade.'); }
    };

    const handleDeleteTournament = async (e: React.MouseEvent, id: string) => {
        e.preventDefault(); e.stopPropagation();
        if (!window.confirm('Excluir este torneio? Esta ação não pode ser desfeita.')) return;
        try {
            await tournamentService.deleteTournament(id);
            toast.success('Torneio excluído!');
            loadTournaments();
        } catch { toast.error('Erro ao excluir torneio.'); }
    };

    const handleLeaveTournament = async (e: React.MouseEvent, id: string) => {
        e.preventDefault(); e.stopPropagation();
        if (!window.confirm('Cancelar inscrição neste torneio?')) return;
        await tournamentService.removeParticipant(id, user!.id);
        loadTournaments();
    };

    const handleDropTournament = async (e: React.MouseEvent, id: string) => {
        e.preventDefault(); e.stopPropagation();
        if (!window.confirm('Desistir deste torneio? Seu progresso será mantido no histórico.')) return;
        await tournamentService.withdrawParticipant(id, user!.id);
        loadTournaments();
    };

    /* ── stat cards config ── */
    const statCards = [
        {
            label: 'Organizados',
            value: organizedCount,
            icon: <Trophy size={15} />,
            color: 'rgba(245,158,11,',
            colorHi: '#fbbf24',
        },
        {
            label: 'Participando',
            value: participatingTournaments.length,
            icon: <Users size={15} />,
            color: 'rgba(139,92,246,',
            colorHi: '#c4b5fd',
        },
        {
            label: 'Tx. de Vitória',
            value: stats?.winRate ?? '0%',
            icon: <ArrowRight size={15} />,
            color: 'rgba(16,185,129,',
            colorHi: '#34d399',
        },
    ];

    return (
        <PageShell>
            <div className="container py-8 pb-28 animate-fade-in">

                {/* ══════════════════════════════════════
                    HEADER
                ══════════════════════════════════════ */}
                <div className="relative overflow-hidden rounded-2xl mb-8
                                bg-[rgba(12,11,24,0.82)] border border-[rgba(255,255,255,0.08)]
                                backdrop-blur-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-6 md:p-8">

                    {/* glow de fundo */}
                    <div className="absolute inset-0 pointer-events-none rounded-2xl" style={{
                        background: 'radial-gradient(ellipse at 0% 50%, rgba(139,92,246,0.1) 0%, transparent 60%), radial-gradient(ellipse at 100% 50%, rgba(6,182,212,0.07) 0%, transparent 60%)'
                    }} />

                    <div className="relative flex flex-wrap items-center justify-between gap-4">
                        {/* Avatar + título */}
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[rgba(139,92,246,0.4)]
                                            shadow-[0_0_20px_rgba(139,92,246,0.3)] flex-shrink-0">
                                {user?.avatar
                                    ? <img src={user.avatar} className="w-full h-full object-cover" alt="" />
                                    : <img src={dicebear(user?.id || 'default', 56)} className="w-full h-full" alt="" />
                                }
                            </div>
                            <div>
                                <h1 className="font-[var(--fp-font-display,_'Cinzel_Decorative',serif)]
                                               text-2xl md:text-3xl text-white leading-tight mb-1">
                                    Minha Área
                                </h1>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-[rgba(148,163,184,1)] text-sm">
                                        Bem-vindo(a) de volta, <span className="text-white font-medium">{user?.name}</span>!
                                    </p>
                                    <button
                                        onClick={handleTogglePublic}
                                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold
                                                    uppercase tracking-wider border transition-all
                                                    ${user?.isPublic
                                                        ? 'bg-[rgba(16,185,129,0.12)] text-[#34d399] border-[rgba(52,211,153,0.3)]'
                                                        : 'bg-white/5 text-[rgba(100,116,139,1)] border-white/10'
                                                    }`}
                                        title={user?.isPublic ? 'Perfil visível para outros' : 'Perfil oculto'}
                                    >
                                        {user?.isPublic ? <Eye size={10} /> : <EyeOff size={10} />}
                                        {user?.isPublic ? 'Perfil Público' : 'Perfil Privado'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* CTA */}
                        <button
                            onClick={() => navigate('/tournament/create')}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white
                                       bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4]
                                       shadow-[0_0_24px_rgba(139,92,246,0.4)]
                                       hover:opacity-90 hover:-translate-y-0.5 transition-all">
                            <Plus size={16} /> Novo Torneio
                        </button>
                    </div>
                </div>

                {/* ══════════════════════════════════════
                    STAT CARDS
                ══════════════════════════════════════ */}
                <div className="grid grid-cols-3 gap-4 mb-10">
                    {statCards.map((s, i) => (
                        <div key={i}
                             className="relative overflow-hidden rounded-2xl p-5
                                        bg-[rgba(12,11,24,0.7)] border border-[rgba(255,255,255,0.07)]
                                        backdrop-blur-[16px] transition-all hover:-translate-y-0.5
                                        hover:border-[rgba(255,255,255,0.12)] group">
                            {/* glow de canto */}
                            <div className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                                 style={{ background: `radial-gradient(circle at 100% 0%, ${s.color}0.15) 0%, transparent 70%)` }} />

                            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider mb-3"
                                 style={{ color: s.colorHi, opacity: 0.75 }}>
                                {s.icon} {s.label}
                            </div>
                            <div className="text-3xl font-bold" style={{ color: s.colorHi }}>
                                {s.value}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ══════════════════════════════════════
                    GRID: ORGANIZANDO + PARTICIPANDO
                ══════════════════════════════════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* ── Organizando ── */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                            <span className="w-7 h-7 rounded-lg flex items-center justify-center
                                             bg-[rgba(139,92,246,0.15)] border border-[rgba(167,139,250,0.25)]">
                                <ShieldIcon size={14} className="text-[#c4b5fd]" />
                            </span>
                            Organizando
                        </h2>

                        <div className="flex flex-col gap-3">
                            {myTournaments.length === 0 ? (
                                /* Empty state */
                                <div className="relative overflow-hidden rounded-2xl p-10 text-center
                                                bg-[rgba(12,11,24,0.7)] border border-dashed border-[rgba(139,92,246,0.2)]
                                                hover:border-[rgba(139,92,246,0.45)] transition-all group">
                                    <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                                         style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.08) 0%, transparent 60%)' }} />
                                    <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center
                                                    bg-[rgba(139,92,246,0.12)] border border-[rgba(167,139,250,0.2)]
                                                    group-hover:scale-110 transition-transform">
                                        <Zap size={24} className="text-[#c4b5fd]" />
                                    </div>
                                    <h3 className="text-base font-bold mb-2 text-white">Crie seu primeiro evento</h3>
                                    <p className="text-[rgba(148,163,184,1)] text-sm mb-6 max-w-xs mx-auto leading-relaxed">
                                        Comece agora a organizar seu torneio. Rápido, fácil e totalmente automatizado.
                                    </p>
                                    <button
                                        onClick={() => navigate('/tournament/create')}
                                        className="px-5 py-2 rounded-xl text-sm font-bold text-white
                                                   bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4]
                                                   shadow-[0_0_20px_rgba(139,92,246,0.35)]
                                                   hover:opacity-90 transition-opacity">
                                        Começar Agora
                                    </button>
                                </div>
                            ) : (
                                myTournaments.map(t => (
                                    <Link key={t.id} to={`/tournament/${t.id}`}>
                                        <div className="fp-card p-5 hover:border-[rgba(167,139,250,0.5)] group
                                                        hover:shadow-[0_0_30px_rgba(139,92,246,0.2)] transition-all">
                                            <div className="flex justify-between items-start gap-3">
                                                <div className="min-w-0">
                                                    <h3 className="font-semibold text-white group-hover:text-[#c4b5fd]
                                                                   transition-colors truncate">
                                                        {t.name}
                                                    </h3>
                                                    <p className="text-xs text-[rgba(100,116,139,1)] mt-1 flex items-center gap-1">
                                                        <Calendar size={11} />
                                                        {t.date} · {t.participants.length} jogadores
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full
                                                                      ${statusCfg[t.status]?.cls ?? statusCfg.draft.cls}`}>
                                                        {statusCfg[t.status]?.label ?? t.status}
                                                    </span>
                                                    <button
                                                        onClick={e => handleDeleteTournament(e, t.id)}
                                                        className="text-[rgba(100,116,139,1)] hover:text-[#fb7185]
                                                                   opacity-0 group-hover:opacity-100 transition-all p-1"
                                                        title="Excluir">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>

                    {/* ── Participando ── */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                            <span className="w-7 h-7 rounded-lg flex items-center justify-center
                                             bg-[rgba(6,182,212,0.12)] border border-[rgba(34,211,238,0.22)]">
                                <Trophy size={14} className="text-[#22d3ee]" />
                            </span>
                            Participando
                        </h2>

                        <div className="flex flex-col gap-3">
                            {participatingTournaments.length === 0 ? (
                                /* Empty state */
                                <div className="relative overflow-hidden rounded-2xl p-10 text-center
                                                bg-[rgba(12,11,24,0.7)] border border-dashed border-[rgba(6,182,212,0.2)]
                                                hover:border-[rgba(6,182,212,0.45)] transition-all group">
                                    <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                                         style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(6,182,212,0.07) 0%, transparent 60%)' }} />
                                    <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center
                                                    bg-[rgba(6,182,212,0.10)] border border-[rgba(34,211,238,0.2)]
                                                    group-hover:scale-110 transition-transform">
                                        <Search size={24} className="text-[#22d3ee]" />
                                    </div>
                                    <h3 className="text-base font-bold mb-2 text-white">Busque por batalhas</h3>
                                    <p className="text-[rgba(148,163,184,1)] text-sm mb-6 max-w-xs mx-auto leading-relaxed">
                                        Explore torneios abertos e inscreva-se para ganhar pontos e subir no ranking.
                                    </p>
                                    <button
                                        onClick={() => navigate('/discover')}
                                        className="px-5 py-2 rounded-xl text-sm font-bold
                                                   bg-[rgba(6,182,212,0.12)] border border-[rgba(34,211,238,0.3)]
                                                   text-[#22d3ee] hover:bg-[rgba(6,182,212,0.2)] transition-colors">
                                        Explorar Torneios
                                    </button>
                                </div>
                            ) : (
                                participatingTournaments.map(t => {
                                    const myPart = t.participants.find(p => p.playerId === user?.id);
                                    return (
                                        <Link key={t.id} to={`/tournament/${t.id}/public`}>
                                            <div className="fp-card p-5 hover:border-[rgba(34,211,238,0.5)] group
                                                            hover:shadow-[0_0_30px_rgba(6,182,212,0.18)] transition-all">
                                                <div className="flex justify-between items-start gap-3">
                                                    <div className="min-w-0">
                                                        <h3 className="font-semibold text-white group-hover:text-[#22d3ee]
                                                                       transition-colors truncate">
                                                            {t.name}
                                                        </h3>
                                                        <p className="text-xs text-[rgba(100,116,139,1)] mt-1">
                                                            {t.format} · {t.location}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-3 flex-shrink-0">
                                                        {/* ações */}
                                                        <div className="flex gap-1">
                                                            {t.status === 'registration' && (
                                                                <button
                                                                    onClick={e => handleLeaveTournament(e, t.id)}
                                                                    className="text-[rgba(100,116,139,1)] hover:text-[#fb7185]
                                                                               p-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all"
                                                                    title="Sair do torneio">
                                                                    <LogOut size={14} />
                                                                </button>
                                                            )}
                                                            {t.status === 'ongoing' && myPart?.status === 'active' && (
                                                                <button
                                                                    onClick={e => handleDropTournament(e, t.id)}
                                                                    className="text-[rgba(100,116,139,1)] hover:text-[#fbbf24]
                                                                               p-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all"
                                                                    title="Desistir">
                                                                    <Flag size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                        {/* posição */}
                                                        <div className="text-center">
                                                            <p className="text-[10px] text-[rgba(100,116,139,1)] uppercase tracking-wider">
                                                                Posição
                                                            </p>
                                                            <p className="text-lg font-bold text-white leading-tight">
                                                                #{myPart?.rank ?? '—'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>

                {/* ── ESPAÇO PUBLICITÁRIO ── */}
                <div className="mt-12 mx-auto max-w-2xl">
                    <div className="rounded-2xl border border-dashed border-[rgba(255,255,255,0.07)]
                                    bg-[rgba(255,255,255,0.02)] py-6 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-[3px] text-[rgba(100,116,139,0.5)]">
                            Espaço Publicitário
                        </p>
                    </div>
                </div>

            </div>
        </PageShell>
    );
};

export default MyArea;
