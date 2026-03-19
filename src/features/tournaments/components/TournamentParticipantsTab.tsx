import React from 'react';
import { Search, Users, CheckCircle2, UserMinus, RefreshCw, Plus, UserPlus } from 'lucide-react';
import { tournamentService } from '../tournamentService';
import { Input } from '../../../components/ui';
import toast from 'react-hot-toast';
import type { Tournament, User } from '../../../types';
import type { NavigateFunction } from 'react-router-dom';

const dicebearUrl = (seed: string, size = 36) =>
    `https://api.dicebear.com/7.x/rings/svg?seed=${encodeURIComponent(seed)}&size=${size}`;

interface TournamentParticipantsTabProps {
    id: string | undefined;
    activeTournament: Tournament;
    isOrganizer: boolean;
    user: User | null;
    participantSearch: string;
    setParticipantSearch: (val: string) => void;
    newPlayerName: string;
    setNewPlayerName: (val: string) => void;
    handleAddPlayer: () => Promise<void>;
    withdrawParticipant: (tid: string, pid: string) => Promise<void>;
    addParticipant: (tid: string, p: any) => Promise<void>;
    refreshData: () => Promise<void>;
    navigate: NavigateFunction;
    locationPathname: string;
}

export const TournamentParticipantsTab: React.FC<TournamentParticipantsTabProps> = ({
    id,
    activeTournament,
    isOrganizer,
    user,
    participantSearch,
    setParticipantSearch,
    newPlayerName,
    setNewPlayerName,
    handleAddPlayer,
    withdrawParticipant,
    addParticipant,
    refreshData,
    navigate,
    locationPathname
}) => {
    return (
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
                                .filter(p => 
                                    p.name.toLowerCase().includes(participantSearch.toLowerCase()) || 
                                    p.commanderName?.toLowerCase().includes(participantSearch.toLowerCase())
                                )
                                .map((p) => (
                                <div key={p.playerId}
                                     className="flex justify-between items-center p-3 rounded-xl
                                                bg-white/[0.03] border border-white/[0.05]
                                                hover:bg-white/[0.06] transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10 flex-shrink-0 bg-white/5">
                                            {p.avatar
                                                ? <img src={p.avatar} className="w-full h-full object-cover" alt="" />
                                                : <img src={dicebearUrl(p.playerId || p.name)} className="w-full h-full" alt="" />
                                            }
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 text-sm font-medium">
                                                <span className={(p.status === 'withdrawn' || p.status === 'dropped') ? 'text-[var(--fp-muted)] line-through' : 'text-[var(--fp-text)]'}>
                                                    {p.name}
                                                </span>
                                                {p.checkedIn && (
                                                    <CheckCircle2 size={12} className="text-[var(--fp-emerald)]" />
                                                )}
                                                {(p.status === 'withdrawn' || p.status === 'dropped') && (
                                                    <span className="text-[10px] font-bold uppercase text-white/30 px-2 py-0.5 bg-white/5 rounded-full">
                                                        {p.status === 'withdrawn' ? 'Retirado' : 'Dropado'}
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
                                        {isOrganizer && (p.status === 'withdrawn' || p.status === 'dropped' || p.status === 'active') && (
                                            <div className="flex gap-1">
                                                {p.status === 'active' && (
                                                    <button onClick={() => id && withdrawParticipant(id, p.playerId)}
                                                            title="Remover / Drop"
                                                            className="p-1.5 rounded-lg text-[var(--fp-muted)] hover:text-[var(--fp-rose)] hover:bg-[var(--fp-rose-lo)] transition-colors">
                                                        <UserMinus size={16} />
                                                    </button>
                                                )}
                                                {(p.status === 'withdrawn' || p.status === 'dropped') && (
                                                    <button onClick={async () => {
                                                        if (!id) return;
                                                        try {
                                                            await tournamentService.updateParticipantStatus(id, p.playerId, 'active');
                                                            toast.success(`${p.name} reativado!`);
                                                            refreshData();
                                                        } catch { toast.error('Erro ao reativar.'); }
                                                    }}
                                                            title="Reativar"
                                                            className="p-1.5 rounded-lg text-[var(--fp-emerald-hi)] hover:bg-[var(--fp-emerald-lo)] transition-colors">
                                                        <RefreshCw size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        {p.commanderImageUrl && (
                                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10
                                                            group-hover:scale-150 transition-transform origin-right z-10">
                                                <img src={p.commanderImageUrl} className="w-full h-full object-cover" alt="" />
                                            </div>
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
                        </div>
                    </div>
                )}

                {/* JOIN/LEAVE buttons for non-organizers or when in specific states */}
                <div className="flex flex-col gap-3">
                    {!isOrganizer && !activeTournament.participants.some(p => p.playerId === user?.id) && (
                        (activeTournament.status === 'registration' || 
                        (activeTournament.status === 'ongoing' && activeTournament.allowLateRegistration !== false))
                    ) && (
                        <button 
                            className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold bg-primary/20 border border-primary/50 text-primary-hi hover:bg-primary/30 transition-all shadow-glow-primary animate-pulse"
                            onClick={async () => {
                                if (!user) {
                                    navigate('/login', { state: { from: locationPathname } });
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
                            <UserPlus size={16} /> Participar Agora
                        </button>
                    )}

                    {!isOrganizer && activeTournament.participants.some(p => p.playerId === user?.id && p.status === 'active') && (
                        <button 
                            className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold bg-white/5 border border-white/10 text-[var(--fp-muted)] hover:text-[var(--fp-rose)] hover:bg-[var(--fp-rose-lo)] transition-all"
                            onClick={async () => {
                                if (!id || !user) return;
                                if (!window.confirm('Deseja realmente sair deste torneio? Seu status será alterado para "Dropado".')) return;
                                try {
                                    await tournamentService.updateParticipantStatus(id, user.id, 'dropped');
                                    toast.success('Você saiu do torneio.');
                                    refreshData();
                                } catch {
                                    toast.error('Erro ao sair do torneio.');
                                }
                            }}>
                            <UserMinus size={16} /> Sair do Torneio
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
