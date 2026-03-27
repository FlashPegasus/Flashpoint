import React from 'react';
import { Play, RefreshCw, CheckCircle2, ChevronRight } from 'lucide-react';
import { MatchCard } from './MatchCard';
import type { Tournament, Table } from '../../../types';

interface TournamentRoundsTabProps {
    id: string | undefined;
    activeTournament: Tournament;
    isOrganizer: boolean;
    isEditingTables: boolean;
    setIsEditingTables: (val: boolean) => void;
    swapSource: { tableId: string, playerId: string } | null;
    setSwapSource: (val: { tableId: string, playerId: string } | null) => void;
    isShuffleAnimating: boolean;
    generateRound: (id: string) => Promise<void>;
    handleOpenResultModal: (roundNum: number, table: Table) => void;
    handleSwapSelection: (tableId: string, playerId: string) => void;
    setIsResortModalOpen: (val: boolean) => void;
}

export const TournamentRoundsTab: React.FC<TournamentRoundsTabProps> = ({
    id,
    activeTournament,
    isOrganizer,
    isEditingTables,
    setIsEditingTables,
    swapSource,
    setSwapSource,
    isShuffleAnimating,
    generateRound,
    handleOpenResultModal,
    handleSwapSelection,
    setIsResortModalOpen
}) => {
    return (
        <div className="flex flex-col gap-8 animate-fade-in">
            {activeTournament.rounds.length === 0 ? (
                <div className="fp-card p-12 text-center">
                    <Play size={44} className="mx-auto mb-4 text-[var(--fp-muted)] opacity-20" />
                    <h3 className="text-xl font-semibold mb-2">Torneio ainda não começou</h3>
                    <p className="text-[var(--fp-muted)] text-sm mb-6">
                        Adicione participantes e inicie a primeira rodada.
                    </p>
                    {isOrganizer && (
                        <button className="fp-btn-primary px-6 py-2.5 rounded-xl text-sm"
                                onClick={() => id && generateRound(id)}>
                            Gerar 1ª Rodada
                        </button>
                    )}
                </div>
            ) : (
                [...activeTournament.rounds].sort((a, b) => b.number - a.number).map(round => (
                    <div key={round.number} className="flex flex-col gap-4">
                        {/* Cabeçalho da rodada */}
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-xl font-semibold text-[var(--fp-text)]">
                                Rodada {round.number}
                            </h3>
                            <div className="flex items-center gap-3">
                                {isOrganizer && round.status === 'pending' && (
                                    <button 
                                        onClick={() => {
                                            setIsEditingTables(!isEditingTables);
                                            setSwapSource(null);
                                        }}
                                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border transition-all
                                            ${isEditingTables 
                                                ? 'bg-[var(--fp-purple)] text-white border-[var(--fp-purple)] shadow-glow-sm' 
                                                : 'bg-white/5 text-[var(--fp-muted)] border-white/10 hover:bg-white/10'}`}>
                                        <RefreshCw size={10} className={isEditingTables ? 'animate-spin-slow' : ''} />
                                        {isEditingTables ? 'Concluir Ajuste' : 'Ajustar Mesas'}
                                    </button>
                                )}
                                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase border
                                    ${round.status === 'completed'
                                        ? 'bg-[var(--fp-emerald-lo)] text-[var(--fp-emerald-hi)] border-[rgba(16,185,129,0.3)]'
                                        : 'bg-[var(--fp-purple-lo)] text-[var(--fp-purple-hi)] border-[rgba(139,92,246,0.3)]'
                                    }`}>
                                    {round.status === 'completed' && <CheckCircle2 size={12} />}
                                    {round.status === 'completed' ? 'Concluída' : 'Pendente'}
                                </span>
                            </div>
                        </div>

                        {/* Match cards */}
                        <div id={`round-${round.number}`} 
                             className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-500
                                        ${isShuffleAnimating ? 'shuffle-animating' : ''}`}>
                            {round.tables.map((table, idx) => (
                                <div id={`table-${table.id}`} key={table.id} className="relative">
                                    <MatchCard
                                        idx={idx}
                                        table={table}
                                        participants={activeTournament.participants}
                                        isOrganizer={isOrganizer && activeTournament.status !== 'completed'}
                                        status={table.status === 'completed' ? 'completed' : 'pending'}
                                        onEnterResult={() => handleOpenResultModal(round.number, table)}
                                        roundNumber={round.number}
                                        isEditing={isOrganizer && isEditingTables && round.status === 'pending' && round.number === activeTournament.rounds.length}
                                        onSwapSelect={handleSwapSelection}
                                        swapSource={swapSource}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}

            {/* Próxima rodada */}
            {isOrganizer
                && activeTournament.rounds.every(r => r.status === 'completed')
                && activeTournament.rounds.length > 0
                && activeTournament.status === 'ongoing' && (
                <button className="fp-btn-primary self-center px-7 py-3 rounded-xl flex items-center gap-2 mt-2"
                        onClick={() => id && generateRound(id)}>
                    Próxima Rodada <ChevronRight size={16} />
                </button>
            )}

            {/* Sortear Novamente (Regerar rodada) */}
            {isOrganizer
                && activeTournament.status === 'ongoing'
                && activeTournament.rounds.length > 0
                && activeTournament.rounds[activeTournament.rounds.length - 1].status === 'pending' && (
                <div className="mt-4 flex flex-col items-center gap-2 border-t border-white/5 pt-6">
                    <p className="text-[10px] text-[var(--fp-muted)] mb-1">
                        Problemas no pareamento? Faça um novo sorteio.
                    </p>
                    <button
                        onClick={() => setIsResortModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                                   text-[var(--fp-rose-hi)] border border-[rgba(244,63,94,0.3)]
                                   hover:bg-[rgba(244,63,94,0.1)] transition-colors">
                        <RefreshCw size={13} /> Sortear Novamente
                    </button>
                </div>
            )}
        </div>
    );
};
