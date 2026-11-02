import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Users, Calendar, Copy, Check, RefreshCw, Link, LogOut, UserCheck } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import PageShell from '../components/layout';
import { LoadingScreen, Modal, Input } from '../components/ui';
import { useLeagueStore } from '../features/leagues/leagueStore';
import { useAuthStore } from '../features/auth/authStore';
import { useTournamentStore } from '../features/tournaments/tournamentStore';
import { leagueService } from '../features/leagues/leagueService';
import { LeagueMembersTab } from '../features/leagues/components/LeagueMembersTab';
import { LeagueSeasonsTab } from '../features/leagues/components/LeagueSeasonsTab';
import { LeagueDetailsTab } from '../features/leagues/components/LeagueDetailsTab';
import { LeagueManagersTab } from '../features/leagues/components/LeagueManagersTab';
import { getInviteLink, copyToClipboard } from '../utils/inviteHelper';

import toast from 'react-hot-toast';

export type LeagueTabId = 'ranking' | 'tournaments' | 'membros' | 'temporadas' | 'ajustes' | 'equipe';

const MEDALS = ['🥇', '🥈', '🥉'];

const dicebear = (seed: string, size = 32) =>
    `https://api.dicebear.com/7.x/rings/svg?seed=${encodeURIComponent(seed)}&size=${size}`;

const TABS: { id: LeagueTabId; label: string }[] = [
    { id: 'ranking',     label: '🏆 Ranking'    },
    { id: 'tournaments', label: '⚔️ Torneios'   },
    { id: 'membros',     label: '👥 Membros'    },
    { id: 'temporadas',  label: '🏅 Temporadas' },
    { id: 'equipe',      label: '🛡️ Equipe'     },
    { id: 'ajustes',     label: 'Ajustes'        },
];

const LeagueDashboard: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { 
        activeLeague, loadLeague, isLoading, recalculateStandings, linkTournament, 
        getAuditLogs, getMembers, updateMemberStatus, getSeasons, archiveSeason, 
        getOrganizers, addOrganizer, removeOrganizer, updateOrganizerRole, leaveLeague 
    } = useLeagueStore();
    const { tournaments, loadTournaments } = useTournamentStore();

    const [tab, setTab]                     = useState<LeagueTabId>('ranking');
    const [codeCopied, setCodeCopied]       = useState(false);
    const [recalcLoading, setRecalcLoading] = useState(false);
    const [linkMode, setLinkMode]           = useState(false);
    const [editMode, setEditMode]           = useState(false);
    const [editData, setEditData]           = useState<any>({});
    const [isQRModalOpen, setIsQRModalOpen]         = useState(false);
    const [isAuditModalOpen, setIsAuditModalOpen]   = useState(false);
    const [isLeaveModalOpen, setIsLeaveModalOpen]   = useState(false);
    const [isLeaving, setIsLeaving]                 = useState(false);
    const [auditLogs, setAuditLogs]                 = useState<any[]>([]);
    const [members, setMembers]                     = useState<any[]>([]);
    const [seasons, setSeasons]                     = useState<any[]>([]);
    const [organizers, setOrganizers]               = useState<any[]>([]);
    const [isSeasonModalOpen, setIsSeasonModalOpen] = useState(false);
    const [seasonName, setSeasonName]               = useState('');
    const [linkedTournaments, setLinkedTournaments] = useState<Record<string, any>>({});

    const handleLoadMembers = async () => { if (id) setMembers(await getMembers(id)); };
    const handleLoadSeasons = async () => { if (id) setSeasons(await getSeasons(id)); };
    const handleLoadOrganizers = async () => { if (id) setOrganizers(await getOrganizers(id)); };

    // Remove the individual fetch for equipe and just load it globally once to establish guards
    useEffect(() => {
        if (id) {
            loadLeague(id);
            handleLoadOrganizers();
            loadTournaments(); // Load tournaments to show their names
        }
    }, [id, loadLeague, loadTournaments]);

    useEffect(() => {
        if (tab === 'membros')    handleLoadMembers();
        if (tab === 'temporadas') handleLoadSeasons();
        if (tab === 'equipe')     handleLoadMembers(); // organizers is already loaded globally
    }, [tab, id]);

    useEffect(() => {
        if (!id) return;
        const unsubscribe = leagueService.subscribeToUpdates(id, () => {
             loadLeague(id);
             handleLoadOrganizers();
        });
        return () => { if (typeof unsubscribe === 'function') unsubscribe(); };
    }, [id, loadLeague]);

    useEffect(() => {
        if (activeLeague?.tournamentIds && activeLeague.tournamentIds.length > 0) {
            const fetchLinked = async () => {
                const { tournamentService } = await import('../features/tournaments/tournamentService');
                const results: Record<string, any> = {};
                for (const tId of activeLeague.tournamentIds) {
                    const t = await tournamentService.getTournament(tId);
                    results[tId] = t || null;
                }
                setLinkedTournaments(results);
            };
            fetchLinked();
        } else {
            setLinkedTournaments({});
        }
    }, [activeLeague?.tournamentIds]);

    if (isLoading && !activeLeague) return <LoadingScreen message="Carregando liga..." />;
    if (!activeLeague) return (
        <PageShell><div className="container py-16 text-center text-[#7a5c5c]">Liga não encontrada.</div></PageShell>
    );

    // ─────────────────────────────────────────────────────────
    // ROLE ACCESS GUARDS
    // ─────────────────────────────────────────────────────────
    const isMaster = activeLeague.organizerId === user?.id;
    const userRoleObj = organizers.find(o => o.userId === user?.id);
    const userRole = isMaster ? 'master' : (userRoleObj?.role || null);
    const isAnyOrganizer = userRole !== null;
    const canManageTournaments = userRole === 'master' || userRole === 'admin';
    const canManageSettings = userRole === 'master' || userRole === 'admin';
    const isSuperAdmin = user?.id === '8lwRk6AsArS6Pm04Wh2DFihMz8k2';

    // Filter tabs based on role permissions
    const visibleTabs = TABS.filter(t => {
        if (t.id === 'equipe') return isAnyOrganizer;
        if (t.id === 'ajustes') return canManageSettings;
        return true;
    });

    const standings    = activeLeague.standings ?? [];
    const myTournaments = tournaments.filter(t => t.organizerId === user?.id && !activeLeague.tournamentIds.includes(t.id));

    const handleCopyCode = async () => {
        const ok = await copyToClipboard(activeLeague.inviteCode, 'Código copiado!');
        if (ok) { setCodeCopied(true); setTimeout(() => setCodeCopied(false), 2000); }
    };
    const handleCopyLink = () => copyToClipboard(getInviteLink('league', activeLeague.inviteCode), 'Link da liga copiado!');

    const handleRecalculate = async () => {
        setRecalcLoading(true);
        try { 
            await recalculateStandings(activeLeague.id); 
            if (id) {
                await loadLeague(id);
                setMembers(await getMembers(id));
            }
            toast.success('Ranking e membros atualizados!'); 
        }
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
        if (!id || !isMaster) return;
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

    const handleAddOrganizer = async (userId: string, role: 'admin' | 'moderator') => {
        if (!id || !user) return;
        try {
            await addOrganizer(id, userId, role, user.id);
            toast.success('Organizador adicionado!');
            handleLoadOrganizers();
        } catch(err:any) { toast.error('Erro ao adicionar organizador'); }
    };

    const handleRemoveOrganizer = async (userId: string) => {
        if (!id || !user) return;
        try {
            await removeOrganizer(id, userId, user.id);
            toast.success('Organizador removido!');
            handleLoadOrganizers();
        } catch(err:any) { toast.error('Erro ao remover organizador'); }
    };

    const handleUpdateOrganizerRole = async (userId: string, role: 'admin' | 'moderator') => {
        if (!id || !user) return;
        try {
            await updateOrganizerRole(id, userId, role, user.id);
            toast.success('Permissão atualizada!');
            handleLoadOrganizers();
        } catch(err:any) { toast.error('Erro ao atualizar permissão'); }
    };

    const handleConfirmLeave = async () => {
        if (!id || !user) return;
        setIsLeaving(true);
        try {
            await leaveLeague(id, user.id);
            toast.success('Você saiu da liga com sucesso.');
            setIsLeaveModalOpen(false);
            navigate('/my-area');
        } catch (err: any) {
            toast.error(err.message || 'Erro ao sair da liga.');
        } finally {
            setIsLeaving(false);
        }
    };

    const isMember = Boolean(user && activeLeague.memberIds.includes(user.id));

    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '192, 57, 43';
    };

    const primaryHex = activeLeague.primaryColor || '#c0392b';
    const primaryRgb = hexToRgb(primaryHex);

    return (
        <PageShell>
            <div className="container py-8 pb-28 flex flex-col gap-6 animate-fade-in"
                 style={{ 
                     '--color-purple': primaryHex,
                     '--fp-primary': primaryHex,
                     '--fp-primary-hi': primaryHex,
                     '--fp-primary-rgb': primaryRgb
                 } as React.CSSProperties}>

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

                            {activeLeague.ownerName && (
                                <p className="text-xs uppercase tracking-widest text-[#d4ac0d] font-bold mb-3 flex items-center gap-1.5">
                                    <Users size={12} className="text-[#d4ac0d]" />
                                    Organizador: <span className="text-white">{activeLeague.ownerName}</span>
                                </p>
                            )}

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

                                {/* Status do usuário atual na liga */}
                                {user && (
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1
                                                      ${isMaster
                                                        ? 'bg-[rgba(212,172,13,0.15)] border border-[rgba(212,172,13,0.3)] text-[#d4ac0d]'
                                                        : isAnyOrganizer
                                                        ? 'bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.3)] text-[#a78bfa]'
                                                        : isMember
                                                        ? 'bg-[rgba(39,174,96,0.15)] border border-[rgba(39,174,96,0.3)] text-[#2ecc71]'
                                                        : 'bg-white/5 border border-white/10 text-[#7a5c5c]'
                                                      }`}>
                                        <UserCheck size={10} />
                                        {isMaster ? 'Criador da Liga' : isAnyOrganizer ? 'Organizador' : isMember ? 'Participando' : 'Visitante'}
                                    </span>
                                )}

                                {/* Botão Sair da Liga para membros comuns */}
                                {isMember && !isMaster && (
                                    <button
                                        onClick={() => setIsLeaveModalOpen(true)}
                                        className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 transition-all flex items-center gap-1"
                                        title="Sair voluntariamente desta liga"
                                    >
                                        <LogOut size={10} /> Sair da Liga
                                    </button>
                                )}
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
                    SEASON PROGRESS BAR
                ══════════════════════════════════ */}
                {activeLeague.status === 'active' && activeLeague.endDate && (() => {
                    const start = new Date(activeLeague.startDate).getTime();
                    const end = new Date(activeLeague.endDate).getTime();
                    const now = Date.now();
                    const total = end - start;
                    const elapsed = Math.max(0, now - start);
                    const pct = total > 0 ? Math.min(100, (elapsed / total) * 100) : 0;
                    const daysLeft = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
                    return (
                        <div className="p-4 rounded-2xl bg-[linear-gradient(160deg,#130a0a,#1a0c0c)] border border-[rgba(212,172,13,0.15)]">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-bold text-[#7a5c5c] uppercase tracking-widest">Temporada em Andamento</span>
                                <span className="text-sm font-bold text-[#d4ac0d]">
                                    {daysLeft > 0 ? `${daysLeft} dia${daysLeft !== 1 ? 's' : ''} restante${daysLeft !== 1 ? 's' : ''}` : 'Último dia!'}
                                </span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-[#d4ac0d] to-[#e67e22] rounded-full transition-all duration-700 ease-out"
                                     style={{ width: `${pct}%` }} />
                            </div>
                            <div className="flex justify-between mt-1.5 text-[9px] text-[#7a5c5c]">
                                <span>{new Date(activeLeague.startDate).toLocaleDateString('pt-BR')}</span>
                                <span>{new Date(activeLeague.endDate).toLocaleDateString('pt-BR')}</span>
                            </div>
                        </div>
                    );
                })()}

                {/* ══════════════════════════════════
                    TABS
                ══════════════════════════════════ */}
                <div className="sticky top-20 z-20 flex gap-1 p-1 w-full md:w-fit overflow-x-auto
                                bg-[rgba(255,255,255,0.025)] border border-[rgba(var(--fp-primary-rgb),0.15)]
                                rounded-2xl backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                    {visibleTabs.map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)}
                                className={`px-5 py-2 rounded-xl text-sm font-semibold
                                            whitespace-nowrap transition-all
                                            ${tab === t.id
                                                ? 'bg-[rgba(var(--fp-primary-rgb),0.2)] border border-[rgba(var(--fp-primary-rgb),0.45)] text-[var(--fp-primary-hi)]'
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
                        {isAnyOrganizer && (
                            <div className="flex justify-end">
                                <button onClick={handleRecalculate} disabled={recalcLoading}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                                                   bg-[rgba(255,255,255,0.04)] border border-[rgba(var(--fp-primary-rgb),0.2)]
                                                   text-[#a07070] hover:text-[var(--fp-primary-hi)] hover:border-[rgba(var(--fp-primary-rgb),0.4)]
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
                                    const borderCls = i === 0
                                        ? 'border-[rgba(212,172,13,0.4)] bg-[rgba(212,172,13,0.05)]'
                                        : i === 1 ? 'border-[rgba(160,160,160,0.25)]'
                                        : i === 2 ? 'border-[rgba(180,100,60,0.25)]'
                                        : 'border-[rgba(var(--fp-primary-rgb),0.1)]';
                                    return (
                                        <div key={s.playerId}
                                             className={`flex items-center gap-4 px-5 py-4 rounded-2xl
                                                         bg-[linear-gradient(160deg,#130a0a,#1a0c0c)]
                                                         border transition-all
                                                         hover:border-[rgba(var(--fp-primary-rgb),0.3)] ${borderCls}`}>
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
                                                        <span className="text-[10px] bg-[rgba(var(--fp-primary-rgb),0.15)] text-[var(--fp-primary-hi)]
                                                                         font-bold px-2 py-0.5 rounded-full border
                                                                         border-[rgba(var(--fp-primary-rgb),0.3)] animate-pulse">
                                                            🔥 {s.currentStreak} Top Cut
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-xs text-[#7a5c5c] mt-0.5">
                                                    {s.tournamentsPlayed} torneio{s.tournamentsPlayed !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-lg font-bold text-[var(--fp-primary-hi)]">{s.totalPoints}</p>
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
                {tab === 'tournaments' && isSuperAdmin && (
                    <div className="flex flex-col gap-4">
                        {canManageTournaments && (
                            <div className="flex justify-end">
                                <button onClick={() => setLinkMode(!linkMode)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                                                   bg-[rgba(var(--fp-primary-rgb),0.1)] border border-[rgba(var(--fp-primary-rgb),0.25)]
                                                   text-[var(--fp-primary-hi)] hover:bg-[rgba(var(--fp-primary-rgb),0.18)] transition-all">
                                    {linkMode ? 'Cancelar' : '+ Vincular Torneio'}
                                </button>
                            </div>
                        )}

                        {linkMode && (
                            <div className="rounded-2xl p-5 bg-[linear-gradient(160deg,#130a0a,#1a0c0c)]
                                            border border-[rgba(var(--fp-primary-rgb),0.2)]">
                                <h4 className="text-sm font-semibold text-white mb-4">Seus Torneios Disponíveis</h4>
                                {myTournaments.length === 0 ? (
                                    <p className="text-[#7a5c5c] text-sm">Nenhum torneio disponível para vincular.</p>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        {myTournaments.map(t => (
                                            <div key={t.id}
                                                 className="flex justify-between items-center p-3 rounded-xl
                                                            bg-[rgba(255,255,255,0.02)] border border-[rgba(var(--fp-primary-rgb),0.1)]">
                                                <span className="text-sm text-white">{t.name}</span>
                                                <button onClick={() => handleLinkTournament(t.id)}
                                                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white
                                                                   bg-gradient-to-r from-[var(--fp-primary)] to-[#e67e22]
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
                                            border border-dashed border-[rgba(var(--fp-primary-rgb),0.15)]
                                            bg-[rgba(var(--fp-primary-rgb),0.02)]">
                                <p className="text-[#7a5c5c] text-sm">Nenhum torneio vinculado ainda.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {activeLeague.tournamentIds.map(tId => {
                                    const tournament = linkedTournaments[tId] || tournaments.find(t => t.id === tId);
                                    const isDeleted = linkedTournaments[tId] === null;

                                    return (
                                        <div key={tId}
                                             className="flex justify-between items-center p-4 rounded-2xl
                                                        bg-[linear-gradient(160deg,#130a0a,#1a0c0c)]
                                                        border border-[rgba(var(--fp-primary-rgb),0.15)]">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-white font-medium">
                                                        {tournament?.name || (isDeleted ? 'Torneio Excluído / Inexistente' : 'Carregando...')}
                                                    </span>
                                                    {isDeleted && (
                                                        <span className="text-[9px] uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 font-bold">
                                                            Excluído
                                                        </span>
                                                    )}
                                                </div>
                                                {tournament?.date && (
                                                    <span className="text-[11px] text-[#7a5c5c]">
                                                        {new Date(tournament.date).toLocaleDateString('pt-BR')}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {!isDeleted && (
                                                    <button onClick={() => navigate(`/tournament/${tId}`)}
                                                            className="px-3 py-1.5 rounded-lg text-xs font-semibold
                                                                       bg-[rgba(var(--fp-primary-rgb),0.1)] border border-[rgba(var(--fp-primary-rgb),0.25)]
                                                                       text-[var(--fp-primary-hi)] hover:bg-[rgba(var(--fp-primary-rgb),0.18)] transition-all">
                                                        Ver →
                                                    </button>
                                                )}

                                                {canManageTournaments && (
                                                    <button
                                                        onClick={async () => {
                                                            if (!user) return;
                                                            if (!window.confirm(`Deseja desvincular o torneio "${tournament?.name || tId}" desta liga?`)) return;
                                                            try {
                                                                await leagueService.unlinkTournament(activeLeague.id, tId, user.id);
                                                                await recalculateStandings(activeLeague.id);
                                                                toast.success('Torneio desvinculado da liga!');
                                                                loadLeague(activeLeague.id);
                                                            } catch (err: any) {
                                                                toast.error(err.message || 'Erro ao desvincular torneio.');
                                                            }
                                                        }}
                                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold
                                                                   bg-red-500/10 border border-red-500/20 text-red-400
                                                                   hover:bg-red-500/20 hover:border-red-500/40 transition-all"
                                                        title="Remover torneio da liga"
                                                    >
                                                        Desvincular
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Tabs que delegam para sub-componentes existentes */}
                {tab === 'ajustes' && canManageSettings && (
                    <LeagueDetailsTab
                        activeLeague={activeLeague} isOrganizer={isMaster}
                        editMode={editMode} editData={editData}
                        setEditMode={setEditMode} setEditData={setEditData}
                        handleSaveEdit={handleSaveEdit} handleOpenAudit={handleOpenAudit}
                        handleDeleteLeague={handleDeleteLeague} setIsSeasonModalOpen={setIsSeasonModalOpen}
                    />
                )}
                {tab === 'membros' && (
                    <LeagueMembersTab members={members} isOrganizer={isAnyOrganizer} userId={user?.id} onUpdateMember={handleUpdateMember} />
                )}
                {tab === 'equipe' && isAnyOrganizer && (
                    <LeagueManagersTab
                        organizers={organizers}
                        members={members}
                        isMaster={isMaster}
                        onAddOrganizer={handleAddOrganizer}
                        onRemoveOrganizer={handleRemoveOrganizer}
                        onUpdateRole={handleUpdateOrganizerRole}
                    />
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
                                           bg-gradient-to-r from-[var(--fp-primary)] to-[#e67e22] hover:opacity-90 transition-opacity"
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
                        <div key={log.id} className="p-3 rounded-xl border border-[rgba(var(--fp-primary-rgb),0.15)]
                                                      bg-[rgba(255,255,255,0.02)] text-sm">
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-[var(--fp-primary-hi)]">{log.action}</span>
                                <span className="text-xs text-[#7a5c5c]">{new Date(log.timestamp).toLocaleString('pt-BR')}</span>
                            </div>
                            <p className="text-[#a07070] text-xs">{log.details}</p>
                            <p className="text-xs text-[#7a5c5c] mt-1.5 border-t border-[rgba(255,255,255,0.05)] pt-1">
                                Usuário: <span className="font-mono">{log.userId}</span>
                            </p>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-[rgba(var(--fp-primary-rgb),0.1)]">
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
                                           bg-gradient-to-r from-[var(--fp-primary)] to-[#e67e22]
                                           hover:opacity-90 transition-opacity disabled:opacity-50"
                                onClick={handleArchiveSeason}
                                disabled={!seasonName.trim()}>
                            Concluir Temporada
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ── MODAL: Confirmar Saída da Liga ── */}
            <Modal isOpen={isLeaveModalOpen} onClose={() => !isLeaving && setIsLeaveModalOpen(false)} title="Sair da Liga">
                <div className="p-6 flex flex-col gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-2">
                        <LogOut size={24} />
                    </div>
                    <div className="text-center">
                        <h4 className="text-lg font-bold text-white mb-2">Deseja realmente sair de "{activeLeague.name}"?</h4>
                        <p className="text-xs text-[#a07070] leading-relaxed">
                            Ao confirmar, você deixará de ser participante ativo desta liga para futuros eventos.
                        </p>
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-2 text-xs">
                        <div className="flex items-center gap-2 text-[#2ecc71]">
                            <Check size={14} className="flex-shrink-0" />
                            <span>Seus resultados e posições nos torneios já disputados serão <strong>preservados</strong>.</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#2ecc71]">
                            <Check size={14} className="flex-shrink-0" />
                            <span>Sua pontuação histórica já acumulada nesta liga <strong>não será apagada</strong>.</span>
                        </div>
                    </div>

                    <div className="flex gap-2 mt-2">
                        <button
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-[#a07070]
                                       bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)]
                                       hover:bg-[rgba(255,255,255,0.08)] transition-all disabled:opacity-50"
                            disabled={isLeaving}
                            onClick={() => setIsLeaveModalOpen(false)}
                        >
                            Cancelar
                        </button>
                        <button
                            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white
                                       bg-gradient-to-r from-red-600 to-red-800
                                       hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-1.5"
                            disabled={isLeaving}
                            onClick={handleConfirmLeave}
                        >
                            {isLeaving ? (
                                <RefreshCw size={14} className="animate-spin" />
                            ) : (
                                <LogOut size={14} />
                            )}
                            Confirmar Saída
                        </button>
                    </div>
                </div>
            </Modal>
        </PageShell>
    );
};

export default LeagueDashboard;
