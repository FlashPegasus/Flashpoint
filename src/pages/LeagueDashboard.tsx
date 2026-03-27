import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Users, Calendar, Copy, Check, Link } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import PageShell from '../components/layout';
import { LoadingScreen, Modal, Input } from '../components/ui';
import { useLeagueStore } from '../features/leagues/leagueStore';
import { useAuthStore } from '../features/auth/authStore';
import { useTournamentStore } from '../features/tournaments/tournamentStore';
import { leagueService } from '../features/leagues/leagueService';
import { LeagueMembersTab } from '../features/leagues/components/LeagueMembersTab';
import { LeagueSeasonsTab } from '../features/leagues/components/LeagueSeasonsTab';
import { LeagueRankingTab } from '../features/leagues/components/LeagueRankingTab';
import { LeagueTournamentsTab } from '../features/leagues/components/LeagueTournamentsTab';
import { LeagueDetailsTab } from '../features/leagues/components/LeagueDetailsTab';
import { LeagueManagersTab } from '../features/leagues/components/LeagueManagersTab';
import { getInviteLink, copyToClipboard } from '../utils/inviteHelper';
import AdsterraBanner from '../components/ui/AdsterraBanner';

import toast from 'react-hot-toast';

export type LeagueTabId = 'ranking' | 'tournaments' | 'membros' | 'temporadas' | 'ajustes' | 'equipe';

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
        getOrganizers, addOrganizer, removeOrganizer, updateOrganizerRole 
    } = useLeagueStore();
    const { tournaments, loadTournaments } = useTournamentStore();

    const [tab, setTab]                     = useState<LeagueTabId>('ranking');
    const [codeCopied, setCodeCopied]       = useState(false);
    const [recalcLoading, setRecalcLoading] = useState(false);
    const [linkMode, setLinkMode]           = useState(false);
    const [editMode, setEditMode]           = useState(false);
    const [editData, setEditData]           = useState<Record<string, unknown>>({});
    const [isQRModalOpen, setIsQRModalOpen]         = useState(false);
    const [isAuditModalOpen, setIsAuditModalOpen]   = useState(false);
    const [auditLogs, setAuditLogs]                 = useState<import('../features/leagues/leagueService').LeagueAuditLog[]>([]);
    const [members, setMembers]                     = useState<import('../types').LeagueMember[]>([]);
    const [seasons, setSeasons]                     = useState<import('../types').LeagueSeason[]>([]);
    const [organizers, setOrganizers]               = useState<import('../types').LeagueOrganizer[]>([]);
    const [isSeasonModalOpen, setIsSeasonModalOpen] = useState(false);
    const [seasonName, setSeasonName]               = useState('');
    const [linkedTournaments, setLinkedTournaments] = useState<Record<string, import('../types').Tournament>>({});
    const [isMembersLoading, setIsMembersLoading]   = useState(false);

    const handleLoadMembers = useCallback(async () => { 
        if (!id) return;
        setIsMembersLoading(true);
        setMembers(await getMembers(id)); 
        setIsMembersLoading(false);
    }, [id, getMembers]);
    const handleLoadSeasons = useCallback(async () => { if (id) setSeasons(await getSeasons(id)); }, [id, getSeasons]);
    const handleLoadOrganizers = useCallback(async () => { if (id) setOrganizers(await getOrganizers(id)); }, [id, getOrganizers]);

    // Remove the individual fetch for equipe and just load it globally once to establish guards
    useEffect(() => {
        if (id) {
            loadLeague(id);
            handleLoadOrganizers();
            loadTournaments(); // Load tournaments to show their names
        }
    }, [id, loadLeague, loadTournaments, handleLoadOrganizers]);

    // Executa reparo de integridade se o organizador não estiver na lista de membros
    useEffect(() => {
        if (activeLeague && user?.id === activeLeague.organizerId) {
            leagueService.repairLeagueIntegrity(activeLeague.id, user.id, user.name);
        }
    }, [activeLeague?.id, user?.id]);

    useEffect(() => {
        if (tab === 'membros')    handleLoadMembers();
        if (tab === 'temporadas') handleLoadSeasons();
        if (tab === 'equipe')     handleLoadMembers(); // organizers is already loaded globally
    }, [tab, id, handleLoadMembers, handleLoadSeasons]);

    useEffect(() => {
        if (!id) return;
        const unsubscribe = leagueService.subscribeToUpdates(id, () => {
             loadLeague(id);
             handleLoadOrganizers();
        });
        return () => { if (typeof unsubscribe === 'function') unsubscribe(); };
    }, [id, loadLeague, handleLoadOrganizers]);

    useEffect(() => {
        if (activeLeague?.tournamentIds && activeLeague.tournamentIds.length > 0) {
            const fetchLinked = async () => {
                const { tournamentService } = await import('../features/tournaments/tournamentService');
                const results: Record<string, import('../types').Tournament> = {};
                for (const tId of activeLeague.tournamentIds) {
                    const t = await tournamentService.getTournament(tId);
                    if (t) results[tId] = t;
                }
                setLinkedTournaments(results);
            };
            fetchLinked();
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
        if (t.id === 'tournaments') return isSuperAdmin;
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
        try { await recalculateStandings(activeLeague.id); toast.success('Ranking atualizado!'); }
        catch (error) { const err = error as Error; toast.error(err.message); }
        finally { setRecalcLoading(false); }
    };

    const handleLinkTournament = async (tournamentId: string) => {
        if (!user) return;
        try { await linkTournament(activeLeague.id, tournamentId, user.id); toast.success('Torneio vinculado!'); setLinkMode(false); }
        catch (error) { const err = error as Error; toast.error(err.message); }
    };

    const handleSaveEdit = async () => {
        if (!id || !activeLeague) return;
        try {
            const sanitized = Object.fromEntries(Object.entries(editData).filter(([_key, v]) => v !== undefined && v !== ''));
            await leagueService.updateLeague(id, sanitized);
            toast.success('Liga atualizada!'); setEditMode(false); loadLeague(id);
        } catch (error) { const err = error as Error; toast.error(err.message || 'Erro ao atualizar liga.'); }
    };

    const handleDeleteLeague = async () => {
        if (!id || !isMaster) return;
        if (!window.confirm('Excluir esta liga permanentemente? Os torneios vinculados serão preservados.')) return;
        try {
            const { useLeagueStore } = await import('../features/leagues/leagueStore');
            await useLeagueStore.getState().deleteLeague(id);
            toast.success('Liga excluída.'); navigate('/my-area');
        } catch (error) { const err = error as Error; toast.error(err.message || 'Erro ao excluir.'); }
    };

    const handleOpenAudit = async () => {
        if (!id) return;
        const logs = await getAuditLogs(id); setAuditLogs(logs as import('../features/leagues/leagueService').LeagueAuditLog[]); setIsAuditModalOpen(true);
    };


    const handleUpdateMember = async (playerId: string, status: 'active' | 'banned') => {
        if (!id || !user) return;
        try {
            await updateMemberStatus(id, playerId, status, user.id);
            toast.success(status === 'banned' ? 'Jogador banido!' : 'Jogador reativado!');
            setMembers(await getMembers(id) as import('../types').LeagueMember[]);
        } catch (error) { const err = error as Error; toast.error(err.message || 'Erro ao atualizar membro'); }
    };

    const handleArchiveSeason = async () => {
        if (!id || !user || !seasonName.trim()) return;
        try {
            await archiveSeason(id, seasonName.trim(), user.id);
            toast.success('Temporada arquivada!'); setIsSeasonModalOpen(false); setSeasonName(''); setTab('temporadas');
        } catch (error) { const err = error as Error; toast.error(err.message || 'Erro ao arquivar temporada'); }
    };

    const handleAddOrganizer = async (userId: string, role: 'admin' | 'moderator') => {
        if (!id || !user) return;
        try {
            await addOrganizer(id, userId, role, user.id);
            toast.success('Organizador adicionado!');
            handleLoadOrganizers();
        } catch { toast.error('Erro ao adicionar organizador'); }
    };

    const handleRemoveOrganizer = async (userId: string) => {
        if (!id || !user) return;
        try {
            await removeOrganizer(id, userId, user.id);
            toast.success('Organizador removido!');
            handleLoadOrganizers();
        } catch { toast.error('Erro ao remover organizador'); }
    };

    const handleUpdateOrganizerRole = async (userId: string, role: 'admin' | 'moderator') => {
        if (!id || !user) return;
        try {
            await updateOrganizerRole(id, userId, role, user.id);
            toast.success('Permissão atualizada!');
            handleLoadOrganizers();
        } catch { toast.error('Erro ao atualizar permissão'); }
    };

    return (
        <PageShell>
            <div className="container py-8 pb-28 flex flex-col gap-6 animate-fade-in"
                 style={{ '--color-purple': activeLeague.primaryColor || '#c0392b' } as React.CSSProperties}>

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
                                bg-[rgba(255,255,255,0.025)] border border-[rgba(192,57,43,0.15)]
                                rounded-2xl backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                    {visibleTabs.map(t => (
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
                    <LeagueRankingTab 
                        standings={standings} 
                        isAnyOrganizer={isAnyOrganizer} 
                        handleRecalculate={handleRecalculate} 
                        recalcLoading={recalcLoading} 
                    />
                )}

                {/* ══════════════════════════════════
                    TAB: TORNEIOS
                ══════════════════════════════════ */}
                {tab === 'tournaments' && (
                    <LeagueTournamentsTab 
                        isSuperAdmin={isSuperAdmin}
                        canManageTournaments={canManageTournaments}
                        linkMode={linkMode}
                        setLinkMode={setLinkMode}
                        myTournaments={myTournaments}
                        handleLinkTournament={handleLinkTournament}
                        tournamentIds={activeLeague.tournamentIds}
                        linkedTournaments={linkedTournaments}
                        allTournaments={tournaments}
                    />
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
                    <LeagueMembersTab members={members} isOrganizer={isAnyOrganizer} isLoading={isMembersLoading} userId={user?.id} onUpdateMember={handleUpdateMember} />
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

                <div className="mt-4 mx-auto max-w-2xl w-full">
                    <AdsterraBanner />
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
