import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import type { ResultStatus } from '../types';
import { CheckCircle2, Trophy, ChevronRight, Clock, Globe, Settings, Users, Swords, BarChart3, Flag, AlertTriangle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import PageShell from '../components/layout';
import { Button, Modal, LoadingScreen } from '../components/ui';
import { useTournamentStore } from '../features/tournaments/tournamentStore';
import { useAuthStore } from '../features/auth/authStore';
import { tournamentService } from '../features/tournaments/tournamentService';
import { syncService } from '../features/tournaments/syncService';
import { Breadcrumbs } from '../components/ui';
import { useLeagueStore } from '../features/leagues/leagueStore';
import { getInviteLink, copyToClipboard } from '../utils/inviteHelper';
import { IconStartTournament, IconSubmitResults } from '../assets/icons';
import toast from 'react-hot-toast';

// Tab Components
import { TournamentParticipantsTab } from '../features/tournaments/components/TournamentParticipantsTab';
import { TournamentRoundsTab } from '../features/tournaments/components/TournamentRoundsTab';
import { TournamentStandingsTab } from '../features/tournaments/components/TournamentStandingsTab';
import { TournamentSettingsTab } from '../features/tournaments/components/TournamentSettingsTab';

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
    const location = useLocation();
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
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [selectedTable, setSelectedTable] = useState<{ round: number; table: any } | null>(null);
    const [participantSearch, setParticipantSearch] = useState('');
    const [tempResults, setTempResults] = useState<Record<string, string>>({});
    const [isReviewPhase, setIsReviewPhase] = useState(false);
    const [isEditingTables, setIsEditingTables] = useState(false);
    const [swapSource, setSwapSource] = useState<{ tableId: string, playerId: string } | null>(null);
    const [isShuffleAnimating, setIsShuffleAnimating] = useState(false);
    const [isResortModalOpen, setIsResortModalOpen] = useState(false);
    const [isReportingModalOpen, setIsReportingModalOpen] = useState(false);
    const [reportingStatus, setReportingStatus] = useState<ResultStatus | null>(null);

    const handleSwapSelection = async (tableId: string, playerId: string) => {
        if (!swapSource) {
            setSwapSource({ tableId, playerId });
            return;
        }

        if (swapSource.tableId === tableId && swapSource.playerId === playerId) {
            setSwapSource(null);
            return;
        }

        try {
            if (!id) return;
            await tournamentService.swapParticipantsInRound(
                id,
                swapSource.tableId,
                swapSource.playerId,
                tableId,
                playerId
            );
            toast.success('Mesas ajustadas com sucesso!');
            setSwapSource(null);
            loadTournament(id);
        } catch (err: any) {
            toast.error(err.message || 'Erro ao trocar jogadores.');
        }
    };

    const myMatch = activeTournament?.status === 'ongoing' && activeTournament?.currentRoundData 
        ? activeTournament.currentRoundData.tables.find(t => t.playerIds.includes(user?.id || ''))
        : null;

    const myMatchTableIndex = myMatch && activeTournament?.currentRoundData
        ? activeTournament.currentRoundData.tables.findIndex(t => t.id === myMatch.id) 
        : -1;

    const createSparks = () => {
        const container = document.body;
        for (let i = 0; i < 30; i++) {
            const spark = document.createElement('div');
            spark.className = 'spark-effect';
            const tx = (Math.random() - 0.5) * 400;
            const ty = (Math.random() - 0.5) * 400;
            spark.style.setProperty('--tx', `${tx}px`);
            spark.style.setProperty('--ty', `${ty}px`);
            spark.style.left = '50%';
            spark.style.top = '50%';
            container.appendChild(spark);
            setTimeout(() => spark.remove(), 800);
        }
    };

    /* ── load + sync ── */
    const refreshData = useCallback(async () => {
        if (!id) return;
        setIsShuffleAnimating(true);
        await loadTournament(id);
        setTimeout(() => setIsShuffleAnimating(false), 500);
    }, [id, loadTournament]);

    useEffect(() => {
        if (id) {
            refreshData();
            // Sync subscribe
            const unsubscribe = syncService.subscribe(id, () => {
                refreshData();
            });
            return () => unsubscribe();
        }
    }, [id, refreshData]);

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

    const isPublicView = location.pathname.endsWith('/public');
    const isOrganizer = activeTournament 
        ? (!isPublicView && user?.id === activeTournament.organizerId) 
        : false;
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
        if (ok) { /* feedback handles toast */ }
    };

    const handleOpenResultModal = (roundNum: number, table: any) => {
        setSelectedTable({ round: roundNum, table });
        const initRes: Record<string, string> = {};
        
        table.playerIds.forEach((pid: string) => {
            const existing = table.results?.find((r: any) => r.playerId === pid);
            initRes[pid] = existing?.status || 'ELIMINATED';
        });

        setTempResults(initRes);
    };

    const handleSubmitTableResults = () => {
        if (!id || !selectedTable) return;

        // Validation: single survivor should be the winner
        const statuses = Object.values(tempResults);
        const survivedIds = Object.entries(tempResults).filter(([, s]) => s === 'SURVIVED').map(([pid]) => pid);
        const winnerCount = statuses.filter(s => s === 'WINNER').length;

        if (survivedIds.length === 1 && winnerCount === 0) {
            const soloSurvivor = activeTournament.participants.find(p => p.playerId === survivedIds[0]);
            const confirm = window.confirm(
                `${soloSurvivor?.name || 'Jogador'} é o único sobrevivente. Se apenas ele restou, ele é o vencedor (5 pts em vez de 2). Confirmar como VENCEDOR?`
            );
            if (confirm) {
                setTempResults(prev => ({ ...prev, [survivedIds[0]]: 'WINNER' }));
                return; // Let the user review the updated state and click confirm again
            }
        }

        if (winnerCount > 1) {
            toast.error('Só pode haver um vencedor por mesa!');
            return;
        }

        const results = selectedTable.table.playerIds.map((pid: string) => {
            const statusValue = tempResults[pid] as unknown as ResultStatus;
            let pts = 0;
            if (statusValue === 'WINNER' || statusValue === 'BYE') pts = 5;
            else if (statusValue === 'SURVIVED') pts = 2;
            // ELIMINATED and ALL_DEFEATED = 0
            
            return { playerId: pid, status: statusValue, points: pts };
        });

        submitResult(id, selectedTable.round, selectedTable.table.id, results)
            .then(() => {
                toast.success('Resultados salvos!');
                if (results.some((r: any) => r.status === 'WINNER')) {
                    createSparks();
                }
            })
            .catch(() => toast.error('Erro ao salvar resultados.'));
        setSelectedTable(null);
    };

    const handleCompleteTournament = async () => {
        if (!id) return;
        try {
            await completeTournament(id);
            toast.success('Torneio finalizado!');
            createSparks();
        } catch {
            toast.error('Erro ao finalizar torneio.');
        }
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
            <div className="container py-10 pb-28 animate-fade-in relative z-10">

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
                                premium-glass border border-[var(--fp-border-hi)]
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

                            {activeTournament.leagueId && myLeagues.find(l => l.id === activeTournament.leagueId) && (
                                <div 
                                    onClick={() => navigate(`/league/${activeTournament.leagueId}`)}
                                    className="inline-flex items-center w-max gap-2 mb-3 px-3 py-1.5 bg-[var(--fp-gold-lo)] border border-[rgba(245,158,11,0.3)] rounded-lg text-[var(--fp-gold-hi)] text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-[rgba(245,158,11,0.2)] transition-colors"
                                >
                                    <Trophy size={14} /> Liga: {myLeagues.find(l => l.id === activeTournament.leagueId)?.name}
                                </div>
                            )}

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
                                        onClick={handleCompleteTournament}>
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
                            {/* JOIN BUTTON (for non-participants) */}
                            {!isOrganizer && !activeTournament.participants.some(p => p.playerId === user?.id) && (
                                (activeTournament.status === 'registration' || 
                                (activeTournament.status === 'ongoing' && activeTournament.allowLateRegistration !== false))
                            ) && (
                                <button 
                                    className="fp-btn-primary px-6 py-2 rounded-xl flex items-center gap-2 text-sm font-bold shadow-glow-primary animate-pulse"
                                    onClick={async () => {
                                        if (!user) {
                                            navigate('/login', { state: { from: location.pathname } });
                                            return;
                                        }
                                        if (!id) return;
                                        try {
                                            await addParticipant(id, {
                                                playerId: user.id,
                                                name: user.name,
                                                avatar: user.avatar
                                            });
                                            toast.success('Você entrou no torneio!');
                                            refreshData();
                                        } catch (err: any) {
                                            toast.error(err.message || 'Erro ao entrar no torneio.');
                                        }
                                    }}>
                                    <Users size={16} /> Participar Agora
                                </button>
                            )}

                            {user?.id === activeTournament.organizerId && (
                                <button className="fp-btn-ghost px-4 py-2 rounded-xl flex items-center gap-2 text-sm"
                                        onClick={() => navigate(isPublicView ? `/tournament/${id}` : `/tournament/${id}/public`)}>
                                    <Globe size={15} /> {isPublicView ? 'Painel de Controle' : 'Público'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                    {/* ══════════════════════════════════════════
                        BATTLE AREA / STATUS
                    ══════════════════════════════════════════ */}
                    <div className="px-6 pb-6 md:px-8 md:pb-1 flex flex-col gap-4">
                        {myMatch && !isOrganizer && (
                            <div className="flex flex-col gap-3">
                                <div className="h-px bg-white/10 w-full mb-2" />
                                <div className="group flex flex-col gap-3 p-4 rounded-xl 
                                               bg-primary/10 border border-primary/30 battle-glow-ruby
                                               relative overflow-hidden text-left shadow-lg transition-all duration-300"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--fp-rose)] opacity-10 blur-3xl rounded-full" />
                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-[var(--fp-rose-lo)] flex items-center justify-center text-[var(--fp-rose-hi)] animate-pulse shadow-glow-sm">
                                                <Swords size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--fp-rose-hi)]">Sua Batalha</p>
                                                <h4 className="text-sm font-bold text-white uppercase tracking-tight">Mesa {myMatchTableIndex + 1}</h4>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                setActiveTab('rounds');
                                                setTimeout(() => {
                                                    const el = document.getElementById(`table-${myMatch.id}`);
                                                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                }, 100);
                                            }}
                                            className="flex items-center gap-2 text-[var(--fp-rose-hi)] font-black text-[10px] uppercase tracking-widest hover:gap-3 transition-all cursor-pointer bg-white/5 px-2 py-1 rounded-md"
                                        >
                                            Ver Mesa <ChevronRight size={14} />
                                        </button>
                                    </div>

                                    {/* Opponents List */}
                                    <div className="flex flex-wrap items-center gap-4 mt-3 relative z-10 pl-14">
                                        <div className="flex -space-x-3">
                                            {myMatch.playerIds.map(pid => {
                                                const p = activeTournament.participants.find(part => part.playerId === pid);
                                                const isMe = pid === user?.id;
                                                return p ? (
                                                    <div key={pid} className={`w-9 h-9 rounded-full border-2 overflow-hidden bg-[var(--fp-void)] shadow-lg hover:scale-110 transition-transform relative
                                                        ${isMe ? 'border-[var(--fp-purple)] z-20' : 'border-[var(--fp-border-hi)] z-10'}`} 
                                                         title={isMe ? 'Você' : p.name}>
                                                        <img src={p.avatar || dicebearUrl(pid, 36)} className="w-full h-full object-cover" alt="" />
                                                    </div>
                                                ) : null;
                                            })}
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">Adversários:</p>
                                            <div className="flex flex-wrap gap-2 mt-0.5">
                                                {myMatch.playerIds.filter(pid => pid !== user?.id).map((pid, idx) => {
                                                    const p = activeTournament.participants.find(part => part.playerId === pid);
                                                    return p ? (
                                                        <span key={pid} className="text-[11px] font-bold text-[var(--fp-text)]">
                                                            {p.name.split(' ')[0]}{idx < myMatch.playerIds.length - 2 ? ',' : ''}
                                                        </span>
                                                    ) : null;
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 flex gap-2 relative z-10 pl-14">
                                        {myMatch.status === 'pending' ? (
                                            <button 
                                                onClick={() => setIsReportingModalOpen(true)}
                                                className="flex-1 px-4 py-2 rounded-xl bg-[var(--fp-rose-hi)] text-white text-[11px] font-black uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-all shadow-glow-sm flex items-center justify-center gap-2"
                                            >
                                                <Flag size={14} /> Reportar Resultado
                                            </button>
                                        ) : (
                                            <div className="flex-1 px-4 py-2 rounded-xl bg-[var(--fp-emerald-lo)] border border-[var(--fp-emerald)]/30 text-[var(--fp-emerald-hi)] text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2">
                                                <CheckCircle2 size={14} /> Partida Concluída
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {!myMatch && !isOrganizer && activeTournament.status === 'ongoing' && activeTournament.participants.some(p => p.playerId === user?.id) && (
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4 animate-fade-in mb-4">
                                 <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-[var(--fp-muted)]">
                                     <Clock size={20} />
                                 </div>
                                 <div className="text-left">
                                     <p className="text-[10px] font-black uppercase tracking-widest text-[var(--fp-muted)]">Aguardando Pareamento</p>
                                     <h4 className="text-sm font-bold text-white uppercase tracking-tight">Você entrou após o início da rodada.</h4>
                                     <p className="text-[10px] text-[var(--fp-muted)] font-bold uppercase tracking-widest">Aguarde a próxima rodada para ser pareado.</p>
                                 </div>
                            </div>
                        )}
                    </div>

                {/* ══════════════════════════════════════════
                    PROGRESS BAR
                ══════════════════════════════════════════ */}
                {activeTournament.status === 'ongoing' && (activeTournament.maxRounds || activeTournament.pointsLimit) && (
                    <div className="mb-6 p-4 fp-card animate-fade-in">
                        {activeTournament.maxRounds && (
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-bold text-[var(--fp-muted)] uppercase tracking-widest">Progresso de Rodadas</span>
                                    <span className="text-sm font-bold text-[var(--fp-text)]">
                                        {activeTournament.rounds.length} / {activeTournament.maxRounds}
                                    </span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-[var(--fp-purple)] to-[var(--fp-emerald)] rounded-full transition-all duration-700 ease-out"
                                         style={{ width: `${Math.min(100, (activeTournament.rounds.length / activeTournament.maxRounds) * 100)}%` }} />
                                </div>
                            </div>
                        )}
                        {activeTournament.pointsLimit && (
                            <div className={activeTournament.maxRounds ? 'mt-4' : ''}>
                                {(() => {
                                    const leader = [...activeTournament.participants].sort((a, b) => b.totalPoints - a.totalPoints)[0];
                                    const pct = leader ? Math.min(100, (leader.totalPoints / activeTournament.pointsLimit!) * 100) : 0;
                                    return (
                                        <>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[10px] font-bold text-[var(--fp-muted)] uppercase tracking-widest">Pontuação Alvo</span>
                                                <span className="text-sm font-bold text-[var(--fp-text)]">
                                                    {leader ? `${leader.name}: ${leader.totalPoints}` : '0'} / {activeTournament.pointsLimit} pts
                                                </span>
                                            </div>
                                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-[var(--fp-gold)] to-[var(--fp-rose)] rounded-full transition-all duration-700 ease-out"
                                                     style={{ width: `${pct}%` }} />
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                )}

                {/* ══════════════════════════════════════════
                    TABS
                ══════════════════════════════════════════ */}
                <div className="flex gap-1 p-1 mb-8 w-max max-w-full overflow-x-auto
                                bg-white/[0.03] border border-[var(--fp-border)] rounded-2xl
                                scrollbar-none">
                    {TABS.filter(tab => isOrganizer || tab.id !== 'settings').map(tab => (
                        <button key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabId)}
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
                    <TournamentParticipantsTab
                        id={id}
                        activeTournament={activeTournament}
                        isOrganizer={isOrganizer}
                        user={user}
                        participantSearch={participantSearch}
                        setParticipantSearch={setParticipantSearch}
                        newPlayerName={newPlayerName}
                        setNewPlayerName={setNewPlayerName}
                        handleAddPlayer={handleAddPlayer}
                        withdrawParticipant={withdrawParticipant}
                        addParticipant={addParticipant}
                        refreshData={refreshData}
                        navigate={navigate}
                        locationPathname={location.pathname}
                    />
                )}

                {/* ══════════════════════════════════════════
                    TAB: RODADAS
                ══════════════════════════════════════════ */}
                {activeTab === 'rounds' && (
                    <TournamentRoundsTab
                        id={id}
                        activeTournament={activeTournament}
                        isOrganizer={isOrganizer}
                        isEditingTables={isEditingTables}
                        setIsEditingTables={setIsEditingTables}
                        swapSource={swapSource}
                        setSwapSource={setSwapSource}
                        isShuffleAnimating={isShuffleAnimating}
                        generateRound={generateRound}
                        handleOpenResultModal={handleOpenResultModal}
                        handleSwapSelection={handleSwapSelection}
                        setIsResortModalOpen={setIsResortModalOpen}
                    />
                )}

                {/* ══════════════════════════════════════════
                    TAB: CLASSIFICAÇÃO
                ══════════════════════════════════════════ */}
                {activeTab === 'standings' && (
                    <TournamentStandingsTab activeTournament={activeTournament} />
                )}

                {/* ══════════════════════════════════════════
                    TAB: CONFIGURAÇÕES
                ══════════════════════════════════════════ */}
                {activeTab === 'settings' && (
                    <TournamentSettingsTab
                        id={id}
                        activeTournament={activeTournament}
                        isOrganizer={isOrganizer}
                        myLeagues={myLeagues}
                        user={user}
                        formatLabel={formatLabel}
                        statusLabel={statusLabel}
                        linkTournament={linkTournament}
                        loadTournament={loadTournament}
                        handleCancelTournament={handleCancelTournament}
                    />
                )}
            </div>

            {/* ══════════════════════════════════════════
                MODAL: RESULTADO DA MESA
            ══════════════════════════════════════════ */}
            <Modal
                isOpen={!!selectedTable}
                onClose={() => { setSelectedTable(null); setIsReviewPhase(false); }}
                title={selectedTable ? `Resultados — Mesa ${
                    activeTournament.rounds
                        .find(r => r.number === selectedTable.round)
                        ?.tables.findIndex(t => t.id === selectedTable.table.id)! + 1
                }` : 'Resultados'}
                footer={
                    <div className="flex gap-3 justify-end w-full">
                        <button className="fp-btn-ghost px-5 py-2 rounded-xl text-sm"
                                onClick={() => {
                                    if (isReviewPhase) setIsReviewPhase(false);
                                    else setSelectedTable(null);
                                }}>
                            {isReviewPhase ? 'Voltar' : 'Cancelar'}
                        </button>
                        
                        {!isReviewPhase && selectedTable && selectedTable.table.playerIds.length > 4 ? (
                            <button className="fp-btn-primary px-5 py-2 rounded-xl flex items-center gap-2 text-sm"
                                    onClick={() => setIsReviewPhase(true)}>
                                Revisar Resumo <ChevronRight size={16} />
                            </button>
                        ) : (
                            <button className="fp-btn-primary px-5 py-2 rounded-xl flex items-center gap-2 text-sm bg-gradient-to-r from-[var(--fp-purple)] to-[var(--fp-rose)]"
                                    onClick={handleSubmitTableResults}>
                                <IconSubmitResults size={16} /> Confirmar Pontos
                            </button>
                        )}
                    </div>
                }
            >
                <div className="flex flex-col gap-6">
                    {isReviewPhase ? (
                        <div className="flex flex-col gap-4 animate-fade-in">
                            <div className="p-4 rounded-xl bg-[var(--fp-purple-lo)] border border-[rgba(139,92,246,0.3)]">
                                <h4 className="text-xs font-bold text-[var(--fp-purple-hi)] uppercase tracking-widest mb-1">Resumo do Resultado</h4>
                                <p className="text-[11px] text-[var(--fp-muted)]">Verifique se as pontuações estão corretas antes de finalizar.</p>
                            </div>
                            <div className="space-y-2">
                                {selectedTable?.table.playerIds.map((pid: string) => {
                                    const player = activeTournament.participants.find(p => p.playerId === pid);
                                    const status = tempResults[pid] || 'ELIMINATED';
                                    return (
                                        <div key={pid} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                            <span className="text-sm font-medium">{player?.name}</span>
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider
                                                ${status === 'WINNER' ? 'bg-[var(--fp-gold-lo)] text-[var(--fp-gold-hi)]' : 
                                                  status === 'SURVIVED' ? 'bg-[var(--fp-emerald-lo)] text-[var(--fp-emerald-hi)]' : 
                                                  'text-[var(--fp-muted)]'}`}>
                                                {status === 'WINNER' ? '🏆 VENCEDOR' : status === 'SURVIVED' ? '🛡️ SOBREVIVEU' : '💀 ELIMINADO'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <>
                            <h3 className="text-xl font-semibold text-[var(--fp-text)]">
                                Inserir Resultados
                            </h3>

                            <div className="flex flex-col gap-4">
                                {selectedTable?.table.playerReports && selectedTable.table.playerReports.length > 0 && (
                                    <div className="bg-white/5 rounded-xl p-3 border border-white/10 mb-2">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--fp-muted)] mb-2 flex items-center gap-1.5">
                                            <Flag size={10} /> Relatórios dos Jogadores
                                        </h4>
                                        <div className="flex flex-col gap-1.5">
                                            {selectedTable.table.playerReports.map((report: any) => {
                                                const p = activeTournament.participants.find(part => part.playerId === report.playerId);
                                                return (
                                                    <div key={report.playerId} className="flex items-center justify-between text-[11px]">
                                                        <span className="text-secondary">{p?.name}</span>
                                                        <span className={`font-bold ${
                                                            report.status === 'WINNER' ? 'text-[var(--fp-gold)]' :
                                                            report.status === 'SURVIVED' ? 'text-[var(--fp-emerald)]' : 'text-zinc-500'
                                                        }`}>
                                                            {report.status}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                            {(() => {
                                                const winnersCount = selectedTable.table.playerReports.filter((r: any) => r.status === 'WINNER').length;
                                                if (winnersCount > 1) {
                                                    return (
                                                        <div className="mt-2 p-2 bg-[var(--fp-rose-lo)] border border-[var(--fp-rose-hi)]/20 rounded-lg flex items-center gap-2 text-[var(--fp-rose-hi)] animate-pulse">
                                                            <AlertTriangle size={14} />
                                                            <span className="text-[10px] font-bold uppercase tracking-tight">Conflito: {winnersCount} jogadores reportaram vitória!</span>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </div>
                                    </div>
                                )}

                                {selectedTable?.table.playerIds.map((pid: string) => {
                                    const p = activeTournament.participants.find(part => part.playerId === pid);
                                    const report = selectedTable.table.playerReports?.find((r: any) => r.playerId === pid);
                                    return (
                                        <div key={pid} className={`flex flex-col gap-2 p-3 rounded-xl border transition-all ${
                                            tempResults[pid] === 'WINNER' ? 'bg-[var(--fp-purple-lo)] border-purple/30' : 'bg-white/5 border-white/10'
                                        }`}>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm font-bold text-white">{p?.name}</span>
                                                {report && (
                                                    <span className="text-[9px] font-black uppercase opacity-60 flex items-center gap-1">
                                                        Reportou: {report.status === 'WINNER' ? '🏆 VITÓRIA' : report.status === 'SURVIVED' ? '✅ SOBREVIVEU' : '💀 ELIMINADO'}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex gap-1.5">
                                                {(['WINNER', 'SURVIVED', 'ELIMINATED'] as const).map(status => (
                                                    <button
                                                        key={status}
                                                        onClick={() => setTempResults(prev => ({ ...prev, [pid]: status }))}
                                                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                                            tempResults[pid] === status
                                                                ? (status === 'WINNER' ? 'bg-[var(--fp-gold)] text-black' : 
                                                                   status === 'SURVIVED' ? 'bg-[var(--fp-emerald)] text-black' : 'bg-white/20 text-white')
                                                                : 'bg-white/5 text-[var(--fp-muted)] hover:bg-white/10'
                                                        }`}
                                                    >
                                                        {status === 'WINNER' ? 'Vencedor' : status === 'SURVIVED' ? 'Sobreviveu' : 'Derrota'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
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

            {/* ══════════════════════════════════════════
                MODAL: SORTEAR NOVAMENTE
            ══════════════════════════════════════════ */}
            <Modal
                isOpen={isResortModalOpen}
                onClose={() => setIsResortModalOpen(false)}
                title="Sortear Novamente"
                footer={
                    <div className="flex gap-4 justify-end w-full">
                        <button className="fp-btn-ghost px-5 py-2 rounded-xl text-sm"
                                onClick={() => setIsResortModalOpen(false)}>Cancelar</button>
                        <button className="fp-btn-primary px-5 py-2 rounded-xl text-sm bg-[var(--fp-rose-lo)] border border-[rgba(244,63,94,0.4)] text-[var(--fp-rose-hi)] hover:bg-[rgba(244,63,94,0.2)]"
                                onClick={() => {
                                    if (id) {
                                        regenerateRound(id)
                                            .then(() => {
                                                toast('Novo sorteio realizado com sucesso!', { icon: '🎲' });
                                                setIsResortModalOpen(false);
                                            })
                                            .catch((err: any) => toast.error(err.message || 'Erro ao sortear novamente.'));
                                    }
                                }}>
                            Confirmar Sorteio
                        </button>
                    </div>
                }
            >
                <div className="flex flex-col gap-4">
                    <div className="p-4 bg-[var(--fp-rose-lo)] border border-[rgba(244,63,94,0.3)] rounded-2xl">
                        <p className="text-[11px] font-bold text-[var(--fp-rose-hi)] uppercase tracking-widest mb-2 flex items-center gap-2">
                            Atenção
                        </p>
                        <p className="text-sm text-[var(--fp-text)] leading-relaxed">
                            O sorteio será refeito. As pontuações atuais dos jogadores são mantidas, o sistema apenas ajustará o pareamento para casos de entradas ou saídas tardias nesta rodada.
                        </p>
                    </div>
                </div>
            </Modal>

            {/* ── REPORT MODAL ── */}
            <Modal 
                isOpen={isReportingModalOpen} 
                onClose={() => setIsReportingModalOpen(false)}
                title="Reportar Resultado"
            >
                <div className="p-1">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--fp-rose-lo)] flex items-center justify-center text-[var(--fp-rose-hi)] mb-4 mx-auto">
                        <Flag size={24} />
                    </div>
                    <p className="text-[var(--fp-muted)] text-sm text-center mb-6">Como terminou sua partida na Mesa {myMatchTableIndex + 1}?</p>
                    
                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={() => setReportingStatus('WINNER')}
                            className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${
                                reportingStatus === 'WINNER' ? 'border-[var(--fp-gold)] bg-[var(--fp-gold-lo)]/20' : 'border-white/5 bg-white/5 hover:bg-white/10'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[var(--fp-gold-lo)] flex items-center justify-center text-[var(--fp-gold)]">
                                    <Trophy size={18} />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-white uppercase tracking-tight">Eu Venci</p>
                                    <p className="text-[10px] text-[var(--fp-gold)] font-bold uppercase tracking-widest">+5 Pontos</p>
                                </div>
                            </div>
                            {reportingStatus === 'WINNER' && <CheckCircle2 size={16} className="text-[var(--fp-gold)]" />}
                        </button>

                        <button 
                            onClick={() => setReportingStatus('SURVIVED')}
                            className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${
                                reportingStatus === 'SURVIVED' ? 'border-[var(--fp-emerald)] bg-[var(--fp-emerald-lo)]/20' : 'border-white/5 bg-white/5 hover:bg-white/10'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[var(--fp-emerald-lo)] flex items-center justify-center text-[var(--fp-emerald)]">
                                    <CheckCircle2 size={18} />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-white uppercase tracking-tight">Eu Sobrevivi</p>
                                    <p className="text-[10px] text-[var(--fp-emerald)] font-bold uppercase tracking-widest">+2 Pontos</p>
                                </div>
                            </div>
                            {reportingStatus === 'SURVIVED' && <CheckCircle2 size={16} className="text-[var(--fp-emerald)]" />}
                        </button>

                        <button 
                            onClick={() => setReportingStatus('ELIMINATED')}
                            className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${
                                reportingStatus === 'ELIMINATED' ? 'border-white/20 bg-white/10' : 'border-white/5 bg-white/5 hover:bg-white/10'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[var(--fp-muted)]">
                                    <span className="text-lg">💀</span>
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-white uppercase tracking-tight">Fui Eliminado</p>
                                    <p className="text-[10px] text-[var(--fp-muted)] font-bold uppercase tracking-widest">+0 Pontos</p>
                                </div>
                            </div>
                            {reportingStatus === 'ELIMINATED' && <CheckCircle2 size={16} className="text-white" />}
                        </button>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <Button variant="ghost" className="flex-1" onClick={() => setIsReportingModalOpen(false)}>Cancelar</Button>
                        <button 
                            disabled={!reportingStatus}
                            onClick={async () => {
                                if (!id || !user || !reportingStatus || !myMatch) return;
                                try {
                                    const { reportPlayerResult } = useTournamentStore.getState();
                                    await reportPlayerResult(id, activeTournament.rounds.length, myMatch.id, user.id, reportingStatus);
                                    toast.success('Resultado reportado com sucesso!');
                                    setIsReportingModalOpen(false);
                                    setReportingStatus(null);
                                } catch (err: any) {
                                    toast.error(err.message || 'Erro ao reportar resultado.');
                                }
                            }}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold uppercase tracking-[0.1em] transition-all
                                ${reportingStatus ? 'bg-[var(--fp-rose)] text-white shadow-glow-sm' : 'bg-white/5 text-white/20'}`}
                        >
                            Confirmar Envio
                        </button>
                    </div>
                </div>
            </Modal>
        </PageShell>
    );
};

export default TournamentDashboard;
