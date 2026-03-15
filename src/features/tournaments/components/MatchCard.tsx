import React from 'react';
import { Card, Button } from '../../../components/ui';
import { IconSubmitResults, IconPairingTable } from '../../../assets/icons';
import { CheckCircle2, Crown, Medal } from 'lucide-react';

interface MatchCardProps {
    idx: number;
    table: any;
    participants: any[];
    isOrganizer: boolean;
    status: 'pending' | 'completed';
    onEnterResult: (roundNum: number, table: any) => void;
    roundNumber: number;
}

/**
 * Reusable Match/Pairing Card (Phase 29)
 * Designed for both Organizer View and Player View.
 */
export const MatchCard: React.FC<MatchCardProps> = ({
    idx,
    table,
    participants,
    isOrganizer,
    status,
    onEnterResult,
    roundNumber
}) => {
    return (
        <Card className="relative overflow-hidden group transition-all duration-500 border-white/5 bg-bg-card/40 backdrop-blur-xl hover:shadow-glow-purple hover:border-purple/30 hover:-translate-y-1">
            {/* Holographic Overlay Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-purple/5 via-transparent to-blue/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div className="relative z-10 flex justify-between items-center mb-5 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${status === 'completed' ? 'bg-green/10 text-green' : 'bg-purple/10 text-purple'}`}>
                        <IconPairingTable size={14} />
                    </div>
                    <span className="text-xs font-black text-muted uppercase tracking-[0.15em]">Mesa {idx + 1}</span>
                </div>
                {status === 'completed' ? (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green/10 border border-green/20 text-[10px] font-bold text-green uppercase tracking-wider">
                        <CheckCircle2 size={10} /> Concluída
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple/10 border border-purple/20 text-[10px] font-bold text-purple uppercase tracking-wider animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple" /> Ao Vivo
                    </div>
                )}
            </div>

            <div className="relative z-10 flex flex-col gap-3.5">
                {table.playerIds.map((pid: string) => {
                    const player = participants.find(p => p.playerId === pid);
                    const res = table.results?.find((r: any) => r.playerId === pid);

                    return (
                        <div key={pid} className={`flex justify-between items-center group/player p-1 rounded-lg transition-all ${status === 'completed' && res?.position === 1 ? 'bg-[var(--fp-purple-lo)] border border-purple/10' : ''}`}>
                            <div className="flex items-center gap-3 truncate">
                                <div className={`w-1 h-4 rounded-full transition-all ${status === 'completed' && res?.position === 1 ? 'bg-[var(--fp-gold)]' : 'bg-white/10 group-hover/player:bg-purple'}`} />
                                <span className={`text-sm truncate font-bold tracking-tight ${status === 'completed' && res?.position === 1 ? 'text-[var(--fp-gold)]' : 'text-secondary'}`}>
                                    {player?.name || 'Desconhecido'}
                                </span>
                            </div>
                            {status === 'completed' && res && (
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black flex items-center gap-1.5 transition-colors ${
                                        res.position === 1 ? 'bg-[var(--fp-gold-lo)] text-[var(--fp-gold)] border border-[var(--fp-gold-lo)]' : 
                                        res.position === 2 ? 'bg-white/5 text-[#94a3b8] border border-white/10' :
                                        res.position === 3 ? 'bg-white/5 text-[#cd7c3a] border border-white/10' :
                                        'bg-white/5 text-muted border border-white/10'
                                    }`}>
                                        {res.position === 1 && <Crown size={10} />}
                                        {res.position === 2 && <Medal size={10} />}
                                        {res.position === 3 && <Medal size={10} />}
                                        {res.position > 3 && `${res.position}º`}
                                        <span className="opacity-70">{res.points} PTS</span>
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {isOrganizer && (
                <div className="relative z-10 mt-5 pt-4 border-t border-white/10">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`w-full group/btn transition-all ${status === 'completed' ? 'hover:bg-green/10' : 'hover:bg-purple/10'}`}
                        onClick={() => onEnterResult(roundNumber, table)}
                    >
                        <IconSubmitResults size={14} className="mr-2 group-hover/btn:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                            {status === 'completed' ? 'Editar Resultados' : 'Lançar Resultados'}
                        </span>
                    </Button>
                </div>
            )}
        </Card>
    );
};
