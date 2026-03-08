import React from 'react';
import { Trophy } from 'lucide-react';
import type { LeagueSeason } from '../../../types';

interface LeagueSeasonsTabProps {
    seasons: LeagueSeason[];
}

export const LeagueSeasonsTab: React.FC<LeagueSeasonsTabProps> = ({ seasons }) => {
    return (
        <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold mb-2">Salão da Fama</h3>
            {seasons.length === 0 ? (
                <div className="text-center py-12 glass rounded-2xl border border-dashed border-white/10">
                    <Trophy size={48} className="mx-auto text-secondary/30 mb-3" />
                    <p className="text-secondary">A primeira temporada ainda está em progresso!</p>
                </div>
            ) : (
                seasons.map(s => (
                    <div key={s.id} className="glass p-5 rounded-3xl border border-purple/20 shadow-xl overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Trophy size={60} />
                        </div>
                        <h4 className="text-lg font-bold text-purple mb-1">{s.name}</h4>
                        <p className="text-xs text-muted mb-4">{new Date(s.startDate).toLocaleDateString()} — {new Date(s.endDate).toLocaleDateString()}</p>

                        <div className="space-y-2">
                            {s.standings.slice(0, 3).map((std: any, i: number) => (
                                <div key={std.playerId} className="flex justify-between items-center text-sm p-2 bg-white/5 rounded-xl">
                                    <span className="flex gap-2">
                                        <span className="text-gold">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                                        {std.playerName}
                                    </span>
                                    <span className="font-bold text-purple">{std.totalPoints} pts</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};
