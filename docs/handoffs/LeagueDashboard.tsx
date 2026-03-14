import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Users, Calendar, Copy, Check, RefreshCw, Link } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import PageShell from '../components/layout';
import { Button, Card, LoadingScreen, Modal, Input } from '../components/ui';
import { useLeagueStore } from '../features/leagues/leagueStore';
import { useAuthStore } from '../features/auth/authStore';
import { useTournamentStore } from '../features/tournaments/tournamentStore';
import { leagueService } from '../features/leagues/leagueService';
import { LeagueMembersTab } from '../features/leagues/components/LeagueMembersTab';
import { LeagueSeasonsTab } from '../features/leagues/components/LeagueSeasonsTab';
import { LeagueDetailsTab } from '../features/leagues/components/LeagueDetailsTab';
import { getInviteLink, copyToClipboard } from '../utils/inviteHelper';
import toast from 'react-hot-toast';

export type LeagueTabId = 'ranking' | 'tournaments' | 'membros' | 'temporadas' | 'ajustes';

const MEDALS = ['🥇', '🥈', '🥉'];

const dicebear = (seed: string, size = 32) =>
    `https://api.dicebear.com/7.x/rings/svg?seed=${encodeURIComponent(seed)}&size=${size}`;

const TABS: { id: LeagueTabId; label: string }[] = [
    { id: 'ranking',     label: '🏆 Ranking'    },
    { id: 'tournaments', label: '⚔️ Torneios'   },
    { id: 'membros',     label: '👥 Membros'    },
    { id: 'temporadas',  label: '🏅 Temporadas' },
    { id: 'ajustes',     label: 'Ajustes'        },
];

const LeagueDashboard: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { activeLeague, loadLeague, isLoading, recalculateStandings, linkTournament, getAuditLogs, getMembers, updateMemberStatus, getSeasons, archiveSeason } = useLeagueStore();
    const { tournaments } = useTournamentStore();

    const [tab, setTab]                     = useState<LeagueTabId>('ranking');
    const [codeCopied, setCodeCopied]       = useState(false);
    const [recalcLoading, setRecalcLoading] = useState(false);
    const [linkMode, setLinkMode]           = useState(false);
    const [editMode, setEditMode]           = useState(false);
    const [editData, setEditData]           = useState<any>({});
    const [isQRModalOpen, setIsQRModalOpen]         = useState(false);
    const [isAuditModalOpen, setIsAuditModalOpen]   = useState(false);
    const [auditLogs, setAuditLogs]                 = useState<any[]>([]);
    const [members, setMembers]                     = useState<any[]>([]);
    const [seasons, setSeasons]                     = useState<any[]>([]);
    const [isSeasonModalOpen, setIsSeasonModalOpen] = useState(false);
    const [seasonName, setSeasonName]               = useState('');

    useEffect(() => { if (id) loadLeague(id); }, [id, loadLeague]);

    useEffect(() => {
        if (tab === 'membros')    handleLoadMembers();
        if (tab === 'temporadas') handleLoadSeasons();
    }, [tab, id]);

    useEffect(() => {
        if (!id) return;
        const unsubscribe = leagueService.subscribeToUpdates(id, () => loadLeague(id));
        return () => { if (typeof unsubscribe === 'function') unsubscribe(); };
    }, [id, loadLeague]);

    if (isLoading && !activeLeague) return <LoadingScreen message="Carregando liga..." />;
    if (!activeLeague) return (
        <PageShell><div className="container py-16 text-center text-[#7a5c5c]">Liga não encontrada.</div></PageShell>
    );

    const isOrganizer  = activeLeague.organizerId === user?.id;
    const standings    = activeLeague.standings ?? [];
    const myTournaments = tournaments.filter(t => t.organizerId === user?.id && !activeLeague.tournamentIds.includes(t.id));

    const handleCopyCode = async () => {
        const ok = await copyToClipboard(activeLeague.inviteCode, 'Código copiado!');
        if (ok) { setCodeCopied(true); setTimeout(() => setCodeCopied(false), 2000); }
    };
    const handleCopyLink = () => copyToClipboard(getInviteLink('league', activeLeague.inviteCode), 'Link da liga copiado!');

    const handleRecalculate = async () => {
        setRecalcLoading(true);
        try { await recalculateStandings(activeLeague.id); toast.success('Ranking atualizado!'); }
        catch (err: any) { toast.error(err.message); }
        finally { setRecalcLoading(false); }
    };

    const handleLinkTournament = async (tournamentId: string) => {
        if (!user) return;
        try { await linkTournament(activeLeague.id, tournamentId, user.id); toast.success('Torneio vinculado!'); setLinkMode(false); }
        catch (err: any) { toast.error(err.message); }
    };

    const handleSaveEdit = async () => {
        if (!id || !activeLeague) return;
        try {
            const sanitized = Object.fromEntries(Object.entries(editData).filter(([_, v]) => v !== undefined && v !== ''));
            await leagueService.updateLeague(id, sanitized);
            toast.success('Liga atualizada!'); setEditMode(false); loadLeague(id);
        } catch (err: any) { toast.error(err.message || 'Erro ao atualizar liga.'); }
    };

    const handleDeleteLeague = async () => {
        if (!id || !isOrganizer) return;
        if (!window.confirm('Excluir esta liga permanentemente? Os torneios vinculados serão preservados.')) return;
        try {
            const { useLeagueStore } = await import('../features/leagues/leagueStore');
            await useLeagueStore.getState().deleteLeague(id);
            toast.success('Liga excluída.'); navigate('/my-area');
        } catch (err: any) { toast.error(err.message || 'Erro ao excluir.'); }
    };

    const handleOpenAudit = async () => {
        if (!id) return;
        const logs = await getAuditLogs(id); setAuditLogs(logs); setIsAuditModalOpen(true);
    };

    const handleLoadMembers = async () => { if (id) setMembers(await getMembers(id)); };
    const handleLoadSeasons = async () => { if (id) setSeasons(await getSeasons(id)); };

    const handleUpdateMember = async (playerId: string, status: 'active' | 'banned') => {
        if (!id || !user) return;
        try {
            await updateMemberStatus(id, playerId, status, user.id);
            toast.success(status === 'banned' ? 'Jogador banido!' : 'Jogador reativado!');
            setMembers(await getMembers(id));
        } catch (err: any) { toast.error(err.message || 'Erro ao atualizar membro'); }
    };

    const handleArchiveSeason = async () => {
        if (!id || !user || !seasonName.trim()) return;
        try {
            await archiveSeason(id, seasonName.trim(), user.id);
            toast.success('Temporada arquivada!'); setIsSeasonModalOpen(false); setSeasonName(''); setTab('temporadas');
        } catch (err: any) { toast.error(err.message || 'Erro ao arquivar temporada'); }
    };

    return (
        <PageShell>
            <div className="container py-8 pb-28 flex flex-col gap-6 animate-fade-in"
                 style={{ '--color-purple': activeLeague.primaryColor || '#c0392b' } as any}>

                {/* ══════════════════════════════════
                    HEADER
                ══════════════════════════════════ */}
                <div className="relative overflow-hidden rounded-2xl border border-[rgba(212,172,13,0.2)]"
                     style={{
                         background: activeLeague.bannerUrl
                             ? `linear-gradient(to bottom, rgba(0,0,0,0.65), rgba(10,5,5,0.96)), url(${activeLeague.bannerUrl}) center/cover`
                             : 'linear-gradient(160deg, #130a0a, #1a0c0c)',
                         boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
                     }}>

                    {/* linha de energia dourada */}
                    <div className="absolute top-0 left-[10%] right-[10%] h-px"
                         style={{ background: 'linear-gradient(90deg, transparent, rgba(212,172,13,0.7), transparent)' }} />

                    <div className="flex justify-between items-start flex-wrap gap-6 p-6 md:p-8">
                        {/* Info */}
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Trophy size={28} className="text-[#d4ac0d]" />
                                <h1 className="font-[var(--fp-font-display,_'Cinzel_Decorative',serif)]
                                               text-2xl md:text-3xl text-white leading-tight">
                                    {activeLeague.name}
                                </h1>
                            </div>
                            {activeLeague.description && (
                                <p className="text-[#7a5c5c] text-sm mb-4 max-w-lg">{activeLeague.description}</p>
                            )}
                            <div className="flex items-center gap-3 flex-wrap text-xs text-[#7a5c5c]">
                                <span className="flex items-center gap-1.5">
                                    <Users size={11} /> {activeLeague.memberIds.length} membros
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Calendar size={11} /> {new Date(activeLeague.startDate).toLocaleDateString('pt-BR')}
                                </span>
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase
                                                  ${activeLeague.status === 'active'
                                                    ? 'bg-[rgba(30,132,73,0.15)] border border-[rgba(39,174,96,0.3)] text-[#27ae60]'
                                                    : 'bg-white/5 border border-white/10 text-[#7a5c5c]'
                                                  }`}>
                                    {activeLeague.status === 'active' ? 'Ativa' : 'Concluída'}
                                </span>
                            </div>
                        </div>

                        {/* Código de convite */}
                        <div className="rounded-2xl p-4 flex flex-col items-center gap-2 flex-shrink-0
                                        bg-[rgba(255,255,255,0.03)] border border-[rgba(212,172,13,0.2)]">
                            <p className="text-[10px] text-[#7a5c5c] uppercase tracking-[2px]">Código de Convite</p>
                            <p className="text-2xl font-bold font-mono tracking-widest text-[#d4ac0d]">
                                {activeLeague.inviteCode}
                            </p>
                            <div className="flex gap-2">
                                {[
                                    { onClick: handleCopyCode, icon: codeCopied ? <Check size={11} /> : <Copy size={11} />, label: 'Código' },
                                    { onClick: handleCopyLink, icon: <Link size={11} />, label: 'Link' },
                                ].map((btn, i) => (
                                    <button key={i} onClick={btn.onClick}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold
                                                       bg-[rgba(255,255,255,0.04)] border border-[rgba(212,172,13,0.18)]
                                                       text-[#a07070] hover:border-[rgba(212,172,13,0.4)]
                                                       hover:text-[#d4ac0d] transition-all">
                                        {btn.icon} {btn.label}
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => setIsQRModalOpen(true)}
                                    className="text-[10px] text-[#7a5c5c] hover:text-[#d4ac0d] transition-colors underline">
                                Mostrar QR Code
                            </button>
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════
                    TABS
                ══════════════════════════════════ */}
                <div className="sticky top-20 z-20 flex gap-1 p-1 w-full md:w-fit overflow-x-auto
                                bg-[rgba(255,255,255,0.025)] border border-[rgba(192,57,43,0.15)]
                                rounded-2xl backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                    {TABS.map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)}
                                className={`px-5 py-2 rounded-xl text-sm font-semibold
                                            whitespace-nowrap transition-all
                                            ${tab === t.id
                                                ? 'bg-[rgba(192,57,43,0.2)] border border-[rgba(192,57,43,0.45)] text-[#e74c3c]'
                                                : 'text-[#7a5c5c] hover:text-[#f0e6e6]'
                                            }`}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* ══════════════════════════════════
                    TAB: RANKING
                ══════════════════════════════════ */}
                {tab === 'ranking' && (
                    <div className="flex flex-col gap-4">
                        {isOrganizer && (
                            <div className="flex justify-end">
                                <button onClick={handleRecalculate} disabled={recalcLoading}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                                                   bg-[rgba(255,255,255,0.04)] border border-[rgba(192,57,43,0.2)]
                                                   text-[#a07070] hover:text-[#e74c3c] hover:border-[rgba(192,57,43,0.4)]
                                                   transition-all disabled:opacity-50">
                                    <RefreshCw size={14} className={recalcLoading ? 'animate-spin' : ''} />
                                    Recalcular
                                </button>
                            </div>
                        )}

                        {standings.length === 0 ? (
                            <div className="py-20 text-center rounded-2xl
                                            border border-dashed border-[rgba(212,172,13,0.15)]
                                            bg-[rgba(212,172,13,0.02)]">
                                <Trophy size={40} className="mx-auto mb-4 text-[#d4ac0d] opacity-20" />
                                <p className="text-[#7a5c5c] text-sm">
                                    Nenhum resultado ainda. Finalize um torneio vinculado para atualizar.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {standings.map((s: any, i: number) => {
                                    const isTop = i < 3;
                                    const borderCls = i === 0
                                        ? 'border-[rgba(212,172,13,0.4)] bg-[rgba(212,172,13,0.05)]'
                                        : i === 1 ? 'border-[rgba(160,160,160,0.25)]'
                                        : i === 2 ? 'border-[rgba(180,100,60,0.25)]'
                                        : 'border-[rgba(192,57,43,0.1)]';
                                    return (
                                        <div key={s.playerId}
                                             className={`flex items-center gap-4 px-5 py-4 rounded-2xl
                                                         bg-[linear-gradient(160deg,#130a0a,#1a0c0c)]
                                                         border transition-all
                                                         hover:border-[rgba(192,57,43,0.3)] ${borderCls}`}>
                                            <div className="text-xl w-10 text-center flex-shrink-0">
                                                {i < 3 ? MEDALS[i] : <span className="text-[#7a5c5c] text-sm font-bold">#{s.rank}</span>}
                                            </div>
                                            <div className="w-8 h-8 rounded-full overflow-hidden border border-[rgba(255,255,255,0.1)] flex-shrink-0">
                                                <img src={dicebear(s.playerId || s.playerName, 32)} alt="" className="w-full h-full" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-white text-sm flex items-center gap-2 flex-wrap">
                                                    {s.playerName}
                                                    {s.currentStreak >= 2 && (
                                                        <span className="text-[10px] bg-[rgba(192,57,43,0.15)] text-[#e74c3c]
                                                                         font-bold px-2 py-0.5 rounded-full border
                                                                         border-[rgba(192,57,43,0.3)] animate-pulse">
                                                            🔥 {s.currentStreak} Top Cut
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-xs text-[#7a5c5c] mt-0.5">
                                                    {s.tournamentsPlayed} torneio{s.tournamentsPlayed !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-lg font-bold text-[#e74c3c]">{s.totalPoints}</p>
                                                <p className="text-[10px] text-[#7a5c5c]">pts</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ══════════════════════════════════
                    TAB: TORNEIOS
                ══════════════════════════════════ */}
                {tab === 'tournaments' && (
                    <div className="flex flex-col gap-4">
                        {isOrganizer && (
                            <div className="flex justify-end">
                                <button onClick={() => setLinkMode(!linkMode)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                                                   bg-[rgba(192,57,43,0.1)] border border-[rgba(192,57,43,0.25)]
                                                   text-[#e74c3c] hover:bg-[rgba(192,57,43,0.18)] transition-all">
                                    {linkMode ? 'Cancelar' : '+ Vincular Torneio'}
                                </button>
                            </div>
                        )}

                        {linkMode && (
                            <div className="rounded-2xl p-5 bg-[linear-gradient(160deg,#130a0a,#1a0c0c)]
                                            border border-[rgba(192,57,43,0.2)]">
                                <h4 className="text-sm font-semibold text-white mb-4">Seus Torneios Disponíveis</h4>
                                {myTournaments.length === 0 ? (
                                    <p className="text-[#7a5c5c] text-sm">Nenhum torneio disponível para vincular.</p>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        {myTournaments.map(t => (
                                            <div key={t.id}
                                                 className="flex justify-between items-center p-3 rounded-xl
                                                            bg-[rgba(255,255,255,0.02)] border border-[rgba(192,57,43,0.1)]">
                                                <span className="text-sm text-white">{t.name}</span>
                                                <button onClick={() => handleLinkTournament(t.id)}
                                                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white
                                                                   bg-gradient-to-r from-[#c0392b] to-[#e67e22]
                                                                   hover:opacity-90 transition-opacity">
                                                    Vincular
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeLeague.tournamentIds.length === 0 ? (
                            <div className="py-16 text-center rounded-2xl
                                            border border-dashed border-[rgba(192,57,43,0.15)]
                                            bg-[rgba(192,57,43,0.02)]">
                                <p className="text-[#7a5c5c] text-sm">Nenhum torneio vinculado ainda.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {activeLeague.tournamentIds.map(tId => (
                                    <div key={tId}
                                         className="flex justify-between items-center p-4 rounded-2xl
                                                    bg-[linear-gradient(160deg,#130a0a,#1a0c0c)]
                                                    border border-[rgba(192,57,43,0.15)]">
                                        <span className="font-mono text-sm text-[#7a5c5c]">{tId}</span>
                                        <button onClick={() => navigate(`/tournament/${tId}`)}
                                                className="px-3 py-1.5 rounded-lg text-xs font-semibold
                                                           bg-[rgba(192,57,43,0.1)] border border-[rgba(192,57,43,0.25)]
                                                           text-[#e74c3c] hover:bg-[rgba(192,57,43,0.18)] transition-all">
                                            Ver →
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Tabs que delegam para sub-componentes existentes */}
                {tab === 'ajustes' && (
                    <LeagueDetailsTab
                        activeLeague={activeLeague} isOrganizer={isOrganizer}
                        editMode={editMode} editData={editData}
                        setEditMode={setEditMode} setEditData={setEditData}
                        handleSaveEdit={handleSaveEdit} handleOpenAudit={handleOpenAudit}
                        handleDeleteLeague={handleDeleteLeague} setIsSeasonModalOpen={setIsSeasonModalOpen}
                    />
                )}
                {tab === 'membros' && (
                    <LeagueMembersTab members={members} isOrganizer={isOrganizer} userId={user?.id} onUpdateMember={handleUpdateMember} />
                )}
                {tab === 'temporadas' && <LeagueSeasonsTab seasons={seasons} />}

                {/* Espaço Publicitário */}
                <div className="mt-4 mx-auto max-w-2xl w-full">
                    <div className="rounded-2xl border border-dashed border-[rgba(255,255,255,0.06)]
                                    bg-[rgba(255,255,255,0.02)] py-6 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-[3px] text-[rgba(122,92,92,0.4)]">
                            Espaço Publicitário
                        </p>
                    </div>
                </div>
            </div>

            {/* ── MODAL: QR Code ── */}
            <Modal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} title="QR Code de Convite da Liga">
                <div className="flex flex-col items-center p-8">
                    <div className="p-5 bg-white rounded-[2rem] shadow-2xl mb-5">
                        <QRCodeSVG value={getInviteLink('league', activeLeague.inviteCode)} size={280} />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-1">{activeLeague.name}</h3>
                    <p className="text-[#7a5c5c] text-sm text-center mb-6">Aponte a câmera para entrar na liga instantaneamente.</p>
                    <div className="flex gap-3 w-full">
                        <button className="flex-1 py-2 rounded-xl text-sm font-semibold
                                           bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)]
                                           text-[#a07070] hover:bg-[rgba(255,255,255,0.08)] transition-all"
                                onClick={handleCopyLink}>Copiar Link</button>
                        <button className="flex-1 py-2 rounded-xl text-sm font-bold text-white
                                           bg-gradient-to-r from-[#c0392b] to-[#e67e22] hover:opacity-90 transition-opacity"
                                onClick={() => setIsQRModalOpen(false)}>Fechar</button>
                    </div>
                </div>
            </Modal>

            {/* ── MODAL: Audit Log ── */}
            <Modal isOpen={isAuditModalOpen} onClose={() => setIsAuditModalOpen(false)} title="Histórico de Ações">
                <div className="p-4 flex flex-col gap-2 min-h-[300px] max-h-[60vh] overflow-y-auto">
                    {auditLogs.length === 0 ? (
                        <p className="text-[#7a5c5c] text-center mt-10 text-sm">Nenhum registro encontrado.</p>
                    ) : auditLogs.map(log => (
                        <div key={log.id} className="p-3 rounded-xl border border-[rgba(192,57,43,0.15)]
                                                      bg-[rgba(255,255,255,0.02)] text-sm">
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-[#e74c3c]">{log.action}</span>
                                <span className="text-xs text-[#7a5c5c]">{new Date(log.timestamp).toLocaleString('pt-BR')}</span>
                            </div>
                            <p className="text-[#a07070] text-xs">{log.details}</p>
                            <p className="text-xs text-[#7a5c5c] mt-1.5 border-t border-[rgba(255,255,255,0.05)] pt-1">
                                Usuário: <span className="font-mono">{log.userId}</span>
                            </p>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-[rgba(192,57,43,0.1)]">
                    <button className="w-full py-2 rounded-xl text-sm font-semibold text-[#a07070]
                                       bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)]
                                       hover:bg-[rgba(255,255,255,0.08)] transition-all"
                            onClick={() => setIsAuditModalOpen(false)}>Fechar</button>
                </div>
            </Modal>

            {/* ── MODAL: Finalizar Temporada ── */}
            <Modal isOpen={isSeasonModalOpen} onClose={() => setIsSeasonModalOpen(false)} title="Finalizar Temporada Atual">
                <div className="p-6 flex flex-col gap-4">
                    <p className="text-sm text-[#a07070] leading-relaxed">
                        Isso irá salvar o pódio atual no Salão da Fama, resetar o ranking e desvincular todos os torneios para começar uma nova era!
                    </p>
                    <Input
                        label="Nome da Temporada"
                        placeholder="Ex: Season 2024 - Inverno"
                        value={seasonName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSeasonName(e.target.value)}
                    />
                    <div className="flex gap-2 mt-2">
                        <button className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-[#a07070]
                                           bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)]
                                           hover:bg-[rgba(255,255,255,0.08)] transition-all"
                                onClick={() => setIsSeasonModalOpen(false)}>Cancelar</button>
                        <button className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white
                                           bg-gradient-to-r from-[#c0392b] to-[#e67e22]
                                           hover:opacity-90 transition-opacity disabled:opacity-50"
                                onClick={handleArchiveSeason}
                                disabled={!seasonName.trim()}>
                            Concluir Temporada
                        </button>
                    </div>
                </div>
            </Modal>
        </PageShell>
    );
};

export default LeagueDashboard;
