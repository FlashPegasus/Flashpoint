import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Calendar, Users as UsersIcon, Trophy } from 'lucide-react';
import PageShell from '../components/layout';
import { Card, Input, Button } from '../components/ui';
import { LoadingScreen } from '../components/ui';
import { useTournamentStore } from '../features/tournaments/tournamentStore';

const Discover: React.FC = () => {
    const { tournaments, loadTournaments, isLoading } = useTournamentStore();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = React.useState('');

    React.useEffect(() => {
        loadTournaments();
    }, [loadTournaments]);

    const filtered = tournaments.filter(t => {
        // Hide tournaments created more than 7 days ago that never started
        const createdDate = new Date(t.date || Date.now());
        const isAbandoned = t.status === 'registration' && (Date.now() - createdDate.getTime() > 7 * 24 * 60 * 60 * 1000);

        if (isAbandoned) return false;

        return t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.format.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (isLoading && tournaments.length === 0) {
        return <LoadingScreen message="Buscando torneios..." />;
    }

    return (
        <PageShell>
            <div className="container py-8 animate-fade-in">
                <div className="mb-10">
                    <h1 className="text-4xl font-outfit mb-4">Descobrir Eventos</h1>
                    <div className="flex gap-4 flex-wrap">
                        <div className="relative flex-grow max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary opacity-60" size={18} />
                            <Input
                                placeholder="Buscar por nome, formato ou local..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="secondary">
                            <Filter size={18} className="mr-2" /> Filtros
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.length === 0 ? (
                        <div className="col-span-full py-20 text-center glass rounded-3xl border-dashed border-2 border-white/5">
                            <Search size={48} className="mx-auto mb-4 text-muted opacity-20" />
                            <h3 className="text-xl font-bold mb-2">Nenhum torneio encontrado</h3>
                            <p className="text-secondary text-sm">Tente ajustar seus filtros ou buscar por outro termo.</p>
                        </div>
                    ) : (
                        filtered.map(t => (
                            <Card key={t.id} className="group hover:border-purple/30 transition-all cursor-pointer" onClick={() => navigate(`/tournament/${t.id}/public`)}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${t.format === 'multiplayer' ? 'bg-purple/10 text-purple' : 'bg-blue/10 text-blue'}`} style={{ color: t.format === 'multiplayer' ? 'var(--color-purple)' : 'var(--color-blue)' }}>
                                        {t.format === 'multiplayer' ? 'Multijogador' : '1 vs 1'}
                                    </div>
                                    <span className="text-xs text-muted">{t.status === 'registration' ? 'Inscrições Abertas' : t.status === 'ongoing' ? 'Em Andamento' : 'Concluído'}</span>
                                </div>
                                <h3 className="text-xl font-bold mb-2 group-hover:text-purple transition-colors">{t.name}</h3>
                                <div className="flex flex-col gap-2 text-sm text-secondary mb-6">
                                    <div className="flex items-center gap-2"><Calendar size={14} /> {t.date}</div>
                                    <div className="flex items-center gap-2"><Trophy size={14} /> {t.location}</div>
                                    <div className="flex items-center gap-2"><UsersIcon size={14} /> {t.participants.length} Jogadores</div>
                                </div>
                                <Button variant="primary" className="w-full">Ver Torneio</Button>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </PageShell>
    );
};

export default Discover;

