import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, CheckCircle2, Trophy, Plus, UserMinus, ChevronRight, Copy, Check, Clock, RefreshCw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import PageShell from '../components/layout';
import { Button, Card, Input, Modal, LoadingScreen } from '../components/ui';
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
    const [activeTab, setActiveTab] = useState<'participants' | 'rounds' | 'standings' | 'settings'>('participants');

    const handleToggleCheckIn = async () => {
        if (!id || !user || !activeTournament) return;
        const participant = activeTournament.participants.find(p => p.playerId === user.id);
        if (!participant) return;

        try {
            await toggleCheckIn(id, user.id, !participant.checkedIn);
            toast.success(participant.checkedIn ? 'Check-in cancelado.' : 'Check-in realizado com sucesso!');
        } catch (err) {
            toast.error('Erro ao realizar check-in.');
        }
    };

    useEffect(() => {
        if (user?.id && !user.isAnonymous) {
            loadMyLeagues(user.id);
        }
    }, [user, loadMyLeagues]);

    const [newPlayerName, setNewPlayerName] = useState('');
    const [linkCopied, setLinkCopied] = useState(false);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);

    // Modal State
    const [selectedTable, setSelectedTable] = useState<{ round: number, table: any } | null>(null);
    const [tempResults, setTempResults] = useState<Record<string, number>>({});

    useEffect(() => {
        if (!id) return;
        loadTournament(id);

        // Subscribe to real-time signals (low cost)
        const unsubscribe = syncService.subscribe(id, () => {
            loadTournament(id);
        });

        return () => unsubscribe();
    }, [id, loadTournament]);

    // Timer Logic
    const [timeLeft, setTimeLeft] = useState<string>('');

    useEffect(() => {
        if (!activeTournament?.currentRoundEndTime || activeTournament.status !== 'ongoing') {
            setTimeLeft('');
            return;
        }

        const interval = setInterval(() => {
            const end = new Date(activeTournament.currentRoundEndTime!).getTime();
            const now = new Date().getTime();
            const diff = end - now;

            if (diff <= 0) {
                setTimeLeft('00:00');
                clearInterval(interval);
                return;
            }

            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);

            // Toast notifications for time
            if (minutes === 5 && seconds === 0) {
                toast('Faltam 5 minutos para o fim do round!', { icon: '⏰', duration: 5000 });
            }

            setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }, 1000);

        return () => clearInterval(interval);
    }, [activeTournament?.currentRoundEndTime, activeTournament?.status]);

    const handleCancelTournament = async () => {
        if (window.confirm('Tem certeza que deseja cancelar e excluir este torneio permanentemente?')) {
            if (id) {
                try {
                    await tournamentService.deleteTournament(id);
                    toast.success('Torneio cancelado com sucesso.');
                    navigate('/my-area');
                } catch (err) {
                    toast.error('Erro ao excluir torneio.');
                }
            }
        }
    };

    if (isLoading && !activeTournament) return <LoadingScreen message="Carregando torneio..." />;

    if (!activeTournament) return <PageShell><div className="container section">Torneio não encontrado</div></PageShell>;

    const isOrganizer = activeTournament.organizerId === user?.id;

    const handleAddPlayer = async () => {
        if (newPlayerName.trim() && id) {
            try {
                await addParticipant(id, { name: newPlayerName.trim() });
                setNewPlayerName('');
                toast.success('Jogador adicionado!');
            } catch (err: any) {
                toast.error(err.message || 'Erro ao adicionar jogador.');
            }
        }
    };

    const inviteUrl = id ? getInviteLink('tournament', id) : '';

    const handleCopyLink = async () => {
        const success = await copyToClipboard(inviteUrl, 'Link de convite copiado!');
        if (success) {
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        }
    };

    const handleOpenResultModal = (roundNum: number, table: any) => {
        setSelectedTable({ round: roundNum, table });
        const initialResults: Record<string, number> = {};
        table.playerIds.forEach((pid: string) => {
            initialResults[pid] = 1;
        });
        setTempResults(initialResults);
    };

    const handleSubmitTableResults = () => {
        if (!id || !selectedTable) return;

        // confirmation prompt
        const confirmMsg = activeTournament.format === 'multiplayer'
            ? "Confirmar os resultados desta mesa?"
            : "Confirmar vencedor desta partida?";

        if (!window.confirm(confirmMsg)) return;

        const results = selectedTable.table.playerIds.map((pid: string) => {
            const pos = tempResults[pid] || 1;
            let pts = (selectedTable.table.playerIds.length + 1) - pos;
            if (activeTournament.format === '1v1') pts = pos === 1 ? 3 : 0;
            return { playerId: pid, position: pos, points: pts };
        });

        submitResult(id, selectedTable.round, selectedTable.table.id, results)
            .then(() => toast.success('Resultados salvos!'))
            .catch(() => toast.error('Erro ao salvar resultados.'));
        setSelectedTable(null);
    };

    return (
        <PageShell>
            <div className="container py-8">
                <Breadcrumbs
                    items={[
                        { label: 'Minha Área', path: '/my-area' },
                        { label: activeTournament.name }
                    ]}
                />

                {/* Header */}
                <div className="flex justify-between items-end mb-8 flex-wrap gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-sm font-bold uppercase tracking-wider text-accent-primary">
                            <Trophy size={14} /> Torneio {activeTournament.format === 'multiplayer' ? 'Multijogador' : '1 vs 1'}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-outfit font-bold tracking-tight text-accent-secondary drop-shadow-glow">
                            {activeTournament.name}
                        </h1>
                        <div className="flex items-center gap-4 mt-1">
                            <p className="text-secondary">{activeTournament.date} ⬢ {activeTournament.location}</p>
                            {timeLeft && (
                                <div className="flex items-center gap-2 px-3 py-1 glass rounded-full border-accent-glow text-accent-primary font-mono font-bold animate-pulse">
                                    <Clock size={14} />
                                    <span>{timeLeft}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {isOrganizer && activeTournament.status === 'draft' && (
                            <Button variant="glow" onClick={() => id && publishTournament(id)}>
                                <CheckCircle2 size={18} className="mr-2" /> Publicar Torneio
                            </Button>
                        )}
                        {isOrganizer && activeTournament.status === 'registration' && (
                            <Button variant="glow" onClick={() => id && generateRound(id)}>
                                <IconStartTournament size={18} className="mr-2" /> Iniciar 1ª Rodada
                            </Button>
                        )}
                        {isOrganizer && activeTournament.status === 'ongoing' && activeTournament.rounds.every(r => r.status === 'completed') && (
                            <Button variant="danger" onClick={() => id && completeTournament(id)}>
                                <CheckCircle2 size={18} className="mr-2" /> Finalizar Torneio
                            </Button>
                        )}
                        {isOrganizer && activeTournament.status === 'ongoing' && !activeTournament.currentRoundEndTime && (
                            <Button variant="secondary" onClick={async () => {
                                const duration = prompt('Duração do round em minutos:', '50');
                                if (duration && id) {
                                    const t = await tournamentService.getTournamentById(id);
                                    if (t) {
                                        await tournamentService.saveTournament({
                                            ...t,
                                            currentRoundEndTime: new Date(Date.now() + parseInt(duration) * 60000).toISOString()
                                        });
                                        loadTournament(id);
                                    }
                                }
                            }}>
                                <Clock size={18} className="mr-2" /> Iniciar Timer
                            </Button>
                        )}
                        {!isOrganizer && activeTournament.status === 'registration' && activeTournament.participants.some(p => p.playerId === user?.id) && (
                            <Button
                                variant={activeTournament.participants.find(p => p.playerId === user?.id)?.checkedIn ? 'secondary' : 'glow'}
                                onClick={handleToggleCheckIn}
                            >
                                {activeTournament.participants.find(p => p.playerId === user?.id)?.checkedIn ? 'Presença Confirmada ✅' : 'Confirmar Presença'}
                            </Button>
                        )}
                        <Button variant="secondary" onClick={() => navigate(`/tournament/${id}/public`)}>Página Pública</Button>
                    </div>
                </div>

                <div className="flex gap-1 p-1 glass rounded-2xl mb-12 w-max mx-auto md:mx-0">
                    {[
                        { id: 'participants', label: 'Participantes' },
                        { id: 'rounds', label: 'Rodadas' },
                        { id: 'standings', label: 'Classificação' },
                        { id: 'settings', label: 'Configurações' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 md:px-8 py-2.5 rounded-xl font-bold transition-all text-[11px] md:text-xs uppercase tracking-widest ${activeTab === tab.id ? 'bg-accent-primary text-white shadow-glow' : 'text-secondary hover:text-primary hover:bg-white/5'}`}
                            style={activeTab === tab.id ? { backgroundColor: 'var(--accent-primary)' } : {}}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="animate-fade-in">
                    {activeTab === 'participants' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 flex flex-col gap-4">
                                <Card variant="premium" title={`Participantes (${activeTournament.participants.length})`}>
                                    <div className="flex flex-col gap-2">
                                        {activeTournament.participants.length === 0 ? (
                                            <p className="text-center py-8 text-muted">Nenhum jogador inscrito ainda.</p>
                                        ) : (
                                            <div className="flex flex-col gap-1">
                                                {activeTournament.participants.map(p => (
                                                    <div key={p.playerId} className="flex justify-between items-center p-4 glass rounded-2xl hover:bg-white/5 hover:border-purple/30 transition-all group/row">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-glass border border-white/10 flex items-center justify-center font-bold text-sm shadow-inner overflow-hidden group-hover/row:shadow-glow-sm transition-all">
                                                                {p.avatar
                                                                    ? <img src={p.avatar} className="w-full h-full object-cover" alt="" />
                                                                    : p.name.charAt(0)
                                                                }
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`font-bold font-outfit text-base ${p.status === 'withdrawn' ? 'text-muted line-through opacity-50' : 'text-primary'}`}>{p.name}</span>
                                                                    {p.checkedIn && (
                                                                        <span title="Presença Confirmada" className="p-1 bg-green/10 rounded-full">
                                                                            <CheckCircle2 size={12} className="text-green" style={{ color: 'var(--color-green)' }} />
                                                                        </span>
                                                                    )}
                                                                    {p.status === 'withdrawn' && <span className="ml-2 text-[9px] uppercase font-black text-white/40 glass px-2 py-0.5 rounded-md border border-white/5">Retirado</span>}
                                                                </div>
                                                                <div className="flex items-center gap-3 mt-1">
                                                                    {p.commanderName && (
                                                                        <span className="text-[10px] text-accent-secondary font-black uppercase tracking-widest">
                                                                            ⚔️ {p.commanderName}
                                                                        </span>
                                                                    )}
                                                                    {p.decklistUrl && (
                                                                        <a href={p.decklistUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue underline font-bold uppercase tracking-tight opacity-60 hover:opacity-100 transition-opacity">
                                                                            Decklist
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            {p.commanderImageUrl && (
                                                                <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 group-hover/row:scale-150 transition-all origin-right z-20 shadow-2xl">
                                                                    <img src={p.commanderImageUrl} className="w-full h-full object-cover px-0" alt="" />
                                                                </div>
                                                            )}
                                                            {isOrganizer && p.status === 'active' && (
                                                                <button onClick={() => id && withdrawParticipant(id, p.playerId)} className="p-2 text-muted hover:text-red hover:bg-red/10 rounded-xl transition-all" title="Retirar Jogador">
                                                                    <UserMinus size={18} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </div>
                            <div className="flex flex-col gap-4">
                                {isOrganizer && activeTournament.status !== 'completed' && (
                                    <Card title="Adicionar Jogador">
                                        <div className="flex flex-col gap-4">
                                            <Input
                                                placeholder="Nome do jogador"
                                                value={newPlayerName}
                                                onChange={e => setNewPlayerName(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleAddPlayer()}
                                            />
                                            <Button variant="primary" className="w-full" onClick={handleAddPlayer}>
                                                <Plus size={18} className="mr-2" /> Adicionar
                                            </Button>
                                        </div>
                                    </Card>
                                )}

                        {isOrganizer && (activeTournament.status === 'registration' || (activeTournament.status === 'ongoing' && activeTournament.allowLateRegistration)) && (
                            <Card variant="premium" title="Link de Convite">
                                <div className="flex flex-col items-center gap-6">
                                    <button
                                        onClick={() => setIsQRModalOpen(true)}
                                        className="p-4 bg-white rounded-3xl hover:scale-105 transition-transform cursor-zoom-in shadow-2xl"
                                        title="Clique para ampliar"
                                    >
                                        <QRCodeSVG value={inviteUrl} size={150} />
                                        <p className="text-[9px] text-zinc-400 mt-3 font-bold uppercase text-center tracking-tighter">Clique para ver maior</p>
                                    </button>
                                    <div className="w-full">
                                        <Button variant="glow" size="sm" onClick={handleCopyLink} className="w-full">
                                            {linkCopied ? <Check size={16} className="mr-2" /> : <Copy size={16} className="mr-2" />}
                                            {linkCopied ? 'Copiado!' : 'Copiar Link'}
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'rounds' && (
                        <div className="flex flex-col gap-10">
                            {activeTournament.rounds.length === 0 ? (
                                <Card variant="premium" className="text-center py-20">
                                    <Play size={64} className="mx-auto mb-6 text-accent-primary/20 animate-pulse" />
                                    <h3 className="text-2xl font-outfit font-bold mb-3 tracking-tight">O Torneio ainda não começou</h3>
                                    <p className="text-secondary mb-8 max-w-sm mx-auto">Prepare o grid de batalha! Adicione participantes e inicie a primeira rodada para abrir as mesas.</p>
                                    {isOrganizer && (
                                        <Button variant="glow" onClick={() => id && generateRound(id)}>Gerar 1ª Rodada</Button>
                                    )}
                                </Card>
                            ) : (
                                [...activeTournament.rounds].reverse().map(round => (
                                    <div key={round.number} className="flex flex-col gap-4">
                                        <div className="flex justify-between items-center px-2">
                                            <h3 className="text-2xl font-outfit">Rodada {round.number}</h3>
                                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase ${round.status === 'completed' ? 'bg-green/10 text-green' : 'bg-accent-bg-glass text-accent-primary border border-accent-glow'}`} style={round.status === 'completed' ? { color: 'var(--color-green)' } : {}}>
                                                {round.status === 'completed' && <CheckCircle2 size={14} />}
                                                {round.status === 'completed' ? 'Concluída' : 'Pendente'}
                                            </div>
                                        </div>
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
                            {isOrganizer && activeTournament.rounds.every(r => r.status === 'completed') && activeTournament.rounds.length > 0 && activeTournament.status === 'ongoing' && (
                                <Button variant="glow" onClick={() => id && generateRound(id)} className="self-center mt-4">
                                    Próxima Rodada <ChevronRight size={18} className="ml-2" />
                                </Button>
                            )}

                            {isOrganizer && activeTournament.status === 'ongoing' &&
                                activeTournament.rounds.length > 0 &&
                                activeTournament.rounds[activeTournament.rounds.length - 1].status === 'pending' && (
                                    <div className="mt-8 flex flex-col items-center gap-2 border-t border-white/5 pt-8">
                                        <p className="text-xs text-muted mb-2">Problemas no pareamento? Você pode regerar a rodada atual.</p>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                if (window.confirm("Tem certeza que deseja regerar esta rodada? Todos os resultados não salvos serão perdidos.")) {
                                                    id && regenerateRound(id);
                                                }
                                            }}
                                            className="text-yellow-400 hover:text-yellow-300 border-yellow-500/20"
                                        >
                                            <RefreshCw size={14} className="mr-2" /> Regerar Rodada Atual
                                        </Button>
                                    </div>
                                )}
                        </div>
                    )}

                    {activeTab === 'standings' && (
                        <div className="flex flex-col gap-8">
                            {activeTournament.status === 'completed' && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    {[2, 1, 3].map((pos) => {
                                        const sorted = [...activeTournament.participants].sort((a, b) => (a.rank || 99) - (b.rank || 99));
                                        const p = sorted[pos - 1];
                                        if (!p) return null;
                                        return (
                                            <div key={pos} className={`p-6 glass rounded-2xl flex flex-col items-center gap-4 ${pos === 1 ? 'border-gold/30 bg-gold/5 order-1 md:order-2 scale-105' : 'border-white/10 order-2 md:order-1'}`} style={pos === 1 ? { borderColor: 'rgba(255,184,0, 0.3)' } : {}}>
                                                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${pos === 1 ? 'bg-gold text-bg-dark' : 'bg-white/10'}`} style={pos === 1 ? { backgroundColor: 'var(--color-gold)' } : {}}>
                                                    {pos === 1 ? <Trophy /> : pos}
                                                </div>
                                                <div className="text-center">
                                                    <h4 className="text-xl font-outfit">{p.name}</h4>
                                                    <p className="text-secondary text-sm">{p.totalPoints} Pontos ⬢ {p.buchholz} BH</p>
                                                </div>
                                                <div className="px-4 py-1 rounded-full bg-white/5 text-[10px] font-bold uppercase tracking-widest">
                                                    {pos === 1 ? 'Campeão' : `${pos}º Lugar`}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            <Card variant="premium" title={activeTournament.status === 'completed' ? "🏆 Hall da Fama" : "Classificação em Tempo Real"}>
                                <div className="overflow-x-auto custom-scrollbar">
                                    <table className="w-full text-left border-collapse min-w-[600px]">
                                        <thead>
                                            <tr className="text-muted text-[10px] uppercase font-bold border-b border-white/5 tracking-widest">
                                                <th className="pb-6 px-4">Pos.</th>
                                                <th className="pb-6 px-4">Jogador</th>
                                                <th className="pb-6 px-4 text-accent-primary">Pontos</th>
                                                <th className="pb-6 px-4">BH</th>
                                                <th className="pb-6 px-4 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/[0.03]">
                                            {activeTournament.participants.map((p, idx) => (
                                                <tr key={p.playerId} className="group hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-5 px-4">
                                                        <div className="flex items-center gap-3">
                                                            <span className={`text-sm font-bold font-mono ${idx === 0 ? 'text-gold' : 'text-secondary opacity-50'}`}>
                                                                {(idx + 1).toString().padStart(2, '0')}
                                                            </span>
                                                            {idx === 0 && <Trophy size={14} className="text-gold animate-bounce" style={{ color: 'var(--color-gold)' }} />}
                                                        </div>
                                                    </td>
                                                    <td className="py-5 px-4 font-outfit font-bold text-primary group-hover:text-accent-primary transition-colors">{p.name}</td>
                                                    <td className="py-5 px-4 font-bold text-lg text-accent-secondary">{p.totalPoints}</td>
                                                    <td className="py-5 px-4 text-secondary/60 font-mono text-sm">{p.buchholz || 0}</td>
                                                    <td className="py-5 px-4 text-right">
                                                        <span className={`text-[9px] uppercase font-black tracking-tighter px-2.5 py-1 rounded-md border ${p.status === 'active' ? 'bg-green/10 border-green/20 text-green' : 'bg-red/10 border-red/20 text-red'}`} style={{ color: p.status === 'active' ? 'var(--color-green)' : 'var(--color-red)' }}>
                                                            {p.status === 'active' ? 'Combate' : 'Dropado'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="max-w-2xl mx-auto lg:mx-0">
                            <Card variant="premium" title="Configurações Avançadas">
                                <div className="flex flex-col gap-8">
                                    <div className="flex items-start gap-4 p-4 glass rounded-2xl border-white/5 bg-white/2">
                                        <div className="p-3 glass rounded-xl text-accent-primary">
                                            <Clock size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm">Controle de Segurança</h4>
                                            <p className="text-secondary text-xs mt-1">Gerenciamento administrativo completo do seu evento em tempo real.</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 glass rounded-xl">
                                            <span className="text-xs text-muted">Formato</span>
                                            <p className="font-bold">{activeTournament.format === 'multiplayer' ? 'Multijogador' : '1 vs 1'}</p>
                                        </div>
                                        <div className="p-4 glass rounded-xl">
                                            <span className="text-xs text-muted">Status</span>
                                            <p className="font-bold uppercase text-accent-primary">
                                                {activeTournament.status === 'draft' ? 'Rascunho' : activeTournament.status === 'registration' ? 'Aberto' : activeTournament.status === 'ongoing' ? 'Em Andamento' : 'Concluído'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* League Linking Section */}
                                    {isOrganizer && (
                                        <div className="mt-4 p-4 glass rounded-2xl border border-white/5">
                                            <h4 className="font-bold mb-2 flex items-center gap-2"><Trophy size={16} /> Vincular a Liga</h4>
                                            {activeTournament.leagueId ? (
                                                <p className="text-sm text-green-400 font-bold" style={{ color: 'var(--color-green)' }}>
                                                    ✅ Este torneio já está vinculado a uma liga.
                                                </p>
                                            ) : myLeagues.length === 0 ? (
                                                <p className="text-sm text-secondary">Você não organiza nenhuma liga para vincular este torneio.</p>
                                            ) : (
                                                <div className="flex flex-col gap-3">
                                                    <p className="text-sm text-secondary">Escolha uma liga para que os resultados deste torneio contem para o ranking geral dela.</p>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        {myLeagues.map(l => (
                                                            <Button
                                                                key={l.id}
                                                                variant="secondary"
                                                                size="sm"
                                                                className="justify-between"
                                                                onClick={async () => {
                                                                    if (id && user?.id) {
                                                                        try {
                                                                            await linkTournament(l.id, id, user.id);
                                                                            toast.success('Torneio vinculado à liga!');
                                                                            loadTournament(id);
                                                                        } catch (err: any) {
                                                                            toast.error(err.message || 'Erro ao vincular torneio.');
                                                                        }
                                                                    }
                                                                }}
                                                            >
                                                                {l.name} <Plus size={14} />
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <Button variant="danger" className="w-full mt-4" onClick={handleCancelTournament}>
                                        Cancelar e Excluir Torneio
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </div>

            {/* Result Entry Modal */}
            <Modal
                isOpen={!!selectedTable}
                onClose={() => setSelectedTable(null)}
                title={`Resultados - Mesa ${activeTournament.rounds.find(r => r.number === selectedTable?.round)?.tables.findIndex(t => t.id === selectedTable?.table.id)! + 1}`}
                footer={
                    <div className="flex gap-4 justify-end">
                        <Button variant="secondary" onClick={() => setSelectedTable(null)}>Cancelar</Button>
                        <Button variant="glow" onClick={handleSubmitTableResults}>
                            <IconSubmitResults size={18} className="mr-2" /> Confirmar Pontos
                        </Button>
                    </div>
                }
            >
                <div className="flex flex-col gap-6">
                    <p className="text-secondary text-sm">Selecione a colocação final de cada jogador na mesa.</p>
                    <div className="flex flex-col gap-3">
                        {selectedTable?.table.playerIds.map((pid: string) => {
                            const player = activeTournament.participants.find(p => p.playerId === pid);
                            return (
                                <div key={pid} className="flex justify-between items-center p-4 glass rounded-2xl bg-white/2 border-white/5">
                                    <span className="font-bold text-primary">{player?.name}</span>
                                    <div className="flex items-center gap-3">
                                        <select
                                            className="bg-bg-dark border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-accent-primary transition-all font-bold text-gold"
                                            style={{ color: 'var(--color-gold)' }}
                                            value={tempResults[pid] || 1}
                                            onChange={(e) => setTempResults(prev => ({ ...prev, [pid]: parseInt(e.target.value) }))}
                                        >
                                            {activeTournament.format === 'multiplayer' ? (
                                                <>
                                                    <option value="1">🏆  1º Lugar (Vitória)</option>
                                                    <option value="1">�� Empate (1º)</option>
                                                    {selectedTable.table.playerIds.length >= 2 && <option value="2">2º Lugar</option>}
                                                    {selectedTable.table.playerIds.length >= 3 && <option value="3">3º Lugar</option>}
                                                    {selectedTable.table.playerIds.length >= 4 && <option value="4">4º Lugar</option>}
                                                </>
                                            ) : (
                                                <>
                                                    <option value="1">Vencedor(a)</option>
                                                    <option value="2">Perdedor(a)</option>
                                                    <option value="0">Empate</option>
                                                </>
                                            )}
                                        </select>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Modal>

            {/* QR Code Expanded Modal */}
            <Modal
                isOpen={isQRModalOpen}
                onClose={() => setIsQRModalOpen(false)}
                title="QR Code de Convite"
            >
                <div className="flex flex-col items-center justify-center p-8">
                    <div className="p-6 bg-white rounded-[2.5rem] shadow-2xl mb-6">
                        <QRCodeSVG value={inviteUrl} size={300} />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{activeTournament.name}</h3>
                    <p className="text-secondary text-center mb-8">Aponte a câmera para que os jogadores se inscrevam instantaneamente.</p>
                    <div className="flex gap-4 w-full">
                        <Button variant="secondary" className="flex-1" onClick={handleCopyLink}>Copiar Link</Button>
                        <Button variant="primary" className="flex-1" onClick={() => setIsQRModalOpen(false)}>Fechar</Button>
                    </div>
                </div>
            </Modal>

            <style>{`
                .animate-fade-in { animation: fadeIn 0.3s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .glass-card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 1.5rem; }
            `}</style>
        </PageShell>
    );
};

export default TournamentDashboard;

