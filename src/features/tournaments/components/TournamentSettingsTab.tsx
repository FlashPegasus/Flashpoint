import React from 'react';
import { Trophy, Plus } from 'lucide-react';
import { Button } from '../../../components/ui';
import toast from 'react-hot-toast';
import type { Tournament, League, User } from '../../../types';

interface TournamentSettingsTabProps {
    id: string | undefined;
    activeTournament: Tournament;
    isOrganizer: boolean;
    myLeagues: League[];
    user: User | null;
    formatLabel: (f: string) => string;
    statusLabel: (s: string) => string;
    linkTournament: (lid: string, tid: string, uid: string) => Promise<void>;
    loadTournament: (id: string) => Promise<void>;
    handleCancelTournament: () => void;
}

export const TournamentSettingsTab: React.FC<TournamentSettingsTabProps> = ({
    id,
    activeTournament,
    isOrganizer,
    myLeagues,
    user,
    formatLabel,
    statusLabel,
    linkTournament,
    loadTournament,
    handleCancelTournament
}) => {
    return (
        <div className="max-w-xl animate-fade-in">
            <div className="fp-card p-6">
                <h3 className="font-semibold text-[var(--fp-text)] mb-1">Configurações do Torneio</h3>
                <p className="text-[var(--fp-muted)] text-sm mb-6">Gerenciamento administrativo do evento.</p>

                {/* Info cards */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="p-4 bg-white/[0.03] border border-[var(--fp-border)] rounded-xl">
                        <span className="text-[11px] text-[var(--fp-muted)] uppercase tracking-wider block mb-1">Formato</span>
                        <p className="font-bold text-[var(--fp-text)]">{formatLabel(activeTournament.format)}</p>
                    </div>
                    <div className="p-4 bg-white/[0.03] border border-[var(--fp-border)] rounded-xl">
                        <span className="text-[11px] text-[var(--fp-muted)] uppercase tracking-wider block mb-1">Status</span>
                        <p className="font-bold" style={{ color: 'var(--fp-purple-hi)' }}>{statusLabel(activeTournament.status)}</p>
                    </div>
                </div>

                {/* League linking */}
                {isOrganizer && (
                    <div className="mb-6 p-4 bg-white/[0.03] border border-[var(--fp-border)] rounded-2xl">
                        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                            <Trophy size={14} className="text-[var(--fp-gold)]" /> Vincular a Liga
                        </h4>
                        {activeTournament.leagueId ? (
                            <p className="text-sm text-[var(--fp-emerald-hi)] font-medium">
                                ✅ Torneio vinculado a uma liga.
                            </p>
                        ) : myLeagues.length === 0 ? (
                            <p className="text-sm text-[var(--fp-muted)]">Você não organiza nenhuma liga.</p>
                        ) : (
                            <>
                                <p className="text-sm text-[var(--fp-muted)] mb-3">
                                    Resultados contarão para o ranking da liga selecionada.
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {myLeagues.map(l => (
                                        <Button key={l.id} variant="secondary" size="sm"
                                                className="justify-between"
                                                onClick={async () => {
                                                    if (id && user?.id) {
                                                        try {
                                                            await linkTournament(l.id, id, user.id);
                                                            toast.success('Torneio vinculado!');
                                                            loadTournament(id);
                                                        } catch (err: any) {
                                                            toast.error(err.message || 'Erro ao vincular.');
                                                        }
                                                    }
                                                }}>
                                            {l.name} <Plus size={14} />
                                        </Button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Danger zone */}
                <button onClick={handleCancelTournament}
                        className="w-full py-2.5 rounded-xl text-sm font-bold
                                   bg-[var(--fp-rose-lo)] border border-[rgba(244,63,94,0.3)]
                                   text-[var(--fp-rose-hi)] hover:bg-[rgba(244,63,94,0.18)] transition-colors">
                    Cancelar e Excluir Torneio
                </button>
            </div>
        </div>
    );
};
