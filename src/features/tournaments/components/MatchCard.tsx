import { Card, Button } from '../../../components/ui';
import { IconSubmitResults, IconPairingTable } from '../../../assets/icons';
import { CheckCircle2, Crown } from 'lucide-react';

interface MatchCardProps {
    idx: number;
    table: any;
    participants: any[];
    isOrganizer: boolean;
    status: 'pending' | 'completed';
    onEnterResult: (roundNum: number, table: any) => void;
    roundNumber: number;
    isEditing?: boolean;
    onSwapSelect?: (tableId: string, playerId: string) => void;
    swapSource?: { tableId: string, playerId: string } | null;
}

export const MatchCard: React.FC<MatchCardProps> = ({
    idx,
    table,
    participants,
    isOrganizer,
    status,
    onEnterResult,
    roundNumber,
    isEditing,
    onSwapSelect,
    swapSource
}) => {
    return (
        <Card className="relative overflow-hidden group transition-all duration-500 border-white/5 bg-black/40 backdrop-blur-xl hover:shadow-lg hover:border-purple/30 hover:-translate-y-1">
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
                    const isSource = swapSource?.playerId === pid;

                    return (
                        <div 
                            key={pid} 
                            onClick={() => isEditing && onSwapSelect && onSwapSelect(table.id, pid)}
                            className={`flex justify-between items-center group/player p-1.5 rounded-lg transition-all 
                                ${status === 'completed' && res?.status === 'WINNER' ? 'bg-[var(--fp-purple-lo)] border border-purple/10' : ''}
                                ${isEditing ? 'cursor-pointer hover:bg-white/5 border border-transparent' : ''}
                                ${isSource ? 'border-[var(--fp-purple)] bg-[var(--fp-purple-lo)] shadow-glow-sm' : ''}
                                ${isEditing && !isSource ? 'hover:border-white/20' : ''}
                            `}
                        >
                            <div className="flex items-center gap-3 truncate">
                                <div className={`w-1 h-4 rounded-full transition-all 
                                    ${status === 'completed' && res?.status === 'WINNER' ? 'bg-[var(--fp-gold)]' : 
                                      isSource ? 'bg-[var(--fp-purple)]' :
                                      'bg-white/10 group-hover/player:bg-purple'}`} 
                                />
                                <span className={`text-sm truncate font-bold tracking-tight 
                                    ${status === 'completed' && res?.status === 'WINNER' ? 'text-[var(--fp-gold)]' : 
                                      isSource ? 'text-[var(--fp-purple-hi)]' :
                                      'text-secondary'}`}>
                                    {player?.name || 'Desconhecido'}
                                </span>
                            </div>
                            {status === 'completed' && res && (
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black flex items-center gap-1.5 transition-colors ${
                                        res.status === 'WINNER' ? 'bg-[var(--fp-gold-lo)] text-[var(--fp-gold)] border border-[var(--fp-gold-lo)]' : 
                                        res.status === 'SURVIVED' ? 'bg-green/10 text-green border border-green/20' :
                                        res.status === 'BYE' ? 'bg-purple/10 text-purple border border-purple/20' :
                                        'bg-white/5 text-muted border border-white/10'
                                    }`}>
                                        {res.status === 'WINNER' && <Crown size={10} />}
                                        {res.status === 'SURVIVED' && <CheckCircle2 size={10} />}
                                        {res.status === 'ELIMINATED' && <span className="opacity-70">💀</span>}
                                        <span className="opacity-70">{res.points} PTS</span>
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Visual Elimination Timeline (UX Handoff 7.1) */}
            {status === 'completed' && table.results && table.results.length > 1 && (
                <div className="mt-4 pt-4 border-t border-white/5 relative z-10 px-1">
                    <div className="flex items-center justify-between relative">
                        {/* Line Background */}
                        <div className="absolute left-[10%] right-[10%] top-1/2 -translate-y-1/2 h-0.5 bg-white/10" />
                        
                        {[...table.results]
                            .filter(r => r.status !== 'BYE')
                            .sort((a, b) => (a.position || 0) - (b.position || 0))
                            .map((res, i) => {
                                const player = participants.find(p => p.playerId === res.playerId);
                                return (
                                    <div key={res.playerId} className="relative flex flex-col items-center group/node">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[8px] font-black z-10 transition-all ${
                                            res.status === 'WINNER' ? 'bg-[var(--fp-gold)] border-[var(--fp-gold-lo)] text-black scale-110 shadow-[0_0_10px_rgba(245,158,11,0.4)]' :
                                            res.status === 'SURVIVED' ? 'bg-green border-green/20 text-black' :
                                            'bg-[var(--fp-void)] border-white/20 text-muted'
                                        }`}>
                                            {res.position || i + 1}
                                        </div>
                                        <span className="absolute -bottom-5 text-[8px] font-bold uppercase tracking-tighter text-muted transition-colors group-hover/node:text-white whitespace-nowrap">
                                            {player?.name.split(' ')[0]}
                                        </span>
                                    </div>
                                );
                            })
                        }
                    </div>
                    <div className="h-5" /> {/* Spacer for labels */}
                </div>
            )}

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
