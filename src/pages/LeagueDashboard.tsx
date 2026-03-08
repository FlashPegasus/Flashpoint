import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Users, Calendar, Copy, Check, RefreshCw, Link, Trash2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import PageShell from '../components/layout';
import { Button, Card, LoadingScreen, Modal } from '../components/ui';
import { useLeagueStore } from '../features/leagues/leagueStore';
import { useAuthStore } from '../features/auth/authStore';
import { useTournamentStore } from '../features/tournaments/tournamentStore';
import { leagueService } from '../features/leagues/leagueService';
import toast from 'react-hot-toast';

const MEDALS = ['🥇', '🥈', '🥉'];

const LeagueDashboard: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { activeLeague, loadLeague, isLoading, recalculateStandings, linkTournament } = useLeagueStore();
    const { tournaments } = useTournamentStore();

    const [tab, setTab] = useState<'ranking' | 'tournaments' | 'info'>('ranking');
    const [codeCopied, setCodeCopied] = useState(false);
    const [recalcLoading, setRecalcLoading] = useState(false);
    const [linkMode, setLinkMode] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState<any>({});
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);

    useEffect(() => {
        if (id) loadLeague(id);
    }, [id, loadLeague]);

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

    const handleCopyCode = () => {
        navigator.clipboard.writeText(activeLeague.inviteCode);
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/join-league/${activeLeague.inviteCode}`);
        toast.success('Link copiado!');
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

    const myTournaments = tournaments.filter(t => t.organizerId === user?.id && !activeLeague.tournamentIds.includes(t.id));
    const standings = activeLeague.standings ?? [];

    return (
        <PageShell>
            <div className="container py-8 animate-fade-in">
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
                <div className="flex gap-2 mb-6 glass p-1 rounded-2xl w-fit">
                    {(['ranking', 'tournaments', 'info'] as const).map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all capitalize ${tab === t ? 'glass border border-purple/30 text-purple' : 'text-secondary hover:text-primary'}`}
                            style={{ color: tab === t ? 'var(--color-purple)' : undefined }}>
                            {t === 'ranking' ? '🏆 Ranking' : t === 'tournaments' ? '⚔️ Torneios' : 'ℹ️ Info'}
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
                                            <p className="font-bold">{s.playerName}</p>
                                            <p className="text-xs text-muted">{s.tournamentsPlayed} torneio{s.tournamentsPlayed !== 1 ? 's' : ''}</p>
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

                {/* INFO TAB */}
                {tab === 'info' && (
                    <Card title="Configurações da Liga">
                        {isOrganizer && !editMode && (
                            <div className="flex justify-end mb-4">
                                <Button size="sm" variant="secondary" onClick={() => {
                                    setEditData({
                                        name: activeLeague.name,
                                        description: activeLeague.description,
                                        pointsParticipation: activeLeague.pointsParticipation,
                                        pointsWin: activeLeague.pointsWin,
                                        pointsTop4: activeLeague.pointsTop4,
                                        pointsTop8: activeLeague.pointsTop8,
                                        bestXof: activeLeague.bestXof || '',
                                        visibility: activeLeague.visibility,
                                    });
                                    setEditMode(true);
                                }}>✏️ Editar Informações</Button>
                            </div>
                        )}

                        {editMode ? (
                            <div className="flex flex-col gap-4 animate-fade-in">
                                <label className="text-xs text-secondary mt-2">Nome da Liga</label>
                                <input className="w-full glass p-3 border-white/5 text-primary"
                                    value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} />

                                <label className="text-xs text-secondary mt-2">Descrição</label>
                                <textarea className="w-full glass p-3 border-white/5 text-primary"
                                    value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })} />

                                <label className="text-xs text-secondary mt-2">Visibilidade</label>
                                <select className="w-full glass p-3 border-white/5 text-primary bg-bg-dark"
                                    value={editData.visibility} onChange={e => setEditData({ ...editData, visibility: e.target.value })}>
                                    <option value="public">🌍 Pública (Aparece na lista)</option>
                                    <option value="private">🔒 Privada (Apenas por código)</option>
                                </select>

                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <label className="text-xs text-secondary mb-1 block">Pts Participação</label>
                                        <input type="number" className="w-full glass p-2 border-white/5 text-primary"
                                            value={editData.pointsParticipation} onChange={e => setEditData({ ...editData, pointsParticipation: +e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-secondary mb-1 block">Pts Vitória (1º)</label>
                                        <input type="number" className="w-full glass p-2 border-white/5 text-primary"
                                            value={editData.pointsWin} onChange={e => setEditData({ ...editData, pointsWin: +e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-secondary mb-1 block">Pts Top 4</label>
                                        <input type="number" className="w-full glass p-2 border-white/5 text-primary"
                                            value={editData.pointsTop4} onChange={e => setEditData({ ...editData, pointsTop4: +e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-secondary mb-1 block">Pts Top 8</label>
                                        <input type="number" className="w-full glass p-2 border-white/5 text-primary"
                                            value={editData.pointsTop8} onChange={e => setEditData({ ...editData, pointsTop8: +e.target.value })} />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs text-secondary mb-1 block">Melhores X Torneios (Deixe vazio para somar tudo)</label>
                                        <input type="number" className="w-full glass p-2 border-white/5 text-primary" placeholder="Ex: 8"
                                            value={editData.bestXof} onChange={e => setEditData({ ...editData, bestXof: e.target.value ? +e.target.value : undefined })} />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-white/5">
                                    <Button variant="ghost" onClick={() => setEditMode(false)}>Cancelar</Button>
                                    <Button variant="glow" onClick={handleSaveEdit}>Salvar Alterações</Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                                    {[
                                        { label: 'Participação', value: activeLeague.pointsParticipation ?? 1 },
                                        { label: 'Vitória (1º)', value: activeLeague.pointsWin ?? 5 },
                                        { label: 'Top 4', value: activeLeague.pointsTop4 ?? 3 },
                                        { label: 'Top 8', value: activeLeague.pointsTop8 ?? 2 },
                                    ].map(item => (
                                        <div key={item.label} className="glass rounded-xl p-4 border border-white/5">
                                            <p className="text-muted text-xs mb-1">{item.label}</p>
                                            <p className="text-2xl font-bold" style={{ color: 'var(--color-purple)' }}>{item.value} pts</p>
                                        </div>
                                    ))}
                                </div>
                                {activeLeague.bestXof && (
                                    <div className="mt-4 p-4 glass rounded-2xl border border-purple/20">
                                        <p className="font-bold text-sm">💎 Regra "Melhores X Torneios"</p>
                                        <p className="text-muted text-xs mt-1">Apenas os <strong>{activeLeague.bestXof} melhores resultados</strong> de cada jogador contam para o ranking.</p>
                                    </div>
                                )}
                                {isOrganizer && (
                                    <div className="mt-8 pt-4 border-t border-red/20">
                                        <Button variant="danger" className="w-full flex justify-center items-center" onClick={handleDeleteLeague}>
                                            <Trash2 size={16} className="mr-2" /> Excluir Liga
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </Card>
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
                        <QRCodeSVG value={`${window.location.origin}/join-league/${activeLeague.inviteCode}`} size={300} />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{activeLeague.name}</h3>
                    <p className="text-secondary text-center mb-8">Aponte a câmera para que os jogadores entrem na liga instantaneamente.</p>
                    <div className="flex gap-4 w-full">
                        <Button variant="secondary" className="flex-1" onClick={handleCopyLink}>Copiar Link</Button>
                        <Button variant="primary" className="flex-1" onClick={() => setIsQRModalOpen(false)}>Fechar</Button>
                    </div>
                </div>
            </Modal>
        </PageShell>
    );
};

export default LeagueDashboard;
