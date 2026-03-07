import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, CheckCircle2, Trophy, Plus, UserMinus, ChevronRight, Edit3, Copy, Check, Clock, RefreshCw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import PageShell from '../components/layout/PageShell';
import { Button, Card, Input, Modal } from '../components/ui';
import { useTournamentStore } from '../stores/tournamentStore';
import { useAuthStore } from '../stores/authStore';
import { tournamentService } from '../services/tournamentService';
import { syncService } from '../services/syncService';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import toast from 'react-hot-toast';

const TournamentDashboard: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { activeTournament, loadTournament, addParticipant, generateRound, regenerateRound, submitResult, withdrawParticipant, completeTournament } = useTournamentStore();
    const [activeTab, setActiveTab] = useState<'participants' | 'rounds' | 'standings' | 'settings'>('participants');
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

    if (!activeTournament) return <PageShell><div className="container section">Torneio não encontrado</div></PageShell>;

    const isOrganizer = activeTournament.organizerId === user?.id;

    const handleAddPlayer = () => {
        if (newPlayerName.trim() && id) {
            addParticipant(id, { name: newPlayerName.trim() }).catch(() => toast.error('Erro ao adicionar jogador.'));
            setNewPlayerName('');
            toast.success('Jogador adicionado!');
        }
    };

    let baseUrl = window.location.origin;
    if (baseUrl.includes('localhost') || baseUrl.includes('capacitor://')) {
        baseUrl = 'https://flashpoint-anti.web.app';
    }
    const inviteUrl = `${baseUrl}/join/${id}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(inviteUrl);
        setLinkCopied(true);
        toast.success('Link de convite copiado!');
        setTimeout(() => setLinkCopied(false), 2000);
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
                        <div className="flex items-center gap-2 mb-2 text-sm font-bold uppercase tracking-wider text-purple" style={{ color: 'var(--color-purple)' }}>
                            <Trophy size={14} /> Torneio {activeTournament.format === 'multiplayer' ? 'Multijogador' : '1 vs 1'}
                        </div>
                        <h1 className="text-4xl font-outfit">{activeTournament.name}</h1>
                        <div className="flex items-center gap-4 mt-1">
                            <p className="text-secondary">{activeTournament.date} • {activeTournament.location}</p>
                            {timeLeft && (
                                <div className="flex items-center gap-2 px-3 py-1 glass rounded-full border-purple/30 text-purple font-mono font-bold animate-pulse">
                                    <Clock size={14} />
                                    <span>{timeLeft}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {isOrganizer && activeTournament.status === 'registration' && (
                            <Button variant="glow" onClick={() => id && generateRound(id)}>
                                <Play size={18} className="mr-2" /> Iniciar 1ª Rodada
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
                        <Button variant="secondary" onClick={() => navigate(`/tournament/${id}/public`)}>Página Pública</Button>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex gap-1 p-1 glass rounded-2xl mb-8 w-max">
                    {[
                        { id: 'participants', label: 'Participantes' },
                        { id: 'rounds', label: 'Rodadas' },
                        { id: 'standings', label: 'Classificação' },
                        { id: 'settings', label: 'Configurações' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === tab.id ? 'bg-purple text-white shadow-lg' : 'text-secondary hover:text-primary'}`}
                            style={activeTab === tab.id ? { backgroundColor: 'var(--color-purple)' } : {}}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="animate-fade-in">
                    {activeTab === 'participants' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 flex flex-col gap-4">
                                <Card title={`Participantes (${activeTournament.participants.length})`}>
                                    <div className="flex flex-col gap-2">
                                        {activeTournament.participants.length === 0 ? (
                                            <p className="text-center py-8 text-muted">Nenhum jogador inscrito ainda.</p>
                                        ) : (
                                            <div className="flex flex-col gap-1">
                                                {activeTournament.participants.map(p => (
                                                    <div key={p.playerId} className="flex justify-between items-center p-3 glass rounded-xl">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-glass flex items-center justify-center font-bold text-xs">
                                                                {p.avatar
                                                                    ? <img src={p.avatar} className="w-full h-full rounded-full object-cover" alt="" />
                                                                    : p.name.charAt(0)
                                                                }
                                                            </div>
                                                            <div>
                                                                <span className={p.status === 'withdrawn' ? 'text-muted line-through' : ''}>{p.name}</span>
                                                                {p.status === 'withdrawn' && <span className="ml-2 text-[10px] uppercase font-bold text-white/40 glass px-2 py-0.5 rounded-full">Retirado</span>}
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    {p.commanderName && (
                                                                        <span className="text-[10px] text-purple font-bold uppercase tracking-tight" style={{ color: 'var(--color-purple)' }}>
                                                                            🎴 {p.commanderName}
                                                                        </span>
                                                                    )}
                                                                    {p.decklistUrl && (
                                                                        <a href={p.decklistUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue underline font-bold uppercase tracking-tight">
                                                                            Lista
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {p.commanderImageUrl && (
                                                                <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 group-hover:scale-150 transition-transform origin-right z-10">
                                                                    <img src={p.commanderImageUrl} className="w-full h-full object-cover" alt="" />
                                                                </div>
                                                            )}
                                                            {isOrganizer && p.status === 'active' && (
                                                                <button onClick={() => id && withdrawParticipant(id, p.playerId)} className="text-muted hover:text-red transition-colors">
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

                                {isOrganizer && (
                                    <Card title="🔗 Convite Automático">
                                        <div className="flex flex-col items-center gap-6">
                                            <button
                                                onClick={() => setIsQRModalOpen(true)}
                                                className="p-3 bg-white rounded-2xl hover:scale-105 transition-transform cursor-zoom-in"
                                                title="Clique para ampliar"
                                            >
                                                <QRCodeSVG value={inviteUrl} size={140} />
                                                <p className="text-[10px] text-zinc-500 mt-2 font-bold uppercase text-center">Clique para ampliar</p>
                                            </button>
                                            <div className="w-full">
                                                <Button variant="secondary" size="sm" onClick={handleCopyLink} className="w-full">
                                                    {linkCopied ? <Check size={16} className="mr-2" /> : <Copy size={16} className="mr-2" />}
                                                    {linkCopied ? 'Link Copiado!' : 'Copiar Link Convite'}
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'rounds' && (
                        <div className="flex flex-col gap-8">
                            {activeTournament.rounds.length === 0 ? (
                                <Card className="text-center py-12">
                                    <Play size={48} className="mx-auto mb-4 text-muted opacity-20" />
                                    <h3 className="text-xl mb-2">Torneio não começou</h3>
                                    <p className="text-secondary mb-6">Adicione participantes e inicie a primeira rodada para começar.</p>
                                    {isOrganizer && (
                                        <Button onClick={() => id && generateRound(id)}>Gerar 1ª Rodada</Button>
                                    )}
                                </Card>
                            ) : (
                                [...activeTournament.rounds].reverse().map(round => (
                                    <div key={round.number} className="flex flex-col gap-4">
                                        <div className="flex justify-between items-center px-2">
                                            <h3 className="text-2xl font-outfit">Rodada {round.number}</h3>
                                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase ${round.status === 'completed' ? 'bg-green/10 text-green' : 'bg-purple/10 text-purple'}`} style={{ color: round.status === 'completed' ? 'var(--color-green)' : 'var(--color-purple)' }}>
                                                {round.status === 'completed' && <CheckCircle2 size={14} />}
                                                {round.status === 'completed' ? 'Concluída' : 'Pendente'}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {round.tables.map((table, idx) => (
                                                <Card key={table.id} className="relative overflow-hidden group">
                                                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
                                                        <span className="text-xs font-bold text-muted uppercase tracking-tighter">Mesa {idx + 1}</span>
                                                        {table.status === 'completed' && <CheckCircle2 size={16} className="text-green" style={{ color: 'var(--color-green)' }} />}
                                                    </div>
                                                    <div className="flex flex-col gap-3">
                                                        {table.playerIds.map(pid => {
                                                            const player = activeTournament.participants.find(p => p.playerId === pid);
                                                            const res = table.results.find(r => r.playerId === pid);
                                                            return (
                                                                <div key={pid} className="flex justify-between items-center gap-2">
                                                                    <span className="text-sm truncate font-medium">{player?.name || 'Desconhecido'}</span>
                                                                    {table.status === 'completed' && (
                                                                        <span className="px-2 py-0.5 glass rounded text-[10px] font-bold text-gold" style={{ color: 'var(--color-gold)' }}>
                                                                            {res?.position}º • {res?.points} pts
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    {isOrganizer && activeTournament.status !== 'completed' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className={`mt-4 w-full border border-white/10 hover:border-purple/50 ${table.status === 'completed' ? 'bg-green/5 opacity-70' : 'bg-white/5'}`}
                                                            onClick={() => handleOpenResultModal(round.number, table)}
                                                        >
                                                            <Edit3 size={14} className="mr-2" /> {table.status === 'completed' ? 'Editar Resultados' : 'Lançar Resultados'}
                                                        </Button>
                                                    )}
                                                </Card>
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
                                                    <p className="text-secondary text-sm">{p.totalPoints} Pontos • {p.buchholz} BH</p>
                                                </div>
                                                <div className="px-4 py-1 rounded-full bg-white/5 text-[10px] font-bold uppercase tracking-widest">
                                                    {pos === 1 ? 'Campeão' : `${pos}º Lugar`}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            <Card title={activeTournament.status === 'completed' ? "Classificação Final" : "Classificação Atual"}>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="text-muted text-xs uppercase font-bold border-b border-white/5">
                                                <th className="pb-4 px-2">Posição</th>
                                                <th className="pb-4 px-2">Jogador</th>
                                                <th className="pb-4 px-2">Pontos</th>
                                                <th className="pb-4 px-2">BH</th>
                                                <th className="pb-4 px-2 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {activeTournament.participants.map((p, idx) => (
                                                <tr key={p.playerId} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                                                    <td className="py-4 px-2 text-sm font-bold">
                                                        {idx + 1 === 1 && <Trophy size={14} className="inline mr-2 text-gold" style={{ color: 'var(--color-gold)' }} />}
                                                        #{idx + 1}
                                                    </td>
                                                    <td className="py-4 px-2 font-medium">{p.name}</td>
                                                    <td className="py-4 px-2 font-bold text-primary">{p.totalPoints}</td>
                                                    <td className="py-4 px-2 text-secondary text-sm">{p.buchholz || 0}</td>
                                                    <td className="py-4 px-2 text-right">
                                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${p.status === 'active' ? 'bg-green/10 text-green' : 'bg-red/10 text-red'}`} style={{ color: p.status === 'active' ? 'var(--color-green)' : 'var(--color-red)' }}>
                                                            {p.status}
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
                        <div className="max-w-xl">
                            <Card title="Configurações do Torneio">
                                <div className="flex flex-col gap-6">
                                    <p className="text-secondary text-sm">Gerenciamento administrativo do seu evento.</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 glass rounded-xl">
                                            <span className="text-xs text-muted">Formato</span>
                                            <p className="font-bold">{activeTournament.format === 'multiplayer' ? 'Multijogador' : '1 vs 1'}</p>
                                        </div>
                                        <div className="p-4 glass rounded-xl">
                                            <span className="text-xs text-muted">Status</span>
                                            <p className="font-bold uppercase text-purple" style={{ color: 'var(--color-purple)' }}>
                                                {activeTournament.status === 'registration' ? 'Aberto' : activeTournament.status === 'ongoing' ? 'Em Andamento' : 'Concluído'}
                                            </p>
                                        </div>
                                    </div>
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
                        <Button variant="glow" onClick={handleSubmitTableResults}>Confirmar Pontos</Button>
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
                                            className="bg-bg-dark border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-purple/50 transition-all font-bold text-gold"
                                            style={{ color: 'var(--color-gold)' }}
                                            value={tempResults[pid] || 1}
                                            onChange={(e) => setTempResults(prev => ({ ...prev, [pid]: parseInt(e.target.value) }))}
                                        >
                                            {activeTournament.format === 'multiplayer' ? (
                                                <>
                                                    <option value="1">🏆 1º Lugar (Vitória)</option>
                                                    <option value="1">🛡️ Empate (1º)</option>
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
