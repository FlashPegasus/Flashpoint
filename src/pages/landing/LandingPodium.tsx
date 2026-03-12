import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface TopPlayer {
    id: string;
    name: string;
    avatar?: string;
    wins: number;
    winRate: number;
    isAnonymous?: boolean;
}

const PODIUM_ORDER = [1, 0, 2]; // visual order: 2nd, 1st, 3rd

const RANK_STYLES: Record<number, {
    avatarClass: string;
    blockClass: string;
    blockNum: string;
    streakColor: string;
    emoji: string;
}> = {
    0: { avatarClass: 'lp-podium-1', blockClass: 'lp-podium-block-1', blockNum: '1', streakColor: '#f59e0b', emoji: '🥇' },
    1: { avatarClass: 'lp-podium-2', blockClass: 'lp-podium-block-2', blockNum: '2', streakColor: '#94a3b8', emoji: '🥈' },
    2: { avatarClass: 'lp-podium-3', blockClass: 'lp-podium-block-3', blockNum: '3', streakColor: '#cd7c3a', emoji: '🥉' },
};

const INITIALS = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const LandingPodium: React.FC = () => {
    const [players, setPlayers] = useState<TopPlayer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopPlayers = async () => {
            try {
                // Simple query — only orderBy wins. Filter public/non-anonymous client-side
                // to avoid needing a composite Firestore index.
                const q = query(
                    collection(db, 'users'),
                    orderBy('stats.wins', 'desc'),
                    limit(20)
                );
                const snap = await getDocs(q);

                const data: TopPlayer[] = snap.docs
                    .map(doc => {
                        const d = doc.data();
                        const wins: number = d.stats?.wins ?? 0;
                        const played: number = (d.stats?.tournamentsPlayed ?? 1);
                        const winRate = played > 0 ? Math.round((wins / played) * 100) : 0;
                        return {
                            id: doc.id,
                            name: d.name ?? 'Jogador',
                            avatar: d.avatar,
                            wins,
                            winRate,
                            isAnonymous: d.isAnonymous,
                            isPublic: d.isPublic,
                        };
                    })
                    // Keep only public, non-anonymous, players with at least 1 win
                    .filter(p => p.isPublic !== false && !p.isAnonymous && p.wins > 0)
                    .slice(0, 3);

                setPlayers(data);
            } catch (err) {
                // Silently fall back — podium just won't render
                console.warn('LandingPodium: could not fetch top players', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTopPlayers();
    }, []);

    // Don't render section if no real data
    if (!loading && players.length === 0) return null;

    return (
        <section className="lp-podium-section">
            <h2 className="lp-section-title">Hall da Fama</h2>
            <p className="lp-section-sub">Os maiores vencedores desta temporada</p>

            {loading ? (
                /* Skeleton */
                <div className="lp-podium" aria-busy="true" aria-label="Carregando pódio…">
                    {[1, 0, 2].map(pos => (
                        <div key={pos} className="lp-podium-player">
                            <div className={`lp-player-avatar lp-podium-skeleton ${RANK_STYLES[pos].avatarClass}`}>
                                ···
                            </div>
                            <div className="lp-player-name" style={{ opacity: 0.3 }}>——</div>
                            <div className={`lp-podium-block ${RANK_STYLES[pos].blockClass}`}>
                                {RANK_STYLES[pos].blockNum}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="lp-podium">
                    {PODIUM_ORDER.map(visualPos => {
                        const player = players[visualPos];
                        if (!player) return null;
                        const style = RANK_STYLES[visualPos];

                        return (
                            <div key={player.id} className={`lp-podium-player ${style.avatarClass}`}>
                                {/* Avatar */}
                                <div className="lp-player-avatar">
                                    {player.avatar
                                        ? <img src={player.avatar} alt={player.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                        : INITIALS(player.name)
                                    }
                                </div>

                                {/* Name */}
                                <div className="lp-player-name">{player.name}</div>

                                {/* Stats */}
                                <div className="lp-player-stats">
                                    <span className="lp-streak-badge" style={{ color: style.streakColor }}>
                                        🔥 {player.wins} vitórias
                                    </span>
                                </div>
                                <div className="lp-player-stats" style={{ marginTop: 2 }}>
                                    <span style={{ fontSize: '.62rem', color: '#64748b' }}>{player.winRate}% winrate</span>
                                </div>

                                {/* Podium block */}
                                <div className={`lp-podium-block ${style.blockClass}`}>
                                    {style.blockNum}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
};

export default LandingPodium;
