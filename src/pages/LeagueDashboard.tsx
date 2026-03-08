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

const LeagueDashboard: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { activeLeague, loadLeague, isLoading, recalculateStandings, linkTournament, getAuditLogs, getMembers, updateMemberStatus, getSeasons, archiveSeason } = useLeagueStore();
    const { tournaments } = useTournamentStore();

    const [tab, setTab] = useState<LeagueTabId>('ranking');
    const [codeCopied, setCodeCopied] = useState(false);
    const [recalcLoading, setRecalcLoading] = useState(false);
    const [linkMode, setLinkMode] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState<any>({});
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [seasons, setSeasons] = useState<any[]>([]);
    const [isSeasonModalOpen, setIsSeasonModalOpen] = useState(false);
    const [seasonName, setSeasonName] = useState('');

    useEffect(() => {
        if (id) loadLeague(id);
    }, [id, loadLeague]);

    useEffect(() => {
        if (tab === 'membros') handleLoadMembers();
        if (tab === 'temporadas') handleLoadSeasons();
    }, [tab, id]);

    // RTDB live updates
    useEffect(() => {
        if (!id) return;
        const unsubscribe = leagueService.subscribeToUpdates(id, () => {
            loadLeague(id);
        });
        return () => { if (typeof unsubscribe === 'function') unsubscribe(); };
    }, [id, loadLeague]);

    if (isLoading && !activeLeague) return <LoadingScreen message="Carregando liga..." />;
    if (!activeLeague) return <PageShell><div className="container section">Liga não encontrada.</div></PageShell>;

    const isOrganizer = activeLeague.organizerId === user?.id;

    const handleCopyCode = async () => {
        const success = await copyToClipboard(activeLeague.inviteCode, 'Código copiado!');
        if (success) {
            setCodeCopied(true);
            setTimeout(() => setCodeCopied(false), 2000);
        }
    };

    const handleCopyLink = () => {
        const inviteUrl = getInviteLink('league', activeLeague.inviteCode);
        copyToClipboard(inviteUrl, 'Link da liga copiado!');
    };

    const handleRecalculate = async () => {
        setRecalcLoading(true);
        try {
            await recalculateStandings(activeLeague.id);
            toast.success('Ranking atualizado! 📊');
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setRecalcLoading(false);
        }
    };

    const handleLinkTournament = async (tournamentId: string) => {
        if (!user) return;
        try {
            await linkTournament(activeLeague.id, tournamentId, user.id);
            toast.success('Torneio vinculado! ⚔️');
            setLinkMode(false);
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleSaveEdit = async () => {
        if (!id || !activeLeague) return;
        try {
            // Remove undefined values
            const sanitizedData = Object.fromEntries(
                Object.entries(editData).filter(([_, v]) => v !== undefined && v !== '')
            );
            await leagueService.updateLeague(id, sanitizedData);
            toast.success('Liga atualizada com sucesso!');
            setEditMode(false);
            loadLeague(id);
        } catch (err: any) {
            toast.error(err.message || 'Erro ao atualizar liga.');
        }
    };

    const handleDeleteLeague = async () => {
        if (!id || !isOrganizer) return;
        if (window.confirm('Tem certeza absoluta que deseja excluir esta liga? Todos os dados vinculados a ela permanecerão, mas a liga será desfeita.')) {
            try {
                const { useLeagueStore } = await import('../features/leagues/leagueStore');
                await useLeagueStore.getState().deleteLeague(id);
                toast.success('Liga excluída com sucesso.');
                navigate('/my-area');
            } catch (err: any) {
                toast.error(err.message || 'Erro ao excluir a liga.');
            }
        }
    };

    const handleOpenAudit = async () => {
        if (!id) return;
        const logs = await getAuditLogs(id);
        setAuditLogs(logs);
        setIsAuditModalOpen(true);
    };

    const handleLoadMembers = async () => {
        if (!id) return;
        const data = await getMembers(id);
        setMembers(data);
    };

    const handleLoadSeasons = async () => {
        if (!id) return;
        const data = await getSeasons(id);
        setSeasons(data);
    };

    const handleUpdateMember = async (playerId: string, status: 'active' | 'banned') => {
        if (!id || !user) return;
        try {
            await updateMemberStatus(id, playerId, status, user.id);
            toast.success(status === 'banned' ? 'Jogador banido!' : 'Jogador reativado!');
            const updated = await getMembers(id);
            setMembers(updated);
        } catch (err: any) {
            toast.error(err.message || 'Erro ao atualizar membro');
        }
    };

    const handleArchiveSeason = async () => {
        if (!id || !user || !seasonName.trim()) return;
        try {
            await archiveSeason(id, seasonName.trim(), user.id);
            toast.success('Temporada finalizada e arquivada! Ranking resetado. 🏅');
            setIsSeasonModalOpen(false);
            setSeasonName('');
            setTab('temporadas');
        } catch (err: any) {
            toast.error(err.message || 'Erro ao arquivar temporada');
        }
    };

    const myTournaments = tournaments.filter(t => t.organizerId === user?.id && !activeLeague.tournamentIds.includes(t.id));
    const standings = activeLeague.standings ?? [];

    return (
        <PageShell>
            <div
                className="container py-8 flex flex-col gap-8 animate-fade-in"
                style={{
                    '--color-purple': activeLeague.primaryColor || '#8b5cf6',
                    '--shadow-glow': `0 0 20px ${(activeLeague.primaryColor || '#8b5cf6')}4D`
                } as any}
            >
                {/* Header */}
                <div className="relative mb-8 overflow-hidden rounded-3xl glass border border-white/5 p-8"
                    style={{ background: activeLeague.bannerUrl ? `linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(10,10,20,0.95)), url(${activeLeague.bannerUrl}) center/cover` : 'rgba(255,255,255,0.03)' }}>
                    <div className="flex justify-between items-start flex-wrap gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Trophy size={32} style={{ color: 'var(--color-gold)' }} />
                                <h1 className="text-4xl font-outfit">{activeLeague.name}</h1>
                            </div>
                            <p className="text-secondary text-sm mb-4">{activeLeague.description}</p>
                            <div className="flex items-center gap-4 flex-wrap text-xs text-muted">
                                <span className="flex items-center gap-1"><Users size={12} /> {activeLeague.memberIds.length} membros</span>
                                <span className="flex items-center gap-1"><Calendar size={12} /> Início: {new Date(activeLeague.startDate).toLocaleDateString('pt-BR')}</span>
                                <span className="px-2 py-1 rounded-lg glass text-[10px] font-bold" style={{ color: 'var(--color-gold)' }}>
                                    {activeLeague.status === 'active' ? '🟢 ATIVA' : '⚫ CONCLUÍDA'}
                                </span>
                            </div>
                        </div>

                        {/* Invite Code */}
                        <div className="glass border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-2">
                            <p className="text-xs text-muted uppercase tracking-widest">Código de Convite</p>
                            <p className="text-2xl font-bold font-mono tracking-widest">{activeLeague.inviteCode}</p>
                            <div className="flex gap-2">
                                <button onClick={handleCopyCode} className="glass px-3 py-1 rounded-lg text-xs flex items-center gap-1 hover:border-purple/30 transition-all border border-white/5">
                                    {codeCopied ? <Check size={12} /> : <Copy size={12} />} Código
                                </button>
                                <button onClick={handleCopyLink} className="glass px-3 py-1 rounded-lg text-xs flex items-center gap-1 hover:border-purple/30 transition-all border border-white/5">
                                    <Link size={12} /> Link
                                </button>
                            </div>
                            <button onClick={() => setIsQRModalOpen(true)} className="mt-2 text-[10px] uppercase font-bold text-secondary hover:text-white transition-colors underline">
                                Mostrar QR Code
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="sticky top-20 z-20 flex gap-2 mb-6 glass p-1 rounded-2xl w-full overflow-x-auto no-scrollbar shadow-2xl backdrop-blur-xl border border-white/10 md:w-fit">
                    {(['ranking', 'tournaments', 'membros', 'temporadas', 'ajustes'] as LeagueTabId[]).map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all capitalize whitespace-nowrap ${tab === t ? 'glass border border-purple/30 text-purple' : 'text-secondary hover:text-primary'}`}
                            style={{ color: tab === t ? 'var(--color-purple)' : undefined }}>
                            {t === 'ranking' ? '🏆 Ranking' : t === 'tournaments' ? '⚔️ Torneios' : t === 'membros' ? '👥 Membros' : t === 'temporadas' ? '🏅 Temporadas' : 'ℹ️ Ajustes'}
                        </button>
                    ))}
                </div>

                {/* RANKING TAB */}
                {tab === 'ranking' && (
                    <div className="flex flex-col gap-4">
                        {isOrganizer && (
                            <div className="flex justify-end">
                                <Button onClick={handleRecalculate} variant="secondary" size="sm" disabled={recalcLoading}>
                                    <RefreshCw size={14} className={`mr-2 ${recalcLoading ? 'animate-spin' : ''}`} />
                                    Recalcular Ranking
                                </Button>
                            </div>
                        )}
                        {standings.length === 0 ? (
                            <div className="text-center py-16 opacity-40">
                                <Trophy size={48} className="mx-auto mb-4 opacity-30" />
                                <p>Nenhum resultado ainda. Finalize um torneio vinculado para atualizar.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {standings.map((s, i) => (
                                    <div key={s.playerId}
                                        className={`glass border rounded-2xl px-6 py-4 flex items-center gap-4 transition-all hover:border-purple/20
                                            ${i === 0 ? 'border-yellow-400/30 bg-yellow-400/5' : i === 1 ? 'border-gray-400/30' : i === 2 ? 'border-orange-400/30' : 'border-white/5'}`}>
                                        <div className="text-2xl w-10 text-center">{i < 3 ? MEDALS[i] : `#${s.rank}`}</div>
                                        <div className="flex-1">
                                            <p className="font-bold flex items-center gap-2 flex-wrap">
                                                {s.playerName}
                                                {s.currentStreak && s.currentStreak >= 2 ? (
                                                    <span className="text-[10px] bg-orange-500/20 text-orange-400 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-orange-500/30 animate-pulse">
                                                        🔥 {s.currentStreak} Top Cut
                                                    </span>
                                                ) : null}
                                            </p>
                                            <p className="text-xs text-muted mt-1">{s.tournamentsPlayed} torneio{s.tournamentsPlayed !== 1 ? 's' : ''}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold" style={{ color: 'var(--color-purple)' }}>{s.totalPoints}</p>
                                            <p className="text-xs text-muted">pts</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TOURNAMENTS TAB */}
                {tab === 'tournaments' && (
                    <div className="flex flex-col gap-4">
                        {isOrganizer && (
                            <div className="flex justify-end">
                                <Button onClick={() => setLinkMode(!linkMode)} variant="secondary" size="sm">
                                    {linkMode ? 'Cancelar' : '+ Vincular Torneio'}
                                </Button>
                            </div>
                        )}
                        {linkMode && (
                            <Card title="Seus Torneios Disponíveis">
                                {myTournaments.length === 0 ? (
                                    <p className="text-secondary text-sm">Nenhum torneio disponível para vincular.</p>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        {myTournaments.map(t => (
                                            <div key={t.id} className="flex justify-between items-center glass p-3 rounded-xl border border-white/5">
                                                <span className="text-sm font-medium">{t.name}</span>
                                                <Button size="sm" variant="glow" onClick={() => handleLinkTournament(t.id)}>Vincular</Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        )}
                        {activeLeague.tournamentIds.length === 0 ? (
                            <div className="text-center py-16 opacity-40">
                                <p>Nenhum torneio vinculado ainda.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {activeLeague.tournamentIds.map(tId => (
                                    <div key={tId} className="glass border border-white/5 rounded-2xl p-4 flex justify-between items-center">
                                        <span className="font-mono text-sm text-muted">{tId}</span>
                                        <Button size="sm" variant="secondary" onClick={() => navigate(`/tournament/${tId}`)}>Ver →</Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* AJUSTES TAB */}
                {tab === 'ajustes' && (
                    <LeagueDetailsTab
                        activeLeague={activeLeague}
                        isOrganizer={isOrganizer}
                        editMode={editMode}
                        editData={editData}
                        setEditMode={setEditMode}
                        setEditData={setEditData}
                        handleSaveEdit={handleSaveEdit}
                        handleOpenAudit={handleOpenAudit}
                        handleDeleteLeague={handleDeleteLeague}
                        setIsSeasonModalOpen={setIsSeasonModalOpen}
                    />
                )}


                {/* MEMBERS TAB */}
                {tab === 'membros' && (
                    <LeagueMembersTab
                        members={members}
                        isOrganizer={isOrganizer}
                        userId={user?.id}
                        onUpdateMember={handleUpdateMember}
                    />
                )}

                {/* SEASONS TAB */}
                {tab === 'temporadas' && (
                    <LeagueSeasonsTab seasons={seasons} />
                )}
            </div>

            {/* QR Code Modal for League Invite */}
            <Modal
                isOpen={isQRModalOpen}
                onClose={() => setIsQRModalOpen(false)}
                title="QR Code de Convite da Liga"
            >
                <div className="flex flex-col items-center justify-center p-8">
                    <div className="p-6 bg-white rounded-[2.5rem] shadow-2xl mb-6">
                        <QRCodeSVG value={getInviteLink('league', activeLeague.inviteCode)} size={300} />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{activeLeague.name}</h3>
                    <p className="text-secondary text-center mb-8">Aponte a câmera para que os jogadores entrem na liga instantaneamente.</p>
                    <div className="flex gap-4 w-full">
                        <Button variant="secondary" className="flex-1" onClick={handleCopyLink}>Copiar Link</Button>
                        <Button variant="primary" className="flex-1" onClick={() => setIsQRModalOpen(false)}>Fechar</Button>
                    </div>
                </div>
            </Modal>

            {/* Audit Log Modal */}
            <Modal
                isOpen={isAuditModalOpen}
                onClose={() => setIsAuditModalOpen(false)}
                title="Histórico de Ações da Liga"
            >
                <div className="p-4 flex flex-col gap-3 min-h-[300px] max-h-[60vh] overflow-y-auto no-scrollbar">
                    {auditLogs.length === 0 ? (
                        <p className="text-secondary text-center mt-10">Nenhum registro de ação encontrado.</p>
                    ) : (
                        auditLogs.map(log => (
                            <div key={log.id} className="glass p-3 rounded-xl border border-white/5 text-sm">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-purple">{log.action}</span>
                                    <span className="text-xs text-muted">{new Date(log.timestamp).toLocaleString('pt-BR')}</span>
                                </div>
                                <p className="text-secondary text-xs">{log.details}</p>
                                <p className="text-xs text-muted mt-2 border-t border-white/5 pt-1">Usuário: <span className="font-mono">{log.userId}</span></p>
                            </div>
                        ))
                    )}
                </div>
                <div className="p-4 border-t border-white/5">
                    <Button variant="secondary" className="w-full" onClick={() => setIsAuditModalOpen(false)}>Fechar</Button>
                </div>
            </Modal>

            {/* End Season Modal */}
            <Modal
                isOpen={isSeasonModalOpen}
                onClose={() => setIsSeasonModalOpen(false)}
                title="⚙️ Finalizar Temporada Atual"
            >
                <div className="p-6 flex flex-col gap-4">
                    <p className="text-sm text-secondary">Isso irá salvar o pódio atual no **Salão da Fama**, resetar o ranking e desvincular todos os torneios para começar uma nova era!</p>
                    <Input
                        label="Nome da Temporada"
                        placeholder="Ex: Season 2024 - Inverno"
                        value={seasonName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSeasonName(e.target.value)}
                    />
                    <div className="flex gap-2 mt-2">
                        <Button variant="secondary" className="flex-1" onClick={() => setIsSeasonModalOpen(false)}>Cancelar</Button>
                        <Button variant="glow" className="flex-1" onClick={handleArchiveSeason} disabled={!seasonName.trim()}>Concluir</Button>
                    </div>
                </div>
            </Modal>
        </PageShell>
    );
};

export default LeagueDashboard;
