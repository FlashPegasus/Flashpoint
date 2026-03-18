import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Tournament } from '../../../types';

interface LeagueTournamentsTabProps {
    isSuperAdmin: boolean;
    canManageTournaments: boolean;
    linkMode: boolean;
    setLinkMode: (mode: boolean) => void;
    myTournaments: Tournament[];
    handleLinkTournament: (id: string) => void;
    tournamentIds: string[];
    linkedTournaments: Record<string, Tournament>;
    allTournaments: Tournament[];
}

export const LeagueTournamentsTab: React.FC<LeagueTournamentsTabProps> = ({
    isSuperAdmin,
    canManageTournaments,
    linkMode,
    setLinkMode,
    myTournaments,
    handleLinkTournament,
    tournamentIds,
    linkedTournaments,
    allTournaments
}) => {
    const navigate = useNavigate();

    if (!isSuperAdmin) return null;

    return (
        <div className="flex flex-col gap-4">
            {canManageTournaments && (
                <div className="flex justify-end">
                    <button 
                        onClick={() => setLinkMode(!linkMode)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                                   bg-[rgba(192,57,43,0.1)] border border-[rgba(192,57,43,0.25)]
                                   text-[#e74c3c] hover:bg-[rgba(192,57,43,0.18)] transition-all"
                    >
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
                                <div 
                                    key={t.id}
                                    className="flex justify-between items-center p-3 rounded-xl
                                                bg-[rgba(255,255,255,0.02)] border border-[rgba(192,57,43,0.1)]"
                                >
                                    <span className="text-sm text-white">{t.name}</span>
                                    <button 
                                        onClick={() => handleLinkTournament(t.id)}
                                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white
                                                   bg-gradient-to-r from-[#c0392b] to-[#e67e22]
                                                   hover:opacity-90 transition-opacity"
                                    >
                                        Vincular
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {tournamentIds.length === 0 ? (
                <div className="py-16 text-center rounded-2xl
                                border border-dashed border-[rgba(192,57,43,0.15)]
                                bg-[rgba(192,57,43,0.02)]">
                    <p className="text-[#7a5c5c] text-sm">Nenhum torneio vinculado ainda.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {tournamentIds.map(tId => {
                        const tournament = linkedTournaments[tId] || allTournaments.find(t => t.id === tId);
                        return (
                            <div 
                                key={tId}
                                className="flex justify-between items-center p-4 rounded-2xl
                                            bg-[linear-gradient(160deg,#130a0a,#1a0c0c)]
                                            border border-[rgba(192,57,43,0.15)]"
                            >
                                <div className="flex flex-col">
                                    <span className="text-sm text-white font-medium">
                                        {tournament?.name || 'Carregando...'}
                                    </span>
                                    <span className="text-[10px] text-[#7a5c5c] font-mono">{tId.split('-')[0]}...</span>
                                </div>
                                <button 
                                    onClick={() => navigate(`/tournament/${tId}`)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold
                                               bg-[rgba(192,57,43,0.1)] border border-[rgba(192,57,43,0.25)]
                                               text-[#e74c3c] hover:bg-[rgba(192,57,43,0.18)] transition-all"
                                >
                                    Ver →
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
