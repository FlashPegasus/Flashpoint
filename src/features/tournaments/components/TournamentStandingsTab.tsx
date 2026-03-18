import React from 'react';
import { Crown, Medal, BarChart3 } from 'lucide-react';
import type { Tournament } from '../../../types';

const dicebearUrl = (seed: string, size = 36) =>
    `https://api.dicebear.com/7.x/rings/svg?seed=${encodeURIComponent(seed)}&size=${size}`;

interface TournamentStandingsTabProps {
    activeTournament: Tournament;
}

export const TournamentStandingsTab: React.FC<TournamentStandingsTabProps> = ({
    activeTournament
}) => {
    return (
        <div className="flex flex-col gap-8 animate-fade-in">
            {/* Pódio (só torneios concluídos) */}
            {activeTournament.status === 'completed' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                    {[2, 1, 3].map(pos => {
                        const sorted = [...activeTournament.participants].sort((a, b) => (a.rank || 99) - (b.rank || 99));
                        const p = sorted[pos - 1];
                        if (!p) return null;
                        const cfg: Record<number, { grad: string; border: string; label: string; scale: string }> = {
                            1: { grad: 'linear-gradient(135deg,rgba(245,158,11,0.18),rgba(251,191,36,0.06))', border: 'rgba(245,158,11,0.4)', label: 'Campeão', scale: 'md:scale-105 order-1 md:order-2' },
                            2: { grad: 'linear-gradient(135deg,rgba(148,163,184,0.12),rgba(100,116,139,0.04))', border: 'rgba(148,163,184,0.3)', label: '2º Lugar', scale: 'order-2 md:order-1' },
                            3: { grad: 'linear-gradient(135deg,rgba(180,120,80,0.12),rgba(120,80,50,0.04))', border: 'rgba(180,120,80,0.3)', label: '3º Lugar', scale: 'order-3' },
                        };
                        const c = cfg[pos];
                        return (
                            <div key={pos}
                                 className={`fp-card p-6 flex flex-col items-center gap-4 ${c.scale}`}
                                 style={{ background: c.grad, borderColor: c.border }}>
                                <div className="w-16 h-16 rounded-full overflow-hidden border-2"
                                     style={{ borderColor: c.border }}>
                                    <img src={dicebearUrl(p.playerId || p.name, 64)} className="w-full h-full" alt="" />
                                </div>
                                <div className="text-center">
                                    <div className="font-semibold text-[var(--fp-text)]">{p.name}</div>
                                    <div className="text-[var(--fp-muted)] text-xs mt-0.5">{p.totalPoints} pts · Vit {p.wins || 0}</div>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white/5 flex items-center gap-1.5"
                                      style={{ color: c.border.replace('0.', '0.8').replace('rgba', 'rgba') }}>
                                    {pos === 1 ? <Crown size={12} /> : <Medal size={12} />} {c.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Tabela de Classificação */}
            <div className="fp-card overflow-hidden">
                <div className="px-5 py-4 border-b border-[var(--fp-border)] flex items-center justify-between">
                    <h3 className="font-semibold text-[var(--fp-text)]">
                        {activeTournament.status === 'completed' ? 'Classificação Final' : 'Classificação Atual'}
                    </h3>
                    
                    <div className="group relative">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--fp-muted)] uppercase tracking-wider cursor-help">
                            <BarChart3 size={12} /> Como funciona o ranking?
                        </div>
                        <div className="absolute right-0 top-full mt-2 w-56 p-3 rounded-xl bg-[var(--fp-void)] border border-[var(--fp-border-hi)] shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                            <p className="text-[10px] font-bold text-white mb-2 uppercase tracking-tight">Critérios de Desempate</p>
                            <ol className="text-[10px] text-[var(--fp-muted)] space-y-1">
                                <li className="flex items-start gap-2"><span>1.</span> <strong>Pontos Totais</strong></li>
                                <li className="flex items-start gap-2"><span>2.</span> <span><strong>OMW%</strong>: Performance dos oponentes</span></li>
                                <li className="flex items-start gap-2"><span>3.</span> <span><strong>BH (Buchholz)</strong>: Soma pontos dos oponentes</span></li>
                                <li className="flex items-start gap-2"><span>4.</span> <span><strong>Vitórias</strong>: Qtd. de primeiros lugares</span></li>
                            </ol>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[var(--fp-muted)] text-[11px] uppercase tracking-wider font-bold border-b border-[var(--fp-border)]">
                                <th className="py-3 px-5">#</th>
                                <th className="py-3 px-3">Jogador</th>
                                <th className="py-3 px-3">Pts</th>
                                <th className="py-3 px-3">OMW%</th>
                                <th className="py-3 px-3">BH</th>
                                <th className="py-3 px-3">Vit</th>
                                <th className="py-3 px-5 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeTournament.participants.map((p, idx) => (
                                <tr key={p.playerId}
                                    className="border-b border-[var(--fp-border-lo)] hover:bg-white/[0.03] transition-colors">
                                    <td className="py-3 px-5 text-sm font-bold">
                                        <div className="flex items-center gap-1.5">
                                            {idx === 0 && <Crown size={13} className="text-[var(--fp-gold)]" />}
                                            {idx === 1 && <Medal size={13} className="text-[#94a3b8]" />}
                                            {idx === 2 && <Medal size={13} className="text-[#cd7c3a]" />}
                                            <span className={idx < 3 ? 'text-[var(--fp-text-hi)]' : 'text-[var(--fp-muted)]'}>
                                                #{idx + 1}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-3">
                                        <div className="flex items-center gap-2">
                                            <img src={dicebearUrl(p.playerId || p.name, 28)}
                                                  className="w-7 h-7 rounded-full border border-white/10" alt="" />
                                            <span className="text-sm font-medium text-[var(--fp-text)]">{p.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-3 font-bold text-[var(--fp-text-hi)] text-sm">{p.totalPoints}</td>
                                    <td className="py-3 px-3 text-[var(--fp-muted)] text-[11px] font-mono">
                                        {((p.omw || 0) * 10).toFixed(1)}%
                                    </td>
                                    <td className="py-3 px-3 text-[var(--fp-muted)] text-sm">{p.buchholz || 0}</td>
                                    <td className="py-3 px-3 text-[var(--fp-muted)] text-[11px] font-bold">{p.wins || 0}</td>
                                    <td className="py-3 px-5 text-right">
                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full
                                            ${p.status === 'active'
                                                ? 'bg-[var(--fp-emerald-lo)] text-[var(--fp-emerald-hi)]'
                                                : 'bg-[var(--fp-rose-lo)] text-[var(--fp-rose-hi)]'
                                            }`}>
                                            {p.status === 'active' ? 'Ativo' : 'Retirado'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
