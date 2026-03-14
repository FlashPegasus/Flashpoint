import React, { useEffect, useState } from 'react';
import { Trophy, Search, Star, ArrowUp, ArrowDown, Activity } from 'lucide-react';
import PageShell from '../components/layout';
import { Input } from '../components/ui';
import { LoadingScreen } from '../components/ui';
import { tournamentService } from '../features/tournaments/tournamentService';

interface RankedPlayer {
    id: string;
    name: string;
    avatar?: string;
    points: number;
    wins: number;
    winRate: string;
    rank: number;
    trend?: 'up' | 'down' | 'neutral';
}

const RankingGlobal: React.FC = () => {
    const [players, setPlayers] = useState<RankedPlayer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchRanking = async () => {
            setLoading(true);
            try {
                // Fetch tournaments and calculate all-time rankings
                const tournaments = await tournamentService.getTournaments();
                const playerStats: Record<string, { name: string, points: number, wins: number, played: number, avatar?: string }> = {};

                tournaments.forEach(t => {
                    t.participants.forEach(p => {
                        if (!playerStats[p.playerId]) {
                            playerStats[p.playerId] = { name: p.name, points: 0, wins: 0, played: 0, avatar: p.avatar };
                        }
                        const stats = playerStats[p.playerId];
                        stats.points += p.totalPoints || 0;
                        stats.played++;
                        if (p.rank === 1) stats.wins++;
                    });
                });

                const sorted = Object.entries(playerStats)
                    .map(([id, s]) => ({
                        id,
                        name: s.name,
                        avatar: s.avatar,
                        points: s.points,
                        wins: s.wins,
                        winRate: s.played > 0 ? `${Math.round((s.wins / s.played) * 100)}%` : '0%',
                        rank: 0, // Placeholder
                        trend: (Math.random() > 0.5 ? 'up' : 'down') as any // Mocking trend
                    }))
                    .sort((a, b) => b.points - a.points);

                sorted.forEach((p, i) => { p.rank = i + 1; });
                setPlayers(sorted);
            } catch (err) {
                console.error('Error fetching global ranking:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchRanking();
    }, []);

    const filteredPlayers = players.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const top3 = filteredPlayers.slice(0, 3);
    const rest = filteredPlayers.slice(3);

    if (loading) return <LoadingScreen message="Convocando Lendas..." />;

    return (
        <PageShell showBackground>
            <div className="container py-12 animate-fade-in relative z-10">
                <div className="flex flex-col items-center text-center mb-16">
                    <h1 className="text-5xl md:text-6xl font-display font-black mb-4 tracking-tighter">
                        Ranking <span className="text-primary">Global</span>
                    </h1>
                    <p className="text-muted max-w-2xl text-lg">
                        O panteão dos maiores duelistas do FlashPoint. Suba no ranking e torne-se uma lenda imortal.
                    </p>
                </div>

                {/* Podium Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 items-end">
                    {/* Rank 2 */}
                    {top3[1] && (
                        <div className="order-2 md:order-1 flex flex-col items-center group">
                            <div className="relative mb-6">
                                <div className="absolute -inset-4 bg-white/5 blur-2xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                                <div className="w-24 h-24 rounded-full border-4 border-[#94a3b8] p-1 relative z-10 overflow-hidden shadow-lg">
                                    <img 
                                        src={top3[1].avatar || `https://ui-avatars.com/api/?name=${top3[1].name}&background=random`} 
                                        alt={top3[1].name}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#94a3b8] rounded-full flex items-center justify-center text-black font-bold text-lg z-20 shadow-md">2</div>
                            </div>
                            <h3 className="text-xl font-bold mb-1">{top3[1].name}</h3>
                            <div className="flex items-center gap-2 text-primary font-bold bg-primary/10 px-3 py-1 rounded-full text-xs">
                                <Star size={12} fill="currentColor" /> {top3[1].points} pts
                            </div>
                            <div className="mt-8 w-full h-32 bg-white/5 border-x border-t border-white/10 rounded-t-3xl flex items-center justify-center text-[#94a3b8]/30 font-display text-4xl font-black">II</div>
                        </div>
                    )}

                    {/* Rank 1 */}
                    {top3[0] && (
                        <div className="order-1 md:order-2 flex flex-col items-center group mb-8 md:mb-0">
                            <div className="relative mb-8">
                                <div className="absolute -inset-8 bg-primary/20 blur-3xl rounded-full animate-pulse" />
                                <div className="w-32 h-32 rounded-full border-4 border-primary p-1 relative z-10 overflow-hidden shadow-[0_0_30px_rgba(192,57,43,0.4)]">
                                    <img 
                                        src={top3[0].avatar || `https://ui-avatars.com/api/?name=${top3[0].name}&background=random`} 
                                        alt={top3[0].name}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                </div>
                                <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-glow-primary animate-float">
                                    <Trophy size={24} fill="white" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-black text-2xl z-20 shadow-glow">1</div>
                            </div>
                            <h2 className="text-3xl font-display font-black mb-2 text-white">{top3[0].name}</h2>
                            <div className="flex items-center gap-3 text-white font-black bg-primary px-6 py-2 rounded-full text-sm shadow-glow-primary">
                                <Activity size={16} /> {top3[0].points} PONTOS
                            </div>
                            <div className="mt-10 w-full h-48 bg-primary/10 border-x border-t border-primary/30 rounded-t-[3rem] flex items-center justify-center text-primary/40 font-display text-6xl font-black shadow-inner">I</div>
                        </div>
                    )}

                    {/* Rank 3 */}
                    {top3[2] && (
                        <div className="order-3 md:order-3 flex flex-col items-center group">
                            <div className="relative mb-6">
                                <div className="absolute -inset-4 bg-white/5 blur-2xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                                <div className="w-20 h-20 rounded-full border-4 border-[#cd7c3a] p-1 relative z-10 overflow-hidden shadow-lg">
                                    <img 
                                        src={top3[2].avatar || `https://ui-avatars.com/api/?name=${top3[2].name}&background=random`} 
                                        alt={top3[2].name}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#cd7c3a] rounded-full flex items-center justify-center text-black font-bold text-base z-20 shadow-md">3</div>
                            </div>
                            <h3 className="text-lg font-bold mb-1">{top3[2].name}</h3>
                            <div className="flex items-center gap-2 text-primary font-bold bg-primary/10 px-3 py-1 rounded-full text-xs">
                                <Star size={12} fill="currentColor" /> {top3[2].points} pts
                            </div>
                            <div className="mt-8 w-full h-24 bg-white/5 border-x border-t border-white/10 rounded-t-2xl flex items-center justify-center text-[#cd7c3a]/30 font-display text-3xl font-black">III</div>
                        </div>
                    )}
                </div>

                {/* List Section */}
                <div className="max-w-4xl mx-auto">
                    <div className="flex gap-4 mb-8">
                        <div className="relative flex-grow group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-50 group-focus-within:opacity-100 transition-opacity" size={20} />
                            <Input 
                                placeholder="Buscar jogador no ranking..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-12 py-6 bg-white/5 border-white/10 focus:border-primary/50 text-white rounded-2xl"
                            />
                        </div>
                    </div>

                    <div className="fp-card overflow-hidden">
                        <div className="grid grid-cols-[60px_1fr_100px_100px_60px] gap-4 p-4 text-[10px] font-bold uppercase tracking-widest text-muted border-b border-white/5 bg-white/[0.02]">
                            <div className="text-center">Pos</div>
                            <div>Duelista</div>
                            <div className="text-center">Pontos</div>
                            <div className="text-center">Winrate</div>
                            <div className="text-center">Tend.</div>
                        </div>

                        <div className="flex flex-col">
                            {rest.length === 0 && filteredPlayers.length === 0 ? (
                                <div className="py-20 text-center opacity-40">
                                    <Search size={48} className="mx-auto mb-4" />
                                    <p>Nenhum duelista encontrado</p>
                                </div>
                            ) : (
                                rest.map((player, _idx) => (
                                    <div 
                                        key={player.id} 
                                        className="grid grid-cols-[60px_1fr_100px_100px_60px] gap-4 p-4 items-center hover:bg-white/[0.03] transition-colors border-b border-white/[0.02]"
                                    >
                                        <div className="text-center font-display font-black text-xl opacity-30">#{player.rank}</div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden">
                                                <img 
                                                    src={player.avatar || `https://ui-avatars.com/api/?name=${player.name}&background=random`} 
                                                    alt="" 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white">{player.name}</h4>
                                                <p className="text-[10px] text-muted">{player.wins} vitórias em torneios</p>
                                            </div>
                                        </div>
                                        <div className="text-center font-bold text-primary">{player.points}</div>
                                        <div className="text-center text-sm font-medium">{player.winRate}</div>
                                        <div className="flex justify-center">
                                            {player.trend === 'up' ? (
                                                <ArrowUp size={16} className="text-emerald-500" />
                                            ) : player.trend === 'down' ? (
                                                <ArrowDown size={16} className="text-red-500" />
                                            ) : (
                                                <Activity size={16} className="text-muted" />
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PageShell>
    );
};

export default RankingGlobal;
