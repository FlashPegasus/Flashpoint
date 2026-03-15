import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { ResultStatus } from '../types';
import { Play, CheckCircle2, Trophy, Plus, UserMinus, ChevronRight, Copy, Check, Clock, RefreshCw, Globe, Settings, Users, Swords, BarChart3, Crown, Medal, Search, UserPlus } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import PageShell from '../components/layout';
import { Button, Input, Modal, LoadingScreen } from '../components/ui';
import { useTournamentStore } from '../features/tournaments/tournamentStore';
import { useAuthStore } from '../features/auth/authStore';
import { tournamentService } from '../features/tournaments/tournamentService';
import { syncService } from '../features/tournaments/syncService';
import { Breadcrumbs } from '../components/ui';
import { useLeagueStore } from '../features/leagues/leagueStore';
import { getInviteLink, copyToClipboard } from '../utils/inviteHelper';
import { MatchCard } from '../features/tournaments/components/MatchCard';
import { IconStartTournament, IconSubmitResults } from '../assets/icons';
import toast from 'react-hot-toast';

/* ─── helpers ─── */
const statusLabel = (s: string) =>
    s === 'draft' ? 'Rascunho' : s === 'registration' ? 'Inscrições Abertas' : s === 'ongoing' ? 'Em Andamento' : 'Concluído';

const formatLabel = (f: string) =>
    f === 'multiplayer' ? 'Multijogador' : '1 vs 1';

const dicebearUrl = (seed: string, size = 36) =>
    `https://api.dicebear.com/7.x/rings/svg?seed=${encodeURIComponent(seed)}&size=${size}`;

const TABS = [
    { id: 'participants', label: 'Participantes', icon: <Users size={15} /> },
    { id: 'rounds',       label: 'Rodadas',       icon: <Swords size={15} /> },
    { id: 'standings',    label: 'Classificação', icon: <BarChart3 size={15} /> },
    { id: 'settings',     label: 'Config',        icon: <Settings size={15} /> },
] as const;

type TabId = typeof TABS[number]['id'];

/* ─── sub-components ─── */

/** Pílula de status do torneio */
function StatusPill({ status }: { status: string }) {
    const cfg: Record<string, { cls: string; dot: string }> = {
        draft:        { cls: 'bg-white/5 text-white/40 border-white/10',                       dot: 'bg-white/30' },
        registration: { cls: 'bg-[var(--fp-purple-lo)] text-[var(--fp-purple-hi)] border-[rgba(139,92,246,0.3)]', dot: 'bg-[var(--fp-purple)]' },
        ongoing:      { cls: 'bg-[var(--fp-emerald-lo)] text-[var(--fp-emerald-hi)] border-[rgba(16,185,129,0.3)]', dot: 'bg-[var(--fp-emerald)] animate-[livePulse_1.5s_ease-in-out_infinite]' },
        completed:    { cls: 'bg-[var(--fp-gold-lo)] text-[var(--fp-gold-hi)] border-[rgba(245,158,11,0.3)]',  dot: 'bg-[var(--fp-gold)]' },
    };
    const c = cfg[status] ?? cfg.draft;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider ${c.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
            {statusLabel(status)}
        </span>
    );
}

/** Timer com estilo relógio */
function RoundTimer({ timeLeft }: { timeLeft: string }) {
    if (!timeLeft) return null;
    const urgent = timeLeft <= '05:00';
    return (
        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border font-mono font-bold text-sm transition-all
            ${urgent
                ? 'bg-[var(--fp-rose-lo)] border-[rgba(244,63,94,0.4)] text-[var(--fp-rose-hi)] animate-pulse'
                : 'bg-[var(--fp-purple-lo)] border-[rgba(139,92,246,0.3)] text-[var(--fp-purple-hi)]'
            }`}>
            <Clock size={13} />
            {timeLeft}
        </div>
    );
}

/* ─── main component ─── */
const TournamentDashboard: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const {
        activeTournament, loadTournament, isLoading, addParticipant,
        generateRound, regenerateRound, submitResult, withdrawParticipant,
        completeTournament, publishTournament, toggleCheckIn
    } = useTournamentStore();
    const { myLeagues, loadMyLeagues, linkTournament } = useLeagueStore();
    const [activeTab, setActiveTab] = useState<TabId>('participants');

    /* ── check-in ── */
    const handleToggleCheckIn = async () => {
        if (!id || !user || !activeTournament) return;
        const participant = activeTournament.participants.find(p => p.playerId === user.id);
        if (!participant) return;
        try {
            await toggleCheckIn(id, user.id, !participant.checkedIn);
            toast.success(participant.checkedIn ? 'Check-in cancelado.' : 'Check-in realizado com sucesso!');
        } catch {
            toast.error('Erro ao realizar check-in.');
        }
    };

    useEffect(() => {
        if (user?.id && !user.isAnonymous) loadMyLeagues(user.id);
    }, [user, loadMyLeagues]);

    const [newPlayerName, setNewPlayerName] = useState('');
    const [linkCopied, setLinkCopied] = useState(false);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [selectedTable, setSelectedTable] = useState<{ round: number; table: any } | null>(null);
    const [participantSearch, setParticipantSearch] = useState('');
    const [tempResults, setTempResults] = useState<Record<string, string>>({});

    /* ── load + sync ── */
    useEffect(() => {
        if (id) {
            loadTournament(id);
            // Sync subscribe
            const unsubscribe = syncService.subscribe(id, () => {
                loadTournament(id);
            });
            return () => unsubscribe();
        }
    }, [id, loadTournament]);

    /* ── timer ── */
    const [timeLeft, setTimeLeft] = useState('');
    useEffect(() => {
        if (!activeTournament?.currentRoundEndTime || activeTournament.status !== 'ongoing') {
            setTimeLeft(''); return;
        }
        const interval = setInterval(() => {
            const diff = new Date(activeTournament.currentRoundEndTime!).getTime() - Date.now();
            if (diff <= 0) { setTimeLeft('00:00'); clearInterval(interval); return; }
            const m = Math.floor(diff / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            if (m === 5 && s === 0) toast('Faltam 5 minutos para o fim do round!', { icon: '⏰', duration: 5000 });
            setTimeLeft(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
        }, 1000);
        return () => clearInterval(interval);
    }, [activeTournament?.currentRoundEndTime, activeTournament?.status]);

    /* ── early returns ── */
    if (isLoading && !activeTournament) return <LoadingScreen message="Carregando torneio..." />;
    if (!activeTournament) return (
        <PageShell>
            <div className="container py-16 text-center text-[var(--fp-muted)]">Torneio não encontrado.</div>
        </PageShell>
    );

    const isOrganizer = activeTournament.organizerId === user?.id;
    const inviteUrl   = id ? getInviteLink('tournament', id) : '';

    /* ── handlers ── */
    const handleAddPlayer = async () => {
        if (!newPlayerName.trim() || !id) return;
        try {
            await addParticipant(id, { name: newPlayerName.trim() });
            setNewPlayerName('');
            toast.success('Jogador adicionado!');
        } catch (err: any) {
            toast.error(err.message || 'Erro ao adicionar jogador.');
        }
    };

    const handleCopyLink = async () => {
        const ok = await copyToClipboard(inviteUrl, 'Link de convite copiado!');
        if (ok) { setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2000); }
    };

    const handleOpenResultModal = (roundNum: number, table: any) => {
        setSelectedTable({ round: roundNum, table });
        const init: Record<string, string> = {};
        table.playerIds.forEach((pid: string) => { init[pid] = 'ELIMINATED'; });
        setTempResults(init as any);
    };

    const handleSubmitTableResults = () => {
        if (!id || !selectedTable) return;
        const msg = activeTournament.format === 'multiplayer'
            ? 'Confirmar os resultados desta mesa?' : 'Confirmar vencedor desta partida?';
        if (!window.confirm(msg)) return;
        
        const results = selectedTable.table.playerIds.map((pid: string) => {
            const statusValue = tempResults[pid] as unknown as ResultStatus;
            let pts = 0;
            if (statusValue === 'WINNER' || statusValue === 'BYE') pts = 5;
            else if (statusValue === 'SURVIVED') pts = 2;
            
            return { playerId: pid, status: statusValue, points: pts };
        });

        submitResult(id, selectedTable.round, selectedTable.table.id, results)
            .then(() => toast.success('Resultados salvos!'))
            .catch(() => toast.error('Erro ao salvar resultados.'));
        setSelectedTable(null);
    };

    const handleCancelTournament = async () => {
        if (!window.confirm('Tem certeza que deseja cancelar e excluir este torneio permanentemente?')) return;
        if (!id) return;
        try {
            await tournamentService.deleteTournament(id);
            toast.success('Torneio cancelado.');
            navigate('/my-area');
        } catch {
            toast.error('Erro ao excluir torneio.');
        }
    };

    /* ── render ── */
    return (
        <PageShell>
            <div className="container py-8 pb-28">

                {/* ── BREADCRUMBS ── */}
                <div className="flex items-center gap-2 mb-6">
                    <Breadcrumbs items={[
                        { label: 'Minha Área', path: '/my-area' },
                        { label: activeTournament.name }
                    ]} />
                </div>

                {/* ══════════════════════════════════════════
                    HEADER
                ══════════════════════════════════════════ */}
                <div className="relative overflow-hidden rounded-2xl mb-8 mt-4
                                bg-[var(--fp-glass-mid)] border border-[var(--fp-border-hi)]
                                backdrop-blur-[20px] shadow-[var(--fp-shadow-lg)]">

                    {/* Glow de fundo */}
                    <div className="absolute inset-0 pointer-events-none"
                         style={{ background: 'radial-gradient(ellipse at 0% 50%, rgba(139,92,246,0.12) 0%, transparent 60%), radial-gradient(ellipse at 100% 50%, rgba(6,182,212,0.08) 0%, transparent 60%)' }} />

                    <div className="relative flex flex-wrap items-start justify-between gap-6 p-6 md:p-8">
                        {/* Info */}
                        <div>
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                <StatusPill status={activeTournament.status} />
                                <span className="text-[var(--fp-muted)] text-xs font-medium px-2 py-1 bg-white/5 rounded-full border border-white/5">
                                    {formatLabel(activeTournament.format)}
                                </span>
                                {timeLeft && <RoundTimer timeLeft={timeLeft} />}
                            </div>

                            <h1 className="font-[var(--fp-font-display)] text-3xl md:text-4xl text-[var(--fp-text-hi)] mb-1 leading-tight">
                                {activeTournament.name}
                            </h1>
                            <p className="text-[var(--fp-muted)] text-sm">
                                {activeTournament.date}
                                {activeTournament.location && (
                                    <> · <span className="text-[var(--fp-subtle)]">{activeTournament.location}</span></>
                                )}
                            </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap gap-2">
                            {isOrganizer && activeTournament.status === 'draft' && (
                                <button className="fp-btn-primary px-5 py-2 rounded-xl flex items-center gap-2 text-sm"
                                        onClick={() => id && publishTournament(id)}>
                                    <CheckCircle2 size={16} /> Publicar
                                </button>
                            )}
                            {isOrganizer && activeTournament.status === 'registration' && (
                                <button className="fp-btn-primary px-5 py-2 rounded-xl flex items-center gap-2 text-sm"
                                        onClick={() => id && generateRound(id)}>
                                    <IconStartTournament size={16} /> Iniciar 1ª Rodada
                                </button>
                            )}
                            {isOrganizer && activeTournament.status === 'ongoing'
                                && activeTournament.rounds.every(r => r.status === 'completed') && (
                                <button className="px-5 py-2 rounded-xl flex items-center gap-2 text-sm font-bold
                                                   bg-[var(--fp-rose-lo)] border border-[rgba(244,63,94,0.4)]
                                                   text-[var(--fp-rose-hi)] hover:bg-[rgba(244,63,94,0.2)] transition-colors"
                                        onClick={() => id && completeTournament(id)}>
                                    <CheckCircle2 size={16} /> Finalizar Torneio
                                </button>
                            )}
                            {isOrganizer && activeTournament.status === 'ongoing'
                                && !activeTournament.currentRoundEndTime && (
                                <button className="fp-btn-ghost px-4 py-2 rounded-xl flex items-center gap-2 text-sm"
                                        onClick={async () => {
                                            const dur = prompt('Duração do round em minutos:', '50');
                                            if (dur && id) {
                                                const t = await tournamentService.getTournamentById(id);
                                                if (t) {
                                                    await tournamentService.saveTournament({
                                                        ...t,
                                                        currentRoundEndTime: new Date(Date.now() + parseInt(dur) * 60000).toISOString()
                                                    });
                                                    loadTournament(id);
                                                }
                                            }
                                        }}>
                                    <Clock size={15} /> Timer
                                </button>
                            )}
                            {!isOrganizer && activeTournament.status === 'registration'
                                && activeTournament.participants.some(p => p.playerId === user?.id) && (
                                <button
                                    onClick={handleToggleCheckIn}
                                    className={`px-5 py-2 rounded-xl flex items-center gap-2 text-sm font-bold transition-all
                                        ${activeTournament.participants.find(p => p.playerId === user?.id)?.checkedIn
                                            ? 'bg-[var(--fp-emerald-lo)] border border-[rgba(16,185,129,0.3)] text-[var(--fp-emerald-hi)]'
                                            : 'fp-btn-primary'
                                        }`}>
                                    {activeTournament.participants.find(p => p.playerId === user?.id)?.checkedIn
                                        ? <><CheckCircle2 size={15} /> Presença Confirmada</>
                                        : 'Confirmar Presença'
                                    }
                                </button>
                            )}
                            <button className="fp-btn-ghost px-4 py-2 rounded-xl flex items-center gap-2 text-sm"
                                    onClick={() => navigate(`/tournament/${id}/public`)}>
                                <Globe size={15} /> Público
                            </button>
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════════════
                    TABS
                ══════════════════════════════════════════ */}
                <div className="flex gap-1 p-1 mb-8 w-max max-w-full overflow-x-auto
                                bg-white/[0.03] border border-[var(--fp-border)] rounded-2xl
                                scrollbar-none">
                    {TABS.map(tab => (
                        <button key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold
                                        whitespace-nowrap transition-all duration-200
                                        ${activeTab === tab.id
                                            ? 'bg-[var(--fp-purple)] text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]'
                                            : 'text-[var(--fp-muted)] hover:text-[var(--fp-text)]'
                                        }`}>
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ══════════════════════════════════════════
                    TAB: PARTICIPANTES
                ══════════════════════════════════════════ */}
                {activeTab === 'participants' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">

                        {/* Lista */}
                        <div className="md:col-span-2">
                            <div className="fp-card p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-[var(--fp-text)]">
                                        Participantes
                                        <span className="ml-2 px-2 py-0.5 bg-white/5 rounded-full text-xs text-[var(--fp-muted)]">
                                            {activeTournament.participants.length}
                                        </span>
                                    </h3>
                                    <div className="relative w-full max-w-[200px]">
                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fp-muted)]" />
                                        <input
                                            type="text"
                                            placeholder="Buscar..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-[var(--fp-text)] focus:outline-none focus:border-[var(--fp-purple)] transition-colors"
                                            value={participantSearch}
                                            onChange={(e) => setParticipantSearch(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {activeTournament.participants.length === 0 ? (
                                    <div className="py-12 text-center text-[var(--fp-muted)]">
                                        <Users size={36} className="mx-auto mb-3 opacity-20" />
                                        <p className="text-sm">Nenhum jogador inscrito ainda.</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-1.5">
                                        {activeTournament.participants
                                            .filter(p => p.name.toLowerCase().includes(participantSearch.toLowerCase()) || p.commanderName?.toLowerCase().includes(participantSearch.toLowerCase()))
                                            .map((p, _i) => (
                                            <div key={p.playerId}
                                                 className="flex justify-between items-center p-3 rounded-xl
                                                            bg-white/[0.03] border border-white/[0.05]
                                                            hover:bg-white/[0.06] transition-colors group">
                                                <div className="flex items-center gap-3">
                                                    {/* Avatar */}
                                                    <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10 flex-shrink-0 bg-white/5">
                                                        {p.avatar
                                                            ? <img src={p.avatar} className="w-full h-full object-cover" alt="" />
                                                            : <img src={dicebearUrl(p.playerId || p.name)} className="w-full h-full" alt="" />
                                                        }
                                                    </div>
                                                    {/* Info */}
                                                    <div>
                                                        <div className="flex items-center gap-2 text-sm font-medium">
                                                            <span className={p.status === 'withdrawn' ? 'text-[var(--fp-muted)] line-through' : 'text-[var(--fp-text)]'}>
                                                                {p.name}
                                                            </span>
                                                            {p.checkedIn && (
                                                                <CheckCircle2 size={12} className="text-[var(--fp-emerald)]" />
                                                            )}
                                                            {p.status === 'withdrawn' && (
                                                                <span className="text-[10px] font-bold uppercase text-white/30 px-2 py-0.5 bg-white/5 rounded-full">
                                                                    Retirado
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            {p.commanderName && (
                                                                <span className="text-[10px] text-[var(--fp-purple-hi)] font-bold uppercase tracking-tight">
                                                                    ⚔️ {p.commanderName}
                                                                </span>
                                                            )}
                                                            {p.decklistUrl && (
                                                                <a href={p.decklistUrl} target="_blank" rel="noopener noreferrer"
                                                                   className="text-[10px] text-[var(--fp-cyan)] underline font-bold uppercase tracking-tight">
                                                                    Lista
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {p.commanderImageUrl && (
                                                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10
                                                                        group-hover:scale-150 transition-transform origin-right z-10">
                                                            <img src={p.commanderImageUrl} className="w-full h-full object-cover" alt="" />
                                                        </div>
                                                    )}
                                                    {isOrganizer && p.status === 'active' && (
                                                        <button onClick={() => id && withdrawParticipant(id, p.playerId)}
                                                                className="text-[var(--fp-muted)] hover:text-[var(--fp-rose)] transition-colors">
                                                            <UserMinus size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="flex flex-col gap-4">
                            {isOrganizer && activeTournament.status !== 'completed' && (
                                <div className="fp-card p-5">
                                    <h4 className="text-sm font-semibold text-[var(--fp-text)] mb-4">Adicionar Jogador</h4>
                                    <div className="flex flex-col gap-3">
                                        <Input
                                            placeholder="Nome do jogador"
                                            value={newPlayerName}
                                            onChange={e => setNewPlayerName(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleAddPlayer()}
                                        />
                                        <button className="fp-btn-primary w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm"
                                                onClick={handleAddPlayer}>
                                            <Plus size={16} /> Adicionar
                                        </button>
                                        
                                        {!activeTournament.participants.some(p => p.playerId === user?.id) && (
                                            <button 
                                                className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold bg-white/5 border border-white/10 text-[var(--fp-purple-hi)] hover:bg-white/10 transition-all mt-1"
                                                onClick={async () => {
                                                    if (!user || !id) return;
                                                    try {
                                                        await addParticipant(id, {
                                                            playerId: user.id,
                                                            name: user.name
                                                        });
                                                        toast.success('Você entrou no seu torneio!');
                                                    } catch (err: any) {
                                                        toast.error(err.message || 'Erro ao entrar.');
                                                    }
                                                }}
                                            >
                                                <UserPlus size={16} /> Participar do meu Torneio
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {isOrganizer && (activeTournament.status === 'registration' ||
                                (activeTournament.status === 'ongoing' && activeTournament.allowLateRegistration)) && (
                                <div className="fp-card p-5">
                                    <h4 className="text-sm font-semibold text-[var(--fp-text)] mb-4">Convite Automático</h4>
                                    <div className="flex flex-col items-center gap-4">
                                        <button onClick={() => setIsQRModalOpen(true)}
                                                className="p-3 bg-white rounded-2xl hover:scale-105 transition-transform cursor-zoom-in shadow-lg">
                                            <QRCodeSVG value={inviteUrl} size={130} />
                                            <p className="text-[10px] text-zinc-500 mt-2 text-center font-bold uppercase">
                                                Clique para ampliar
                                            </p>
                                        </button>
                                        <button onClick={handleCopyLink}
                                                className="fp-btn-ghost w-full py-2 rounded-xl flex items-center justify-center gap-2 text-sm">
                                            {linkCopied ? <Check size={15} /> : <Copy size={15} />}
                                            {linkCopied ? 'Copiado!' : 'Copiar Link'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ══════════════════════════════════════════
                    TAB: RODADAS
                ══════════════════════════════════════════ */}
                {activeTab === 'rounds' && (
                    <div className="flex flex-col gap-8 animate-fade-in">
                        {activeTournament.rounds.length === 0 ? (
                            <div className="fp-card p-12 text-center">
                                <Play size={44} className="mx-auto mb-4 text-[var(--fp-muted)] opacity-20" />
                                <h3 className="text-xl font-semibold mb-2">Torneio ainda não começou</h3>
                                <p className="text-[var(--fp-muted)] text-sm mb-6">
                                    Adicione participantes e inicie a primeira rodada.
                                </p>
                                {isOrganizer && (
                                    <button className="fp-btn-primary px-6 py-2.5 rounded-xl text-sm"
                                            onClick={() => id && generateRound(id)}>
                                        Gerar 1ª Rodada
                                    </button>
                                )}
                            </div>
                        ) : (
                            [...activeTournament.rounds].reverse().map(round => (
                                <div key={round.number} className="flex flex-col gap-4">
                                    {/* Cabeçalho da rodada */}
                                    <div className="flex items-center justify-between px-1">
                                        <h3 className="text-xl font-semibold text-[var(--fp-text)]">
                                            Rodada {round.number}
                                        </h3>
                                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase border
                                            ${round.status === 'completed'
                                                ? 'bg-[var(--fp-emerald-lo)] text-[var(--fp-emerald-hi)] border-[rgba(16,185,129,0.3)]'
                                                : 'bg-[var(--fp-purple-lo)] text-[var(--fp-purple-hi)] border-[rgba(139,92,246,0.3)]'
                                            }`}>
                                            {round.status === 'completed' && <CheckCircle2 size={12} />}
                                            {round.status === 'completed' ? 'Concluída' : 'Pendente'}
                                        </span>
                                    </div>

                                    {/* Match cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {round.tables.map((table, idx) => (
                                            <MatchCard
                                                key={table.id}
                                                idx={idx}
                                                table={table}
                                                participants={activeTournament.participants}
                                                isOrganizer={isOrganizer && activeTournament.status !== 'completed'}
                                                status={table.status === 'completed' ? 'completed' : 'pending'}
                                                onEnterResult={() => handleOpenResultModal(round.number, table)}
                                                roundNumber={round.number}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}

                        {/* Próxima rodada */}
                        {isOrganizer
                            && activeTournament.rounds.every(r => r.status === 'completed')
                            && activeTournament.rounds.length > 0
                            && activeTournament.status === 'ongoing' && (
                            <button className="fp-btn-primary self-center px-7 py-3 rounded-xl flex items-center gap-2 mt-2"
                                    onClick={() => id && generateRound(id)}>
                                Próxima Rodada <ChevronRight size={16} />
                            </button>
                        )}

                        {/* Regerar rodada */}
                        {isOrganizer
                            && activeTournament.status === 'ongoing'
                            && activeTournament.rounds.length > 0
                            && activeTournament.rounds[activeTournament.rounds.length - 1].status === 'pending' && (
                            <div className="mt-4 flex flex-col items-center gap-2 border-t border-white/5 pt-6">
                                <p className="text-[10px] text-[var(--fp-muted)] mb-1">
                                    Problemas no pareamento? Regere a rodada atual.
                                </p>
                                <button
                                    onClick={() => {
                                        if (window.confirm('Regerar esta rodada? Resultados não salvos serão perdidos.'))
                                            id && regenerateRound(id);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                                               text-yellow-400 border border-yellow-500/20
                                               hover:bg-yellow-500/10 transition-colors">
                                    <RefreshCw size={13} /> Regerar Rodada
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ══════════════════════════════════════════
                    TAB: CLASSIFICAÇÃO
                ══════════════════════════════════════════ */}
                {activeTab === 'standings' && (
                    <div className="flex flex-col gap-8 animate-fade-in">

                        {/* Pódio (só torneios concluídos) */}
                        {activeTournament.status === 'completed' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                                {[2, 1, 3].map(pos => {
                                    const sorted = [...activeTournament.participants].sort((a, b) => (a.rank || 99) - (b.rank || 99));
                                    const p = sorted[pos - 1];
                                    if (!p) return null;
                                    const cfg: Record<number, { grad: string; border: string; label: string; scale: string }> = {
                                        1: { grad: 'linear-gradient(135deg,rgba(245,158,11,0.18),rgba(251,191,36,0.06))', border: 'rgba(245,158,11,0.4)', label: 'Campeão', scale: 'md:scale-105 order-1 md:order-2' },
                                        2: { grad: 'linear-gradient(135deg,rgba(148,163,184,0.12),rgba(100,116,139,0.04))', border: 'rgba(148,163,184,0.3)', label: '2º Lugar', scale: 'order-2 md:order-1' },
                                        3: { grad: 'linear-gradient(135deg,rgba(180,120,80,0.12),rgba(120,80,50,0.04))', border: 'rgba(180,120,80,0.3)', label: '3º Lugar', scale: 'order-3' },
                                    };
                                    const c = cfg[pos];
                                    return (
                                        <div key={pos}
                                             className={`fp-card p-6 flex flex-col items-center gap-4 ${c.scale}`}
                                             style={{ background: c.grad, borderColor: c.border }}>
                                            <div className="w-16 h-16 rounded-full overflow-hidden border-2"
                                                 style={{ borderColor: c.border }}>
                                                <img src={dicebearUrl(p.playerId || p.name, 64)} className="w-full h-full" alt="" />
                                            </div>
                                            <div className="text-center">
                                                <div className="font-semibold text-[var(--fp-text)]">{p.name}</div>
                                                <div className="text-[var(--fp-muted)] text-xs mt-0.5">{p.totalPoints} pts · BH {p.buchholz}</div>
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white/5 flex items-center gap-1.5"
                                                  style={{ color: c.border.replace('0.', '0.8').replace('rgba', 'rgba') }}>
                                                {pos === 1 ? <Crown size={12} /> : <Medal size={12} />} {c.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Tabela */}
                        <div className="fp-card overflow-hidden">
                            <div className="px-5 py-4 border-b border-[var(--fp-border)]">
                                <h3 className="font-semibold text-[var(--fp-text)]">
                                    {activeTournament.status === 'completed' ? 'Classificação Final' : 'Classificação Atual'}
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-[var(--fp-muted)] text-[11px] uppercase tracking-wider font-bold border-b border-[var(--fp-border)]">
                                            <th className="py-3 px-5">#</th>
                                            <th className="py-3 px-3">Jogador</th>
                                            <th className="py-3 px-3">Pts</th>
                                            <th className="py-3 px-3">BH</th>
                                            <th className="py-3 px-5 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activeTournament.participants.map((p, idx) => (
                                            <tr key={p.playerId}
                                                className="border-b border-[var(--fp-border-lo)] hover:bg-white/[0.03] transition-colors">
                                                <td className="py-3 px-5 text-sm font-bold">
                                                    <div className="flex items-center gap-1.5">
                                                        {idx === 0 && <Crown size={13} className="text-[var(--fp-gold)]" />}
                                                        {idx === 1 && <Medal size={13} className="text-[#94a3b8]" />}
                                                        {idx === 2 && <Medal size={13} className="text-[#cd7c3a]" />}
                                                        <span className={idx < 3 ? 'text-[var(--fp-text-hi)]' : 'text-[var(--fp-muted)]'}>
                                                            #{idx + 1}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <div className="flex items-center gap-2">
                                                        <img src={dicebearUrl(p.playerId || p.name, 28)}
                                                             className="w-7 h-7 rounded-full border border-white/10" alt="" />
                                                        <span className="text-sm font-medium text-[var(--fp-text)]">{p.name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-3 font-bold text-[var(--fp-text-hi)] text-sm">{p.totalPoints}</td>
                                                <td className="py-3 px-3 text-[var(--fp-muted)] text-sm">{p.buchholz || 0}</td>
                                                <td className="py-3 px-5 text-right">
                                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full
                                                        ${p.status === 'active'
                                                            ? 'bg-[var(--fp-emerald-lo)] text-[var(--fp-emerald-hi)]'
                                                            : 'bg-[var(--fp-rose-lo)] text-[var(--fp-rose-hi)]'
                                                        }`}>
                                                        {p.status === 'active' ? 'Ativo' : 'Retirado'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ══════════════════════════════════════════
                    TAB: CONFIGURAÇÕES
                ══════════════════════════════════════════ */}
                {activeTab === 'settings' && (
                    <div className="max-w-xl animate-fade-in">
                        <div className="fp-card p-6">
                            <h3 className="font-semibold text-[var(--fp-text)] mb-1">Configurações do Torneio</h3>
                            <p className="text-[var(--fp-muted)] text-sm mb-6">Gerenciamento administrativo do evento.</p>

                            {/* Info cards */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="p-4 bg-white/[0.03] border border-[var(--fp-border)] rounded-xl">
                                    <span className="text-[11px] text-[var(--fp-muted)] uppercase tracking-wider block mb-1">Formato</span>
                                    <p className="font-bold text-[var(--fp-text)]">{formatLabel(activeTournament.format)}</p>
                                </div>
                                <div className="p-4 bg-white/[0.03] border border-[var(--fp-border)] rounded-xl">
                                    <span className="text-[11px] text-[var(--fp-muted)] uppercase tracking-wider block mb-1">Status</span>
                                    <p className="font-bold" style={{ color: 'var(--fp-purple-hi)' }}>{statusLabel(activeTournament.status)}</p>
                                </div>
                            </div>

                            {/* League linking */}
                            {isOrganizer && (
                                <div className="mb-6 p-4 bg-white/[0.03] border border-[var(--fp-border)] rounded-2xl">
                                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                        <Trophy size={14} className="text-[var(--fp-gold)]" /> Vincular a Liga
                                    </h4>
                                    {activeTournament.leagueId ? (
                                        <p className="text-sm text-[var(--fp-emerald-hi)] font-medium">
                                            ✅ Torneio vinculado a uma liga.
                                        </p>
                                    ) : myLeagues.length === 0 ? (
                                        <p className="text-sm text-[var(--fp-muted)]">Você não organiza nenhuma liga.</p>
                                    ) : (
                                        <>
                                            <p className="text-sm text-[var(--fp-muted)] mb-3">
                                                Resultados contarão para o ranking da liga selecionada.
                                            </p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {myLeagues.map(l => (
                                                    <Button key={l.id} variant="secondary" size="sm"
                                                            className="justify-between"
                                                            onClick={async () => {
                                                                if (id && user?.id) {
                                                                    try {
                                                                        await linkTournament(l.id, id, user.id);
                                                                        toast.success('Torneio vinculado!');
                                                                        loadTournament(id);
                                                                    } catch (err: any) {
                                                                        toast.error(err.message || 'Erro ao vincular.');
                                                                    }
                                                                }
                                                            }}>
                                                        {l.name} <Plus size={14} />
                                                    </Button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Danger zone */}
                            <button onClick={handleCancelTournament}
                                    className="w-full py-2.5 rounded-xl text-sm font-bold
                                               bg-[var(--fp-rose-lo)] border border-[rgba(244,63,94,0.3)]
                                               text-[var(--fp-rose-hi)] hover:bg-[rgba(244,63,94,0.18)] transition-colors">
                                Cancelar e Excluir Torneio
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ══════════════════════════════════════════
                MODAL: RESULTADO DA MESA
            ══════════════════════════════════════════ */}
            <Modal
                isOpen={!!selectedTable}
                onClose={() => setSelectedTable(null)}
                title={`Resultados — Mesa ${
                    activeTournament.rounds
                        .find(r => r.number === selectedTable?.round)
                        ?.tables.findIndex(t => t.id === selectedTable?.table.id)! + 1
                }`}
                footer={
                    <div className="flex gap-3 justify-end">
                        <button className="fp-btn-ghost px-5 py-2 rounded-xl text-sm"
                                onClick={() => setSelectedTable(null)}>
                            Cancelar
                        </button>
                        <button className="fp-btn-primary px-5 py-2 rounded-xl flex items-center gap-2 text-sm"
                                onClick={handleSubmitTableResults}>
                            <IconSubmitResults size={16} /> Confirmar Pontos
                        </button>
                    </div>
                }
            >
                <div className="flex flex-col gap-5">
                    <p className="text-[var(--fp-muted)] text-sm">Selecione a colocação final de cada jogador.</p>
                    <div className="flex flex-col gap-2">
                        {selectedTable?.table.playerIds.map((pid: string) => {
                            const player = activeTournament.participants.find(p => p.playerId === pid);
                            return (
                                <div key={pid}
                                     className="flex justify-between items-center p-4
                                                bg-white/[0.03] border border-[var(--fp-border)]
                                                rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <img src={dicebearUrl(pid, 32)}
                                             className="w-8 h-8 rounded-full border border-white/10" alt="" />
                                        <span className="font-semibold text-sm text-[var(--fp-text)]">{player?.name}</span>
                                    </div>
                                    <select
                                        className="bg-[var(--fp-void)] border border-[var(--fp-border-hi)] rounded-lg px-3 py-2
                                                   outline-none focus:border-[var(--fp-purple)] transition-colors
                                                   text-[var(--fp-gold-hi)] font-bold text-sm"
                                        value={tempResults[pid] || 'ELIMINATED'}
                                        onChange={e => setTempResults(prev => ({ ...prev, [pid]: e.target.value }))}>
                                        <option value="WINNER">🏆 Vencedor(a)</option>
                                        <option value="SURVIVED">🛡️ Sobrevivente</option>
                                        <option value="ELIMINATED">💀 Eliminado(a)</option>
                                        <option value="ALL_DEFEATED">💥 Todos Derrotados</option>
                                    </select>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Modal>

            {/* ══════════════════════════════════════════
                MODAL: QR CODE
            ══════════════════════════════════════════ */}
            <Modal
                isOpen={isQRModalOpen}
                onClose={() => setIsQRModalOpen(false)}
                title="QR Code de Convite"
            >
                <div className="flex flex-col items-center p-6">
                    <div className="p-5 bg-white rounded-[2rem] shadow-2xl mb-5">
                        <QRCodeSVG value={inviteUrl} size={280} />
                    </div>
                    <h3 className="text-xl font-semibold mb-1">{activeTournament.name}</h3>
                    <p className="text-[var(--fp-muted)] text-sm text-center mb-6">Aponte a câmera para que os jogadores entrem no torneio instantaneamente.</p>
                    <div className="flex gap-4 w-full">
                        <button className="fp-btn-ghost flex-1 py-2 rounded-xl text-sm font-semibold"
                                onClick={handleCopyLink}>Copiar Link</button>
                        <button className="fp-btn-primary flex-1 py-2 rounded-xl text-sm font-bold"
                                onClick={() => setIsQRModalOpen(false)}>Fechar</button>
                    </div>
                </div>
            </Modal>
        </PageShell>
    );
};

export default TournamentDashboard;
