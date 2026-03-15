import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Calendar, Users as UsersIcon, Trophy, LayoutGrid } from 'lucide-react';
import PageShell from '../components/layout';
import { LoadingScreen } from '../components/ui';
import { useTournamentStore } from '../features/tournaments/tournamentStore';
import { useLeagueStore } from '../features/leagues/leagueStore';
import { useAuthStore } from '../features/auth/authStore';
import { toast } from 'react-hot-toast';

/* ── helpers ── */
const formatDate = (dateStr: string) => {
    try {
        if (dateStr.length > 10 && dateStr.includes('-')) {
            const parts = dateStr.split('-');
            if (parts[0].length === 6) {
                const y = '20' + parts[0].substring(0, 2);
                const m = parts[0].substring(2, 4);
                const d = parts[0].substring(4, 6);
                return `${d}/${m}/${y}`;
            }
        }
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString('pt-BR');
    } catch { return dateStr; }
};

const cleanName = (name: string) =>
    name.includes('Test Multiplayer') && name.length > 20 ? 'Test Multiplayer' : name;

const statusCfg: Record<string, { label: string; cls: string; dot: string }> = {
    registration: { label: 'Inscrições', cls: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', dot: 'bg-emerald-400 animate-pulse' },
    ongoing:      { label: 'Ao Vivo',    cls: 'bg-primary/10 border-primary/30 text-primary', dot: 'bg-primary animate-pulse' },
    completed:    { label: 'Finalizado', cls: 'bg-white/5 border-white/10 text-muted', dot: 'bg-muted' },
};

const Discover: React.FC = () => {
    const { tournaments, loadTournaments, isLoading: loadingTournaments } = useTournamentStore();
    const { publicLeagues, myLeagues, loadPublicLeagues, loadMyLeagues, isLoading: loadingLeagues } = useLeagueStore();
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = React.useState('');
    const [viewMode, setViewMode] = React.useState<'tournaments' | 'leagues'>('tournaments');
    const [leagueFilter, setLeagueFilter] = React.useState<'all' | 'my' | 'featured'>('all');

    React.useEffect(() => { 
        loadTournaments(); 
        loadPublicLeagues();
        if (user) loadMyLeagues(user.id);
    }, [loadTournaments, loadPublicLeagues, loadMyLeagues, user]);

    const filteredTournaments = tournaments.filter(t => {
        const createdDate = new Date(t.date || Date.now());
        const isAbandoned = t.status === 'registration' && (Date.now() - createdDate.getTime() > 7 * 24 * 60 * 60 * 1000);
        if (isAbandoned || t.status === 'draft') return false;
        return t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               t.format.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const filteredLeagues = publicLeagues.filter(l => {
        const matchesSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase());
        const isJoined = myLeagues.some(ml => ml.id === l.id);
        
        if (!matchesSearch) return false;
        if (leagueFilter === 'my') return isJoined;
        if (leagueFilter === 'featured') {
             // In this version, featured are those with more than 5 members
             return (l.memberIds?.length || 0) > 5;
        }
        return true;
    });

    if ((loadingTournaments && tournaments.length === 0) || (loadingLeagues && publicLeagues.length === 0)) {
        return <LoadingScreen message="Buscando a arena..." />;
    }

    return (
        <PageShell showBackground>
            <div className="container py-10 animate-fade-in relative z-10 pb-28">

                {/* ── HEADER ── */}
                <div className="mb-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4
                                            bg-primary/10 border border-primary/25
                                            text-[10px] font-black uppercase tracking-[2px] text-primary">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-glow-primary" />
                                Arena Global
                            </div>
                            <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-3 uppercase tracking-tighter">
                                Descobrir <span className="text-primary">FlashPoint</span>
                            </h1>
                            <p className="text-muted text-sm max-w-lg leading-relaxed">
                                Explore os melhores torneios e ligas de TCG. Encontre seu próximo desafio e suba no panteão das lendas.
                            </p>
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-2xl border border-white/10 shadow-inner">
                            <button 
                                onClick={() => setViewMode('tournaments')}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${viewMode === 'tournaments' ? 'bg-primary text-white shadow-glow-primary' : 'text-muted hover:text-white'}`}
                            >
                                <Trophy size={14} /> Torneios
                            </button>
                            <button 
                                onClick={() => setViewMode('leagues')}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${viewMode === 'leagues' ? 'bg-primary text-white shadow-glow-primary' : 'text-muted hover:text-white'}`}
                            >
                                <LayoutGrid size={14} /> Ligas
                            </button>
                        </div>
                    </div>

                    {/* Search bar */}
                    <div className="flex gap-4 flex-wrap items-center">
                        <div className="relative flex-grow max-w-xl group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-50 group-focus-within:opacity-100 transition-opacity" size={20} />
                            <input
                                placeholder={`Buscar por nome de ${viewMode === 'tournaments' ? 'torneio ou formato' : 'liga'}...`}
                                className="w-full pl-12 pr-4 py-4 rounded-2xl text-sm text-white
                                           bg-white/5 border border-white/10
                                           focus:outline-none focus:border-primary/50
                                           focus:ring-2 focus:ring-primary/10
                                           placeholder:text-muted/30 transition-all font-medium"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => toast.success('Filtros avançados em breve!')}
                            className="flex items-center gap-2 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest
                                       bg-white/5 border border-white/10
                                       text-muted hover:border-primary/50
                                       hover:text-primary transition-all"
                        >
                            <Filter size={16} /> Filtros
                        </button>

                        {viewMode === 'leagues' && (
                            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                                {[
                                    { id: 'all', label: 'Todas' },
                                    { id: 'my', label: 'Participando' },
                                    { id: 'featured', label: 'Destaques' }
                                ].map(f => (
                                    <button
                                        key={f.id}
                                        onClick={() => setLeagueFilter(f.id as any)}
                                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${leagueFilter === f.id ? 'bg-amber-500 text-white shadow-lg' : 'text-muted hover:text-white'}`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── GRID ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {viewMode === 'tournaments' ? (
                        filteredTournaments.length === 0 ? (
                            <div className="col-span-full py-24 text-center fp-card border-dashed">
                                <Search size={48} className="mx-auto mb-5 text-muted opacity-20" />
                                <h3 className="text-xl font-bold text-white mb-2 uppercase">Nenhum torneio encontrado</h3>
                                <p className="text-muted text-sm">Tente ajustar seus filtros ou buscar por outro termo.</p>
                            </div>
                        ) : (
                            filteredTournaments.map((t, i) => {
                                const sc = statusCfg[t.status] ?? statusCfg.completed;
                                const isMP = t.format === 'multiplayer';
                                return (
                                    <div
                                        key={t.id}
                                        onClick={() => navigate(`/tournament/${t.id}/public`)}
                                        className="fp-card group cursor-pointer relative overflow-hidden flex flex-col h-full"
                                        style={{ animationDelay: `${i * 0.05}s` }}>
                                        
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                        
                                        <div className="p-6 flex-grow flex flex-col">
                                            <div className="flex items-center justify-between mb-6">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${isMP ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-white/5 border-white/10 text-muted'}`}>
                                                    {isMP ? 'Multijogador' : '1 VS 1 Duel'}
                                                </span>
                                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${sc.cls}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                                                    {sc.label}
                                                </div>
                                            </div>

                                            <h3 className="text-xl font-display font-black text-white mb-6 uppercase tracking-tight group-hover:text-primary transition-colors line-clamp-2">
                                                {cleanName(t.name)}
                                            </h3>

                                            <div className="space-y-3 mb-8">
                                                <div className="flex items-center gap-3 text-sm text-muted">
                                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-primary/50 group-hover:text-primary transition-colors">
                                                        <Calendar size={14} />
                                                    </div>
                                                    <span className="font-medium">{formatDate(t.date)}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-muted">
                                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-primary/50 group-hover:text-primary transition-colors">
                                                        <Trophy size={14} />
                                                    </div>
                                                    <span className="font-medium truncate">{t.location}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-muted">
                                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-primary/50 group-hover:text-primary transition-colors">
                                                        <UsersIcon size={14} />
                                                    </div>
                                                    <span className="font-medium">{t.participants.length} Guerreiros</span>
                                                </div>
                                            </div>

                                            <button className="w-full mt-auto py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] bg-white/5 border border-white/10 text-white group-hover:bg-primary group-hover:border-primary group-hover:shadow-glow-primary transition-all duration-300">
                                                Explorar Arena
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )
                    ) : (
                        filteredLeagues.length === 0 ? (
                            <div className="col-span-full py-24 text-center fp-card border-dashed">
                                <LayoutGrid size={48} className="mx-auto mb-5 text-muted opacity-20" />
                                <h3 className="text-xl font-bold text-white mb-2 uppercase">Nenhuma liga encontrada</h3>
                                <p className="text-muted text-sm">Tente ajustar seus filtros ou buscar por outro termo.</p>
                            </div>
                        ) : (
                            filteredLeagues.map((l, i) => {
                                const isJoined = myLeagues.some(ml => ml.id === l.id);
                                return (
                                    <div
                                        key={l.id}
                                        onClick={() => navigate(`/league/${l.id}`)}
                                        className={`fp-card group cursor-pointer relative overflow-hidden flex flex-col h-full transition-all duration-300 ${isJoined ? 'border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/20' : ''}`}
                                        style={{ animationDelay: `${i * 0.05}s` }}>
                                        
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                        
                                        {isJoined && (
                                            <div className="absolute top-3 right-3 z-10">
                                                <div className="bg-amber-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-xl">
                                                    Membro
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="p-6 flex-grow flex flex-col">
                                            <div className="flex items-center justify-between mb-6">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border bg-amber-500/10 border-amber-500/30 text-amber-400">
                                                    Liga Regional
                                                </span>
                                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                                                    Ativa
                                                </div>
                                            </div>

                                            <h3 className="text-xl font-display font-black text-white mb-6 uppercase tracking-tight group-hover:text-amber-400 transition-colors line-clamp-2">
                                                {l.name}
                                            </h3>

                                            <div className="space-y-3 mb-8">
                                                <div className="flex items-center gap-3 text-sm text-muted">
                                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-amber-500/50 group-hover:text-amber-400 transition-colors">
                                                        <UsersIcon size={14} />
                                                    </div>
                                                    <span className="font-medium">{l.memberIds?.length || 0} Membros ativos</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-muted">
                                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-amber-500/50 group-hover:text-amber-400 transition-colors">
                                                        <Trophy size={14} />
                                                    </div>
                                                    <span className="font-medium truncate">{l.tournamentIds?.length || 0} Torneios vinculados</span>
                                                </div>
                                            </div>

                                            <button className="w-full mt-auto py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] bg-white/5 border border-white/10 text-white group-hover:bg-amber-500 group-hover:border-amber-500 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all duration-300">
                                                Ver Detalhes
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )
                    )}
                </div>

                {/* Propaganda re-styled */}
                <div className="mt-20 p-10 border border-white/5 bg-[radial-gradient(circle_at_50%_0%,rgba(192,57,43,0.05),transparent_70%)] rounded-[2.5rem] text-center relative overflow-hidden group">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted/20 group-hover:text-primary/40 transition-colors">Portal FlashPoint v2.0</p>
                </div>
            </div>
        </PageShell>
    );
};

export default Discover;
