import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Plus, Calendar, Trash2, LogOut, Flag,
    Zap, Search, Eye, EyeOff, ArrowRight,
    ChevronRight, X, Key
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageShell from '../components/layout';
import { Modal, LoadingScreen } from '../components/ui';
import { useAuthStore } from '../features/auth/authStore';
import { useTournamentStore } from '../features/tournaments/tournamentStore';
import { useLeagueStore } from '../features/leagues/leagueStore';
import { tournamentService } from '../features/tournaments/tournamentService';
import AdsterraBanner from '../components/ui/AdsterraBanner';

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
const dicebear = (seed: string, size = 48) =>
    `https://api.dicebear.com/7.x/rings/svg?seed=${encodeURIComponent(seed)}&size=${size}`;

const STATUS_CFG: Record<string, { label: string; cls: string; dot?: string }> = {
    draft:        { label: 'Rascunho',     cls: 'bg-white/5 border-white/10 text-[#7a5c5c]' },
    registration: { label: 'Aberto',       cls: 'bg-[rgba(192,57,43,0.12)] border-[rgba(192,57,43,0.3)] text-[#e74c3c]', dot: 'bg-[#e74c3c]' },
    ongoing:      { label: 'Em Andamento', cls: 'bg-[rgba(30,132,73,0.12)] border-[rgba(39,174,96,0.3)] text-[#27ae60]',  dot: 'bg-[#27ae60] animate-pulse' },
    completed:    { label: 'Concluído',    cls: 'bg-[rgba(212,172,13,0.1)] border-[rgba(212,172,13,0.25)] text-[#d4ac0d]' },
};

const MEDALS = ['🥇', '🥈', '🥉'];

/* ─────────────────────────────────────────
   STATUS BADGE
───────────────────────────────────────── */
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const c = STATUS_CFG[status] ?? STATUS_CFG.draft;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full
                          text-[10px] font-bold uppercase tracking-wider border ${c.cls}`}>
            {c.dot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />}
            {c.label}
        </span>
    );
};

/* ─────────────────────────────────────────
   TOURNAMENT ROW
───────────────────────────────────────── */
const TournamentRow: React.FC<{
    t: any;
    href: string;
    hoverColor: string;
    right?: React.ReactNode;
}> = ({ t, href, hoverColor, right }) => (
    <Link to={href}>
        <div className="group flex items-center justify-between gap-3 p-4 rounded-xl
                        bg-[rgba(255,255,255,0.025)] border border-[rgba(255,255,255,0.05)]
                        transition-all hover:bg-[rgba(255,255,255,0.05)]"
             style={{ ['--hw' as any]: hoverColor }}>
            <div className="min-w-0">
                <div className="font-semibold text-sm text-white truncate
                                transition-colors group-hover:text-[var(--hw)]">
                    {t.name}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-[#7a5c5c]">
                    <Calendar size={10} />
                    {t.date} · {t.participants?.length ?? 0} jogadores
                </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                {right ?? <StatusBadge status={t.status} />}
            </div>
        </div>
    </Link>
);

/* ─────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────── */
const EmptyState: React.FC<{
    icon: React.ReactNode;
    title: string;
    sub: string;
    cta: string;
    onCta: () => void;
}> = ({ icon, title, sub, cta, onCta }) => (
    <div className="relative overflow-hidden rounded-2xl p-8 text-center group
                    border border-dashed border-[rgba(192,57,43,0.18)]
                    bg-[rgba(192,57,43,0.02)]">
        <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center
                        bg-[rgba(192,57,43,0.1)] border border-[rgba(192,57,43,0.2)]
                        group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <h3 className="text-sm font-bold text-white mb-1.5">{title}</h3>
        <p className="text-[#7a5c5c] text-xs mb-4 max-w-xs mx-auto leading-relaxed">{sub}</p>
        <button onClick={onCta}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white
                           hover:opacity-90 active:scale-[0.98] transition-all"
                style={{ background: 'linear-gradient(135deg,#c0392b,#e67e22)', boxShadow: '0 0 16px rgba(192,57,43,0.3)' }}>
            {cta}
        </button>
    </div>
);

/* ─────────────────────────────────────────
   LEAGUE DRAWER
───────────────────────────────────────── */
const LeagueDrawer: React.FC<{
    league: any | null;
    mode: 'view' | 'join' | 'create' | null;
    onClose: () => void;
    userId?: string;
}> = ({ league, mode, onClose, userId }) => {
    const navigate = useNavigate();
    const { joinLeagueByCode } = useLeagueStore();
    const [code, setCode]       = useState('');
    const [joining, setJoining] = useState(false);
    const open = mode !== null;

    const handleJoin = async () => {
        if (!code.trim()) { toast.error('Digite o código!'); return; }
        if (!userId) { toast.error('Faça login primeiro.'); return; }
        setJoining(true);
        try {
            const l = await joinLeagueByCode(code.trim().toUpperCase(), userId, '');
            toast.success(`Bem-vindo à liga "${l.name}"!`);
            onClose(); navigate(`/league/${l.id}`);
        } catch (err: any) { toast.error(err.message || 'Código inválido.'); }
        finally { setJoining(false); }
    };

    return (
        <>
            {/* overlay */}
            <div className={`fixed inset-0 z-40 transition-opacity duration-300
                             ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                 style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
                 onClick={onClose} />

            {/* sheet */}
            <div className={`fixed bottom-0 left-0 right-0 z-50 flex justify-center
                             transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                             ${open ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="w-full max-w-md relative overflow-hidden rounded-t-2xl"
                     style={{
                         background: 'linear-gradient(160deg,#120a08,#1a0d0a)',
                         border: '1px solid rgba(212,172,13,0.25)',
                         borderBottom: 'none',
                         boxShadow: '0 -8px 40px rgba(0,0,0,0.6)',
                     }}>
                    <div className="absolute top-0 left-[15%] right-[15%] h-px"
                         style={{ background: 'linear-gradient(90deg,transparent,rgba(212,172,13,0.6),transparent)' }} />

                    <div className="p-5">
                        <div className="w-9 h-1 rounded-full bg-white/10 mx-auto mb-4" />
                        <button onClick={onClose}
                                className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center
                                           justify-center text-[#7a5c5c] hover:text-white transition-colors"
                                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <X size={13} />
                        </button>

                        {/* VIEW */}
                        {mode === 'view' && league && (<>
                            <div className="text-2xl mb-2">{league.icon ?? '⚔️'}</div>
                            <div className="text-base font-bold text-white mb-0.5">{league.name}</div>
                            <div className="text-xs text-[#7a5c5c] mb-4">
                                {league.memberIds?.length ?? '—'} membros
                            </div>

                            <div className="grid grid-cols-3 gap-2 mb-4">
                                {[
                                    { val: league.tournamentIds?.length ?? 0, key: 'Torneios' },
                                    { val: league.standings?.find((s: any) => s.playerId === userId)?.totalPoints ?? '—', key: 'Seus pts' },
                                    { val: league.standings?.find((s: any) => s.playerId === userId)?.rank ? `#${league.standings.find((s: any) => s.playerId === userId).rank}` : '—', key: 'Posição' },
                                ].map((s, i) => (
                                    <div key={i} className="py-3 rounded-xl text-center"
                                         style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,172,13,0.1)' }}>
                                        <div className="text-base font-bold text-[#d4ac0d]">{s.val}</div>
                                        <div className="text-[9px] uppercase tracking-wider text-[#7a5c5c] mt-0.5">{s.key}</div>
                                    </div>
                                ))}
                            </div>

                            {(league.standings ?? []).length > 0 && (<>
                                <div className="text-[9px] uppercase tracking-[2px] font-bold text-[#7a5c5c] mb-2">
                                    Ranking Atual
                                </div>
                                <div className="flex flex-col gap-1.5 mb-4">
                                    {(league.standings ?? []).slice(0, 4).map((s: any, i: number) => {
                                        const isMe = s.playerId === userId;
                                        return (
                                            <div key={s.playerId}
                                                 className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
                                                 style={{
                                                     background: isMe ? 'rgba(192,57,43,0.08)' : 'rgba(255,255,255,0.025)',
                                                     border: `1px solid ${isMe ? 'rgba(192,57,43,0.25)' : 'rgba(212,172,13,0.08)'}`,
                                                 }}>
                                                <span className="text-sm w-5 text-center flex-shrink-0">
                                                    {i < 3 ? MEDALS[i] : <span className="text-[#7a5c5c] text-[10px]">#{i + 1}</span>}
                                                </span>
                                                <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
                                                    <img src={dicebear(s.playerId, 24)} alt="" className="w-full h-full" />
                                                </div>
                                                <span className={`text-xs font-semibold flex-1 ${isMe ? 'text-[#e74c3c]' : 'text-white'}`}>
                                                    {isMe ? 'Você' : s.playerName}
                                                </span>
                                                <span className="text-xs font-bold text-[#d4ac0d]">{s.totalPoints} pts</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>)}

                            <button onClick={() => { onClose(); navigate(`/league/${league.id}`); }}
                                    className="w-full py-3 rounded-xl text-sm font-bold text-white
                                               flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                                    style={{ background: 'linear-gradient(135deg,#c0392b,#e67e22,#d4ac0d)', boxShadow: '0 0 20px rgba(192,57,43,0.3)' }}>
                                Ver Liga Completa <ChevronRight size={14} />
                            </button>
                        </>)}

                        {/* JOIN */}
                        {mode === 'join' && (<>
                            <div className="text-2xl mb-3">🔑</div>
                            <div className="text-base font-bold text-white mb-1">Entrar em Liga</div>
                            <p className="text-xs text-[#7a5c5c] mb-5 leading-relaxed">
                                Digite o código recebido do organizador.
                            </p>
                            <label className="text-[9px] uppercase tracking-[1.5px] font-bold text-[#7a5c5c] block mb-2">
                                Código de Convite
                            </label>
                            <input value={code} onChange={e => setCode(e.target.value.toUpperCase())}
                                   placeholder="Ex: STORM42"
                                   className="w-full px-4 py-4 rounded-xl text-center font-mono text-2xl
                                              font-bold tracking-[6px] outline-none transition-all mb-4
                                              placeholder:tracking-normal placeholder:text-base
                                              placeholder:font-normal placeholder:text-[#7a5c5c]"
                                   style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,172,13,0.2)', color: '#d4ac0d' }} />
                            <button onClick={handleJoin} disabled={joining}
                                    className="w-full py-3 rounded-xl text-sm font-bold text-white
                                               flex items-center justify-center gap-2 hover:opacity-90
                                               disabled:opacity-60 transition-opacity"
                                    style={{ background: 'linear-gradient(135deg,#c0392b,#e67e22,#d4ac0d)', boxShadow: '0 0 20px rgba(192,57,43,0.3)' }}>
                                {joining ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <ArrowRight size={15} />}
                                {joining ? 'Entrando...' : 'Entrar na Liga'}
                            </button>
                        </>)}

                        {/* CREATE */}
                        {mode === 'create' && (<>
                            <div className="text-2xl mb-3">✨</div>
                            <div className="text-base font-bold text-white mb-1">Nova Liga</div>
                            <p className="text-xs text-[#7a5c5c] mb-5 leading-relaxed">
                                Configure pontuação, visibilidade e presets de formato na página completa.
                            </p>
                            <button onClick={() => { onClose(); navigate('/league/create'); }}
                                    className="w-full py-3 rounded-xl text-sm font-bold text-white
                                               flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                                    style={{ background: 'linear-gradient(135deg,#c0392b,#e67e22,#d4ac0d)', boxShadow: '0 0 20px rgba(192,57,43,0.3)' }}>
                                <Plus size={15} /> Criar Liga
                            </button>
                        </>)}
                    </div>
                </div>
            </div>
        </>
    );
};

/* ─────────────────────────────────────────
   LEAGUES ROW (scroll horizontal)
───────────────────────────────────────── */
const LeaguesRow: React.FC<{
    leagues: any[];
    userId?: string;
    isOrg: boolean;
    onOpen: (l: any | null, mode: 'view' | 'join' | 'create') => void;
}> = ({ leagues, userId, isOrg, onOpen }) => (
    <div>
        <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] uppercase tracking-[2px] font-bold text-[#7a5c5c]">
                {isOrg ? 'Ligas que Organizo' : 'Minhas Ligas'}
            </span>
            {!isOrg && (
                <button onClick={() => onOpen(null, 'join')}
                        className="text-[9px] font-bold text-[#d4ac0d] hover:underline">
                    + Entrar via código
                </button>
            )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>

            {leagues.map(l => {
                const standing = l.standings?.find((s: any) => s.playerId === userId);
                const pct = Math.min(((l.tournamentIds?.length ?? 0) / 10) * 100, 100);
                return (
                    <button key={l.id} onClick={() => onOpen(l, 'view')}
                            className="flex-shrink-0 w-40 p-3 rounded-2xl text-left transition-all
                                       hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(212,172,13,0.15)]"
                            style={{ background: 'linear-gradient(160deg,#120a08,#190d0a)', border: '1px solid rgba(212,172,13,0.2)' }}>
                        <div className="text-base mb-1.5">{l.icon ?? '⚔️'}</div>
                        <div className="text-xs font-bold text-[#d4ac0d] truncate mb-0.5">{l.name}</div>
                        <div className="text-[10px] text-[#7a5c5c] mb-2">
                            {l.memberIds?.length ?? '—'} membros
                        </div>
                        <div className="h-1 rounded-full bg-white/5 overflow-hidden mb-1.5">
                            <div className="h-full rounded-full"
                                 style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#c0392b,#e67e22,#d4ac0d)' }} />
                        </div>
                        {!isOrg && standing && (
                            <div className="text-[10px] font-bold text-[#d4ac0d]">
                                #{standing.rank ?? '—'} · {standing.totalPoints} pts
                            </div>
                        )}
                    </button>
                );
            })}

            {/* CTA card */}
            <button onClick={() => onOpen(null, isOrg ? 'create' : 'join')}
                    className="flex-shrink-0 w-32 rounded-2xl flex flex-col items-center
                               justify-center gap-2 transition-all hover:-translate-y-1"
                    style={{ minHeight: '116px', border: '1px dashed rgba(212,172,13,0.2)', background: 'rgba(212,172,13,0.02)' }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                     style={{ background: 'rgba(212,172,13,0.1)', border: '1px solid rgba(212,172,13,0.2)' }}>
                    {isOrg ? <Plus size={14} className="text-[#d4ac0d]" /> : <Key size={14} className="text-[#d4ac0d]" />}
                </div>
                <span className="text-[10px] font-bold text-[rgba(212,172,13,0.65)]">
                    {isOrg ? 'Nova Liga' : 'Entrar'}
                </span>
            </button>
        </div>
    </div>
);

/* ─────────────────────────────────────────
   MAIN
───────────────────────────────────────── */
const NewArea: React.FC = () => {
    const navigate = useNavigate();
    const { user, updateProfile }          = useAuthStore();
    const { tournaments, loadTournaments } = useTournamentStore();
    const { myLeagues, loadMyLeagues }     = useLeagueStore();

    const [isOrg, setIsOrg]       = useState(false);
    const [flipping, setFlipping] = useState(false);
    const [stats, setStats]       = useState<any>(null);
    const [drawerLeague, setDrawerLeague] = useState<any>(null);
    const [drawerMode, setDrawerMode]     = useState<'view' | 'join' | 'create' | null>(null);
    
    // New Modal State for Joining Tournaments
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [joinCode, setJoinCode]           = useState('');
    const [hideCompleted, setHideCompleted] = useState(false);
    const [search, setSearch]               = useState('');
    const [loading, setLoading]             = useState(false);

    useEffect(() => {
        loadTournaments();
        if (user) {
            tournamentService.getUserStats(user.id).then(setStats);
            loadMyLeagues(user.id);
        }
    }, [user, loadTournaments, loadMyLeagues]);

    /* dados derivados */
    const processList = (list: any[]) => {
        let res = [...list];
        if (hideCompleted) res = res.filter(t => t.status !== 'completed');
        if (search) res = res.filter(t => (t.name || '').toLowerCase().includes(search.toLowerCase()));
        
        // Ordenação: ongoing > registration > draft > completed
        const order: Record<string, number> = { 'ongoing': 0, 'registration': 1, 'draft': 2, 'completed': 3 };
        return res.sort((a, b) => (order[a.status] ?? 99) - (order[b.status] ?? 99));
    };

    const myTournaments            = processList(tournaments.filter(t => t.organizerId === user?.id));
    const participatingTournaments = processList(tournaments.filter(t => t.participants?.some((p: any) => p.playerId === user?.id)));
    const organizedCount           = tournaments.filter(t =>
        t.organizerId === user?.id &&
        t.status === 'completed' &&
        t.participants.filter((p: any) => !p.isAnonymous).length >= 4
    ).length;
    
    // Para ligas, hideCompleted esconde as com status 'finished'
    const processLeagues = (list: any[]) => {
        let res = [...list];
        if (hideCompleted) res = res.filter(l => l.status !== 'completed' && l.status !== 'finished');
        if (search) res = res.filter(l => (l.name || '').toLowerCase().includes(search.toLowerCase()));
        return res;
    };
    const playerLeagues = processLeagues((myLeagues ?? []).filter((l: any) => l.memberIds?.includes(user?.id)));
    const orgLeagues    = processLeagues((myLeagues ?? []).filter((l: any) => l.organizerId === user?.id));

    /* flip com fade */
    const handleFlip = (toOrg: boolean) => {
        if (toOrg === isOrg || flipping) return;
        setFlipping(true);
        setTimeout(() => { setIsOrg(toOrg); setFlipping(false); }, 300);
    };

    /* handlers — idênticos ao MyArea.tsx original */
    const handleTogglePublic = async () => {
        if (!user) return;
        try {
            await updateProfile({ isPublic: !user.isPublic });
            toast.success(`Perfil agora é ${!user.isPublic ? 'Público' : 'Privado'}`);
        } catch { toast.error('Erro ao atualizar privacidade.'); }
    };

    const handleDeleteTournament = async (e: React.MouseEvent, id: string) => {
        e.preventDefault(); e.stopPropagation();
        if (!window.confirm('Excluir este torneio? Esta ação não pode ser desfeita.')) return;
        try { await tournamentService.deleteTournament(id); toast.success('Torneio excluído!'); loadTournaments(); }
        catch { toast.error('Erro ao excluir torneio.'); }
    };

    const handleLeaveTournament = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm('Tem certeza que deseja sair das inscrições deste torneio?')) return;
        setLoading(true);
        try {
            await tournamentService.removeParticipant(id, user!.id);
            await loadTournaments();
        } catch (err: any) { alert(err.message); }
        finally { setLoading(false); }
    };

    const handleDropTournament = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm('Tem certeza que deseja DESISTIR (DROPAR) deste torneio? Isso é permanente (a menos que o organizador reative você).')) return;
        setLoading(true);
        try {
            await tournamentService.withdrawParticipant(id, user!.id);
            await loadTournaments();
        } catch (err: any) { alert(err.message); }
        finally { setLoading(false); }
    };

    /* cores dinâmicas por lado */
    const A = isOrg
        ? { pri: '#c4b5fd', border: 'rgba(139,92,246,0.3)', lo: 'rgba(139,92,246,0.12)', bg: 'linear-gradient(160deg,#0a0a14,#0f0d20)', pill: 'rgba(139,92,246,0.85)', energy: 'rgba(167,139,250,0.6)' }
        : { pri: '#e74c3c', border: 'rgba(192,57,43,0.3)',  lo: 'rgba(192,57,43,0.12)',  bg: 'linear-gradient(160deg,#130a0a,#1a0c0c)', pill: 'rgba(192,57,43,0.85)',  energy: 'rgba(231,76,60,0.6)' };

    return (
        <PageShell>
            <div className="container py-10 pb-28 animate-fade-in relative z-10">
                {loading && <LoadingScreen />}


                {/* ── TOGGLE ── */}
                <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
                    <div className="flex gap-1 p-1 rounded-full"
                         style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        {([
                            { label: '⚔️ Jogador',     org: false },
                            { label: '🛡️ Organizador', org: true  },
                        ] as const).map(({ label, org }) => (
                            <button key={String(org)} onClick={() => handleFlip(org)}
                                    className="px-5 py-2 rounded-full text-xs font-bold tracking-wide transition-all duration-300"
                                    style={{
                                        background:  isOrg === org ? A.pill     : 'transparent',
                                        color:       isOrg === org ? 'white'    : '#7a5c5c',
                                        border:      isOrg === org ? `1px solid ${A.border}` : '1px solid transparent',
                                        boxShadow:   isOrg === org ? `0 0 14px ${A.lo}` : 'none',
                                    }}>
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 min-w-[120px] relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a5c5c]" />
                        <input 
                            type="text"
                            placeholder="Buscar..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-white/5 border border-white/5 rounded-full pl-9 pr-4 py-2 text-xs text-white placeholder:text-[#7a5c5c] focus:outline-none focus:border-white/10 transition-all font-bold"
                        />
                    </div>

                    <button
                        onClick={() => setHideCompleted(!hideCompleted)}
                        className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${hideCompleted ? 'bg-[rgba(212,172,13,0.15)] text-[#d4ac0d] border-[rgba(212,172,13,0.3)]' : 'bg-white/5 text-[#7a5c5c] border-white/5'}`}
                    >
                        {hideCompleted ? '👁️ Ver' : '🙈 Ocultar'}
                    </button>
                </div>

                {/* ── MAIN CARD (fade no flip) ── */}
                <div style={{
                    transition: 'opacity 0.3s ease, transform 0.3s ease',
                    opacity:   flipping ? 0 : 1,
                    transform: flipping ? 'scale(0.97) translateY(6px)' : 'scale(1) translateY(0)',
                }}>
                    <div className="relative overflow-hidden rounded-2xl"
                         style={{
                             background: A.bg,
                             border: `1px solid ${A.border}`,
                             boxShadow: `0 20px 60px rgba(0,0,0,0.55), 0 0 40px ${A.lo}`,
                         }}>

                        {/* energia no topo */}
                        <div className="absolute top-0 left-[10%] right-[10%] h-px pointer-events-none"
                             style={{ background: `linear-gradient(90deg,transparent,${A.energy},transparent)` }} />

                        <div className="p-5 md:p-6">

                            {/* ── PERFIL ── */}
                            <div className="flex items-center gap-4 mb-5">
                                <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0"
                                     style={{ border: `2px solid ${A.border}`, boxShadow: `0 0 16px ${A.lo}` }}>
                                    {user?.avatar
                                        ? <img src={user.avatar} className="w-full h-full object-cover rounded-full" alt="" />
                                        : <img src={dicebear(user?.id ?? 'default', 56)} className="w-full h-full" alt="" />
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-semibold text-sm text-white">{user?.name}</span>
                                        <button onClick={handleTogglePublic}
                                                className="flex items-center gap-1 px-2 py-0.5 rounded-full
                                                           text-[9px] font-bold uppercase tracking-wider transition-all"
                                                style={{
                                                    background: user?.isPublic ? 'rgba(30,132,73,0.12)' : 'rgba(255,255,255,0.05)',
                                                    border: `1px solid ${user?.isPublic ? 'rgba(39,174,96,0.3)' : 'rgba(255,255,255,0.1)'}`,
                                                    color: user?.isPublic ? '#27ae60' : '#7a5c5c',
                                                }}>
                                            {user?.isPublic ? <Eye size={9} /> : <EyeOff size={9} />}
                                            {user?.isPublic ? 'Público' : 'Privado'}
                                        </button>
                                    </div>
                                    <div className="text-[11px] text-[#7a5c5c] mt-0.5">
                                        {isOrg
                                            ? `${myTournaments.length} torneios organizados`
                                            : `${participatingTournaments.length} torneios ativos`}
                                    </div>
                                </div>
                            </div>

                            {/* ── STATS ── */}
                            <div className="grid grid-cols-3 gap-2 mb-5">
                                {(isOrg ? [
                                    { label: 'Organizados', val: organizedCount, color: '#d4ac0d' },
                                    { label: 'Ativos',      val: myTournaments.filter(t => ['ongoing','registration'].includes(t.status)).length, color: A.pri },
                                    { label: 'Concluídos',  val: myTournaments.filter(t => t.status === 'completed').length, color: '#27ae60' },
                                ] : [
                                    { label: 'Participando', val: participatingTournaments.length, color: A.pri },
                                    { label: 'Vitórias',     val: stats?.wins ?? '—', color: '#d4ac0d' },
                                    { label: 'Winrate',      val: stats?.winRate ?? '0%', color: '#27ae60' },
                                ]).map((s, i) => (
                                    <div key={i} className="py-3 rounded-xl text-center"
                                         style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${A.lo}` }}>
                                        <div className="text-lg font-bold" style={{ color: s.color }}>{s.val}</div>
                                        <div className="text-[9px] uppercase tracking-wider text-[#7a5c5c] mt-0.5">{s.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* ══════════════════════ JOGADOR ══════════════════════ */}
                            {!isOrg && (<>
                                <button onClick={() => setShowJoinModal(true)}
                                        className="w-full py-2.5 rounded-xl text-sm font-bold text-white mb-5
                                                   flex items-center justify-center gap-2 hover:opacity-90
                                                   active:scale-[0.98] transition-all fp-btn-glint"
                                        style={{ background: 'linear-gradient(135deg,#c0392b,#e67e22)', boxShadow: '0 0 20px rgba(192,57,43,0.3)' }}>
                                    <Key size={15} /> Entrar com Código ou QR
                                </button>

                                <div className="text-[9px] uppercase tracking-[2px] font-bold text-[#7a5c5c] mb-2">
                                    Participando
                                </div>

                                <div className="flex flex-col gap-2 mb-5">
                                    {participatingTournaments.length === 0 ? (
                                        <EmptyState
                                            icon={<Search size={20} className="text-[#22d3ee]" />}
                                            title="Busque por batalhas"
                                            sub="Explore torneios abertos e inscreva-se para ganhar pontos."
                                            cta="Descobrir Torneios"
                                            onCta={() => navigate('/discover')}
                                        />
                                    ) : participatingTournaments.slice(0, 4).map(t => {
                                        const myPart = t.participants?.find((p: any) => p.playerId === user?.id);
                                        return (
                                            <TournamentRow
                                                key={t.id} t={t}
                                                href={`/tournament/${t.id}/public`}
                                                hoverColor="#22d3ee"
                                                right={
                                                    <div className="flex items-center gap-2">
                                                        {t.status === 'registration' && (
                                                            <button onClick={e => handleLeaveTournament(e, t.id)}
                                                                    className="p-1 text-[#fb7185] transition-colors opacity-60 group-hover:opacity-100">
                                                                <LogOut size={13} />
                                                            </button>
                                                        )}
                                                        {t.status === 'ongoing' && myPart?.status === 'active' && (
                                                            <button onClick={e => handleDropTournament(e, t.id)}
                                                                    className="p-1 text-[#fbbf24] transition-colors opacity-60 group-hover:opacity-100">
                                                                <Flag size={13} />
                                                            </button>
                                                        )}
                                                        <div className="text-right">
                                                            <div className="text-[9px] text-[#7a5c5c]">Pos.</div>
                                                            <div className="text-sm font-bold text-white">#{myPart?.rank ?? '—'}</div>
                                                        </div>
                                                    </div>
                                                }
                                            />
                                        );
                                    })}
                                    {participatingTournaments.length > 4 && (
                                        <button onClick={() => navigate('/discover')}
                                                className="text-xs text-[#7a5c5c] hover:text-[#e74c3c] transition-colors text-center py-1">
                                            Ver todos ({participatingTournaments.length}) →
                                        </button>
                                    )}
                                </div>

                                <LeaguesRow leagues={playerLeagues} userId={user?.id} isOrg={false} onOpen={(l, m) => { setDrawerLeague(l); setDrawerMode(m); }} />
                            </>)}

                            {/* ══════════════════════ ORGANIZADOR ══════════════════════ */}
                            {isOrg && (<>
                                <button onClick={() => navigate('/tournament/create')}
                                        className="w-full py-2.5 rounded-xl text-sm font-bold text-white mb-5
                                                   flex items-center justify-center gap-2 hover:opacity-90
                                                   active:scale-[0.98] transition-all"
                                        style={{ background: 'linear-gradient(135deg,#8b5cf6,#06b6d4)', boxShadow: '0 0 20px rgba(139,92,246,0.3)' }}>
                                    <Plus size={15} /> Criar Novo Torneio
                                </button>

                                <div className="text-[9px] uppercase tracking-[2px] font-bold text-[#7a5c5c] mb-2">
                                    Meus Torneios
                                </div>

                                <div className="flex flex-col gap-2 mb-5">
                                    {myTournaments.length === 0 ? (
                                        <EmptyState
                                            icon={<Zap size={20} className="text-[#c4b5fd]" />}
                                            title="Crie seu primeiro evento"
                                            sub="Rápido, fácil e totalmente automatizado."
                                            cta="Começar Agora"
                                            onCta={() => navigate('/tournament/create')}
                                        />
                                    ) : myTournaments.slice(0, 5).map(t => (
                                        <TournamentRow
                                            key={t.id} t={t}
                                            href={`/tournament/${t.id}`}
                                            hoverColor="#c4b5fd"
                                            right={
                                                <div className="flex items-center gap-2">
                                                    <button onClick={e => handleDeleteTournament(e, t.id)}
                                                            className="p-1 text-[#7a5c5c] hover:text-[#fb7185]
                                                                       transition-colors opacity-0 group-hover:opacity-100">
                                                        <Trash2 size={13} />
                                                    </button>
                                                    <StatusBadge status={t.status} />
                                                </div>
                                            }
                                        />
                                    ))}
                                    {myTournaments.length > 5 && (
                                        <button className="text-xs text-[#7a5c5c] hover:text-[#c4b5fd] transition-colors text-center py-1">
                                            Ver todos ({myTournaments.length}) →
                                        </button>
                                    )}
                                </div>

                                <LeaguesRow leagues={orgLeagues} userId={user?.id} isOrg={true} onOpen={(l, m) => { setDrawerLeague(l); setDrawerMode(m); }} />
                            </>)}

                        </div>
                    </div>
                </div>

                <div className="mt-10 mx-auto max-w-2xl">
                    <AdsterraBanner />
                </div>
            </div>

            {/* DRAWER */}
            <LeagueDrawer
                league={drawerLeague}
                mode={drawerMode}
                onClose={() => setDrawerMode(null)}
                userId={user?.id}
            />

            {/* ── MODAL: JOIN TOURNAMENT ── */}
            <Modal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)} title="Entrar em Torneio">
                <div className="flex flex-col gap-5 p-2">
                    <p className="text-[#a07070] text-sm text-center">
                        Digite o código de convite ou ID do torneio fornecido pelo organizador.
                    </p>
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase font-bold text-[#7a5c5c] ml-1">Código do Torneio</label>
                        <input
                            type="text"
                            placeholder="Ex: abc-123-xyz..."
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value)}
                            className="w-full px-4 py-4 rounded-xl text-center
                                       font-mono text-base font-bold text-[#e74c3c]
                                       bg-[rgba(255,255,255,0.04)] border border-[rgba(192,57,43,0.2)]
                                       focus:outline-none focus:border-[rgba(231,76,60,0.5)]
                                       focus:ring-2 focus:ring-[rgba(192,57,43,0.1)]
                                       placeholder:text-[#7a5c5c] placeholder:tracking-normal
                                       placeholder:text-sm placeholder:font-normal
                                       transition-all"
                        />
                    </div>
                    <button
                        onClick={() => {
                            if (!joinCode.trim()) {
                                toast.error('Digite um código válido.');
                                return;
                            }
                            setShowJoinModal(false);
                            navigate(`/join/${joinCode.trim()}`);
                        }}
                        className="w-full py-3.5 rounded-xl font-bold text-sm text-white
                                   flex items-center justify-center gap-2
                                   bg-gradient-to-r from-[#c0392b] to-[#e67e22]
                                   hover:opacity-90 active:scale-[0.98] transition-all
                                   shadow-[0_0_24px_rgba(192,57,43,0.3)]">
                        Avançar <ArrowRight size={16} />
                    </button>
                </div>
            </Modal>
        </PageShell>
    );
};

export default NewArea;
