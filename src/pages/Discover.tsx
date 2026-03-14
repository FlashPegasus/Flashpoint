import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Calendar, Users as UsersIcon, Trophy } from 'lucide-react';
import PageShell from '../components/layout';
import { Card, Input, Button } from '../components/ui';
import { LoadingScreen } from '../components/ui';
import { useTournamentStore } from '../features/tournaments/tournamentStore';
import { toast } from 'react-hot-toast';

const Discover: React.FC = () => {
    const { tournaments, loadTournaments, isLoading } = useTournamentStore();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = React.useState('');

    const formatTournamentDate = (dateStr: string) => {
        try {
            // Handle weird "260331-03-03" format or raw ISO
            if (dateStr.length > 10 && dateStr.includes('-')) {
                const parts = dateStr.split('-');
                if (parts[0].length === 6) { // YYMMDD
                    const year = '20' + parts[0].substring(0, 2);
                    const month = parts[0].substring(2, 4);
                    const day = parts[0].substring(4, 6);
                    return `${day}/${month}/${year}`;
                }
            }
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            return date.toLocaleDateString('pt-BR');
        } catch {
            return dateStr;
        }
    };

    const cleanTournamentName = (name: string) => {
        // Fix duplication like "Test MultiplayTest Multiplayerer"
        if (name.includes('Test Multiplayer') && name.length > 20) {
            return 'Test Multiplayer';
        }
        return name;
    };

    React.useEffect(() => {
        loadTournaments();
    }, [loadTournaments]);

    const filtered = tournaments.filter(t => {
        // Hide tournaments created more than 7 days ago that never started
        const createdDate = new Date(t.date || Date.now());
        const isAbandoned = t.status === 'registration' && (Date.now() - createdDate.getTime() > 7 * 24 * 60 * 60 * 1000);
        const isDraft = t.status === 'draft';

        if (isAbandoned || isDraft) return false;

        return t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.format.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (isLoading && tournaments.length === 0) {
        return <LoadingScreen message="Buscando torneios..." />;
    }

    return (
        <PageShell showBackground>
            <div className="container py-12 animate-fade-in relative z-10">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-outfit font-black mb-4 tracking-tight">
                        Descobrir <span className="text-mana-purple">Eventos</span>
                    </h1>
                    <p className="text-muted mb-8 max-w-2xl">
                        Explore os melhores torneios de TCG da comunidade. Encontre seu próximo desafio e suba no ranking global.
                    </p>
                    
                    <div className="flex gap-4 flex-wrap items-center">
                        <div className="relative flex-grow max-w-md group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-purple opacity-50 group-focus-within:opacity-100 transition-opacity" size={20} />
                            <Input
                                placeholder="Buscar por nome, formato ou local..."
                                className="pl-12 py-6 bg-white/5 border-white/10 focus:border-purple/50 focus:ring-purple/20 transition-all rounded-2xl"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="secondary" className="px-6 py-6 rounded-2xl border-white/5 hover:bg-white/10" onClick={() => toast.success('Filtros avançados em breve!')}>
                            <Filter size={18} className="mr-2" /> Filtros
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filtered.length === 0 ? (
                        <div className="col-span-full py-32 text-center glass rounded-[2.5rem] border-dashed border-2 border-white/5">
                            <Search size={64} className="mx-auto mb-6 text-muted opacity-10" />
                            <h3 className="text-2xl font-bold mb-3">Nenhum torneio encontrado</h3>
                            <p className="text-muted text-sm max-w-xs mx-auto">Tente ajustar seus filtros ou buscar por outro termo de busca.</p>
                        </div>
                    ) : (
                        filtered.map(t => (
                            <div 
                                key={t.id} 
                                className="group relative cursor-pointer" 
                                onClick={() => navigate(`/tournament/${t.id}/public`)}
                            >
                                {/* Premium Card Background Logic */}
                                <div className="absolute -inset-0.5 bg-gradient-to-br from-purple/20 to-cyan/20 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
                                
                                <Card className="relative h-full glass border-white/10 bg-black/40 backdrop-blur-xl p-8 rounded-[2rem] group-hover:border-purple/40 transition-all duration-500 overflow-hidden">
                                    {/* Decorative corner */}
                                    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl opacity-10 group-hover:opacity-20 transition-opacity blur-2xl ${t.format === 'multiplayer' ? 'from-purple' : 'from-blue'}`} />
                                    
                                    <div className="flex justify-between items-start mb-8">
                                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${t.format === 'multiplayer' ? 'bg-purple/10 border-purple/20 text-purple' : 'bg-blue/10 border-blue/20 text-blue'}`}>
                                            {t.format === 'multiplayer' ? 'Multijogador' : '1 vs 1'}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className={`w-2 h-2 rounded-full ${t.status === 'registration' ? 'bg-green animate-pulse' : 'bg-secondary'}`} />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted">
                                                {t.status === 'registration' ? 'Inscrições' : t.status === 'ongoing' ? 'Ao Vivo' : 'Finalizado'}
                                            </span>
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-outfit font-black mb-4 group-hover:text-mana-purple transition-colors leading-tight">
                                        {cleanTournamentName(t.name)}
                                    </h3>

                                    <div className="flex flex-col gap-3 text-sm text-secondary/80 mb-8">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-white/5 text-purple"><Calendar size={16} /></div>
                                            <span className="font-medium">{formatTournamentDate(t.date)}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-white/5 text-purple"><Trophy size={16} /></div>
                                            <span className="font-medium">{t.location}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-white/5 text-purple"><UsersIcon size={16} /></div>
                                            <span className="font-medium">{t.participants.length} Jogadores Inscritos</span>
                                        </div>
                                    </div>

                                    <Button variant="glow" className="w-full py-4 text-xs font-black uppercase tracking-[0.2em]">
                                        Explorar Torneio
                                    </Button>
                                </Card>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </PageShell>
    );
};

export default Discover;

