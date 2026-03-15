import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Users, MapPin, Trophy, Info, Search, Sword, Crown, Medal } from 'lucide-react';
import PageShell from '../components/layout';
import { Button, Card, LoadingScreen, Modal, Input } from '../components/ui';
import { useTournamentStore } from '../features/tournaments/tournamentStore';
import { useAuthStore } from '../features/auth/authStore';
import { MatchCard } from '../features/tournaments/components/MatchCard';
import { IconPairingTable, IconShareInvite } from '../assets/icons';
import { getInviteLink, copyToClipboard } from '../utils/inviteHelper';
import { syncService } from '../features/tournaments/syncService';
import toast from 'react-hot-toast';

/**
 * Public Tournament Page (Phase 29)
 * Optimized for Player Experience with live pairings and search.
 */
const TournamentPublic: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { activeTournament, loadTournament, addParticipant } = useTournamentStore();

    const [activeTab, setActiveTab] = useState<'info' | 'rounds' | 'standings'>('info');
    const [searchTerm, setSearchTerm] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const [joinData, setJoinData] = useState({
        commanderName: '',
        decklistUrl: ''
    });

    useEffect(() => {
        if (id) {
            loadTournament(id);
            // Subscribe for real-time updates
            const unsubscribe = syncService.subscribe(id, () => {
                loadTournament(id);
            });
            return () => unsubscribe();
        }
    }, [id, loadTournament]);

    const filteredTables = useMemo(() => {
        // cast to any for now until types are updated
        const currentRoundData = (activeTournament as any)?.currentRoundData;
        if (!currentRoundData?.tables) return [];
        if (!searchTerm) return currentRoundData.tables;

        const term = searchTerm.toLowerCase();
        return currentRoundData.tables.filter((table: any) => {
            return table.playerIds.some((pid: string) => {
                const p = activeTournament?.participants.find(part => part.playerId === pid);
                return p?.name.toLowerCase().includes(term);
            });
        });
    }, [activeTournament, searchTerm]);

    if (!activeTournament) return <LoadingScreen message="Carregando torneio..." />;

    const joinedParticipant = activeTournament.participants.find(p => p.playerId === user?.id);
    const isJoined = joinedParticipant && joinedParticipant.status === 'active';

    const handleJoin = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (id) {
            try {
                await addParticipant(id, {
                    playerId: user.id,
                    name: user.name,
                    commanderName: joinData.commanderName,
                    decklistUrl: joinData.decklistUrl
                });
                toast.success('Inscrição confirmada!');
                setIsJoining(false);
            } catch (err) {
                toast.error('Erro ao entrar no torneio.');
            }
        }
    };

    return (
        <PageShell showBackground>
            <div className="container py-8 animate-fade-in">


                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Header & Content Area */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        {/* Hero Section - Phase 29 Visual Overhaul */}
                        <div className="mesh-gradient p-10 md:p-14 rounded-[2.5rem] relative overflow-hidden shadow-2xl border border-white/5 animate-fade-in">
                            <div className="absolute inset-0 bg-bg-dark/40 backdrop-blur-[2px]"></div>
                            <div className="relative z-10 flex flex-col gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="px-3 py-1 bg-[var(--fp-purple-lo)] border border-[rgba(139,92,246,0.3)] rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-[var(--fp-purple-hi)]">
                                        {activeTournament.format === 'multiplayer' ? 'MULTIJOGADOR' : activeTournament.format === '1v1' ? '1 VS 1' : 'TORNEIO TCG'}
                                    </div>
                                    {activeTournament.status === 'ongoing' && (
                                        <div className="px-3 py-1 bg-[var(--fp-emerald-lo)] border border-[rgba(16,185,129,0.3)] rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-[var(--fp-emerald-hi)] animate-pulse flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--fp-emerald)]" /> AO VIVO
                                        </div>
                                    )}
                                </div>
                                <h1 className="text-4xl md:text-6xl font-outfit font-black text-white leading-tight tracking-tight drop-shadow-2xl">
                                    {activeTournament.name}
                                </h1>
                                <div className="flex gap-6 flex-wrap text-secondary text-sm font-bold">
                                    <div className="flex items-center gap-2.5 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                                        <Calendar size={18} className="text-[var(--fp-purple)]" /> {new Date(activeTournament.date).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-2.5 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                                        <MapPin size={18} className="text-[var(--fp-purple)]" /> {activeTournament.location || 'Online'}
                                    </div>
                                    <div className="flex items-center gap-2.5 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                                        <Users size={18} className="text-[var(--fp-purple)]" /> {activeTournament.participants.length} / {activeTournament.maxParticipants || '∞'} Jogadores
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs Navigation - Premium Artifact Style */}
                        <div className="flex glass p-2 rounded-[1.5rem] gap-2 w-full lg:w-max backdrop-blur-2xl border border-white/5 shadow-xl">
                            {[
                                { id: 'info', label: 'Informações', icon: Info },
                                { id: 'rounds', label: 'Rodadas', icon: IconPairingTable },
                                { id: 'standings', label: 'Classificação', icon: Trophy }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                    className={`flex-1 lg:flex-none px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-500 flex items-center justify-center gap-3 font-outfit ${activeTab === tab.id ? 'bg-purple text-white shadow-glow-purple border border-purple/30' : 'text-muted hover:text-primary hover:bg-white/5'}`}
                                >
                                    <tab.icon size={14} className={activeTab === tab.id ? 'animate-float' : ''} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Contents */}
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {activeTab === 'info' && (
                                <Card title="Descrição do Evento" className="bg-white/1 border-white/5">
                                    <p className="text-secondary whitespace-pre-wrap leading-relaxed text-sm lg:text-base">
                                        {activeTournament.description || 'Nenhuma descrição detalhada fornecida pelo organizador.'}
                                    </p>
                                    <div className="mt-8 pt-8 border-t border-white/5">
                                        <h4 className="text-xs font-bold uppercase mb-4 text-muted tracking-widest">Regras e Formato</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-4 glass rounded-2xl flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-green/10 flex items-center justify-center text-green">⬢</div>
                                                <div>
                                                    <p className="text-[10px] text-muted font-bold uppercase">Entrada Tardia</p>
                                                    <p className="text-xs font-medium">{activeTournament.allowLateRegistration ? 'Permitida' : 'Somente no início'}</p>
                                                </div>
                                            </div>
                                            <div className="p-4 glass rounded-2xl flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue/10 flex items-center justify-center text-blue">⬢</div>
                                                <div>
                                                    <p className="text-[10px] text-muted font-bold uppercase">Desistência (Drop)</p>
                                                    <p className="text-xs font-medium">{activeTournament.allowWithdrawal ? 'Permitida' : 'Apenas após rodada'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            )}

                            {activeTab === 'rounds' && (
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-2">
                                        <div>
                                            <h3 className="text-xl font-outfit">Rodada Atual: {(activeTournament as any).currentRound || 1}</h3>
                                            <p className="text-xs text-muted">Acompanhe os emparceiramentos e mesas em tempo real.</p>
                                        </div>
                                        <div className="relative w-full lg:w-64 group">
                                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-purple transition-colors" />
                                            <input
                                                type="text"
                                                placeholder="Sua mesa (Procure seu nome)"
                                                className="w-full glass pl-10 pr-4 py-2.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-purple/50 transition-all border-white/5 bg-white/2"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {!(activeTournament as any).currentRoundData ? (
                                        <div className="glass p-12 rounded-3xl text-center border-dashed border-white/10">
                                            <Sword size={48} className="mx-auto text-muted mb-4 opacity-20" />
                                            <h4 className="text-lg font-bold">Aguardando Início</h4>
                                            <p className="text-sm text-muted">O organizador ainda não iniciou a primeira rodada.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {filteredTables.map((table: any, idx: number) => (
                                                <MatchCard
                                                    key={idx}
                                                    idx={idx}
                                                    table={table}
                                                    participants={activeTournament.participants}
                                                    isOrganizer={false}
                                                    status={table.results ? 'completed' : 'pending'}
                                                    onEnterResult={() => { }}
                                                    roundNumber={(activeTournament as any).currentRound || 1}
                                                />
                                            ))}
                                            {filteredTables.length === 0 && searchTerm && (
                                                <div className="col-span-full py-12 text-center text-muted text-sm">
                                                    Nenhum jogador encontrado com "{searchTerm}"
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'standings' && (
                                <Card title="Classificação Geral" className="bg-white/1 border-white/5">
                                    {activeTournament.participants.length === 0 ? (
                                        <p className="text-muted italic text-center py-8">Nenhum participante ainda.</p>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            {[...activeTournament.participants]
                                                .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
                                                .map((p, i) => (
                                                    <div
                                                        key={p.playerId}
                                                        className={`flex justify-between items-center p-4 rounded-2xl transition-all ${i === 0 ? 'bg-purple/10 border border-purple/20' : 'glass border-white/5'}`}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center font-bold text-sm ${
                                                                i === 0 ? 'text-[var(--fp-gold)]' : 
                                                                i === 1 ? 'text-[#94a3b8]' : 
                                                                i === 2 ? 'text-[#cd7c3a]' : 
                                                                'text-white'
                                                            }`}>
                                                                {i === 0 && <Crown size={16} />}
                                                                {i === 1 && <Medal size={16} />}
                                                                {i === 2 && <Medal size={16} />}
                                                                {i > 2 && i + 1}
                                                            </div>
                                                            <div>
                                                                <span className={`font-bold ${i === 0 ? 'text-purple' : 'text-primary'}`} style={i === 0 ? { color: 'var(--color-purple)' } : {}}>{p.name}</span>
                                                                <div className="flex gap-2 items-center mt-1">
                                                                    <span className="text-[10px] text-muted uppercase font-bold tracking-widest">{p.commanderName || 'Deck Privado'}</span>
                                                                    {(p as any).status === 'dropped' && <span className="text-[8px] bg-red/20 text-red px-1 rounded uppercase font-bold">Dropped</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-xl font-outfit font-black block">{p.totalPoints}</span>
                                                            <span className="text-[10px] text-muted uppercase font-bold">pontos</span>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </Card>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Actions */}
                    <div className="flex flex-col gap-6">
                        {/* Sidebar Actions - Phase 29 Visual Overhaul */}
                        <Card className="sticky top-24 border border-white/5 bg-black/60 backdrop-blur-3xl shadow-2xl shadow-purple/20 p-8 rounded-[2.5rem] transition-all duration-500 overflow-hidden">
                            {/* Inner glow */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple/30 to-transparent" />
                            <div className="text-center mb-8">
                                <p className="text-[10px] font-black text-muted uppercase tracking-[0.25em] mb-4">Status do Evento</p>
                                <div className="text-2xl font-black uppercase tracking-tight text-purple flex items-center justify-center gap-3 font-outfit">
                                    {activeTournament.status === 'ongoing' ? (
                                        <>
                                            <span className="w-2.5 h-2.5 rounded-full bg-green animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.6)]" />
                                            <span className="text-[var(--fp-emerald-hi)]">Ao Vivo</span>
                                        </>
                                    ) : (
                                        <span className="text-secondary opacity-60">
                                            {activeTournament.status === 'registration' ? 'Inscrições' : 'Finalizado'}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {activeTournament.status === 'ongoing' && (
                                <div className="p-4 bg-purple/5 border border-purple/10 rounded-2xl mb-6 text-center">
                                    <p className="text-[11px] text-secondary font-bold leading-relaxed uppercase tracking-wide">Acompanhe sua mesa na aba **Rodadas**!</p>
                                </div>
                            )}

                            {isJoined ? (
                                <div className="flex flex-col gap-4">
                                    <div className="p-6 bg-green/5 rounded-3xl border border-green/10 text-center">
                                        <p className="text-green font-bold flex items-center justify-center gap-2 text-sm" style={{ color: 'var(--color-green)' }}>
                                            Inscrição Garantida ✅
                                        </p>
                                        {activeTournament.status === 'registration' && (
                                            <p className="text-[10px] text-muted uppercase font-bold mt-2">Aguarde o início.</p>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        {user?.id === activeTournament.organizerId && (
                                            <Button variant="glow" onClick={() => navigate(`/tournament/${id}`)}>Acessar Painel</Button>
                                        )}
                                        <Button variant="secondary" onClick={() => navigate('/my-area')}>Minha Área</Button>
                                    </div>
                                </div>
                            ) : (
                                <Button
                                    variant="glow"
                                    className="w-full text-base py-4 shadow-2xl shadow-purple/40 font-black uppercase tracking-widest mt-4"
                                    onClick={() => activeTournament.format === 'multiplayer' ? setIsJoining(true) : handleJoin()}
                                    disabled={activeTournament.status !== 'registration'}
                                >
                                    {activeTournament.status === 'registration' ? 'Quero Participar' : 'Encerrado'}
                                </Button>
                            )}

                            {activeTournament.status === 'registration' && (
                                <div className="mt-8 pt-8 border-t border-white/5 flex flex-col gap-4">
                                    {activeTournament.requiresCheckIn && (
                                        <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl mb-2">
                                            <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider mb-1">Atenção</p>
                                            <p className="text-xs text-secondary leading-relaxed">Este torneio exige **Check-in**. Sua vaga só será confirmada quando você realizar o check-in no dia do evento.</p>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center px-1">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-muted uppercase tracking-widest">Convidar Amigos</span>
                                            <p className="text-[9px] text-muted italic">Inscrições abertas!</p>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(getInviteLink('tournament', activeTournament.id || ''), 'Link copiado!')}
                                            className="p-2 glass rounded-lg text-purple hover:bg-purple/10 transition-all hover:scale-110"
                                        >
                                            <IconShareInvite size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTournament.status === 'ongoing' && activeTournament.allowLateRegistration && (
                                <div className="mt-8 pt-8 border-t border-white/5 flex justify-between items-center px-1">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-muted uppercase tracking-widest">Entrada Tardia</span>
                                        <p className="text-[9px] text-green-500 font-bold uppercase">Ainda dá tempo!</p>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(getInviteLink('tournament', activeTournament.id || ''), 'Link copiado!')}
                                        className="p-2 glass rounded-lg text-purple hover:bg-purple/10 transition-all hover:scale-110"
                                    >
                                        <IconShareInvite size={18} />
                                    </button>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>

            {/* Modal de Inscrição */}
            <Modal
                isOpen={isJoining}
                onClose={() => setIsJoining(false)}
                title="🔥 Confirmar Entrada"
                footer={
                    <div className="flex gap-4 justify-end w-full">
                        <Button variant="secondary" onClick={() => setIsJoining(false)} className="flex-1">Pensei Melhor</Button>
                        <Button variant="glow" onClick={handleJoin} className="flex-1">Confirmar!</Button>
                    </div>
                }
            >
                <div className="flex flex-col gap-6">
                    <div className="glass p-4 rounded-2xl bg-purple/5 border-purple/10">
                        <p className="text-secondary text-sm leading-relaxed">Você está prestes a entrar em **{activeTournament.name}**. Boa sorte!</p>
                    </div>
                    <div className="flex flex-col gap-5">
                        <Input
                            label="Comandante (Opcional)"
                            placeholder="Ex: Atraxa, Praetors' Voice"
                            value={joinData.commanderName}
                            onChange={e => setJoinData(prev => ({ ...prev, commanderName: e.target.value }))}
                        />
                        <Input
                            label="Link da Decklist (Opcional)"
                            placeholder="Moxfield, LigaMagic, etc."
                            value={joinData.decklistUrl}
                            onChange={e => setJoinData(prev => ({ ...prev, decklistUrl: e.target.value }))}
                        />
                    </div>
                </div>
            </Modal>
        </PageShell>
    );
};

export default TournamentPublic;
