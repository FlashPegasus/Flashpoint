import React from 'react';
import { Trophy, RefreshCw } from 'lucide-react';
import type { LeagueStanding } from '../../../types';
import { GlowAvatar } from '../../../components/ui';

const MEDALS = ['🥇', '🥈', '🥉'];

interface LeagueRankingTabProps {
    standings: LeagueStanding[];
    isAnyOrganizer: boolean;
    handleRecalculate: () => void;
    recalcLoading: boolean;
}

export const LeagueRankingTab: React.FC<LeagueRankingTabProps> = ({
    standings,
    isAnyOrganizer,
    handleRecalculate,
    recalcLoading
}) => {
    return (
        <div className="flex flex-col gap-4">
            {isAnyOrganizer && (
                <div className="flex justify-end">
                    <button 
                        onClick={handleRecalculate} 
                        disabled={recalcLoading}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                                   bg-[rgba(255,255,255,0.04)] border border-[rgba(192,57,43,0.2)]
                                   text-[#a07070] hover:text-[#e74c3c] hover:border-[rgba(192,57,43,0.4)]
                                   transition-all disabled:opacity-50"
                    >
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
                    {standings.map((s, i) => {
                        const borderCls = i === 0
                            ? 'border-[rgba(212,172,13,0.4)] bg-[rgba(212,172,13,0.05)]'
                            : i === 1 ? 'border-[rgba(160,160,160,0.25)]'
                            : i === 2 ? 'border-[rgba(180,100,60,0.25)]'
                            : 'border-[rgba(192,57,43,0.1)]';
                        return (
                            <div 
                                key={s.playerId}
                                className={`flex items-center gap-4 px-5 py-4 rounded-2xl
                                             bg-[linear-gradient(160deg,#130a0a,#1a0c0c)]
                                             border transition-all
                                             hover:border-[rgba(192,57,43,0.3)] ${borderCls}`}
                            >
                                <div className="text-xl w-10 text-center flex-shrink-0">
                                    {i < 3 ? MEDALS[i] : <span className="text-[#7a5c5c] text-sm font-bold">#{s.rank}</span>}
                                </div>
                                <GlowAvatar 
                                    seed={s.playerId || s.playerName} 
                                    size={32} 
                                    glowColor={s.activeGlow}
                                    chosenGuildId={s.chosenGuildId}
                                    level={s.level}
                                    className="border border-[rgba(255,255,255,0.1)] flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-white text-sm flex items-center gap-2 flex-wrap">
                                        {s.playerName}
                                        {s.currentStreak !== undefined && s.currentStreak >= 2 && (
                                            <span className="text-[10px] bg-[rgba(192,57,43,0.15)] text-[#e74c3c]
                                                             font-bold px-2 py-0.5 rounded-full border
                                                             border-[rgba(192,57,43,0.3)] animate-pulse">
                                                🔥 {s.currentStreak} Top Cut
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-[#7a5c5c] mt-0.5">
                                        {s.tournamentsPlayed} torneio{s.tournamentsPlayed !== 1 ? 's' : ''}
                                    </p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-lg font-bold text-[#e74c3c]">{s.totalPoints}</p>
                                    <p className="text-[10px] text-[#7a5c5c]">pts</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
