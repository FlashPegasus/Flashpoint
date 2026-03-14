import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Calendar, Users as UsersIcon, Trophy } from 'lucide-react';
import PageShell from '../components/layout';
import { Input, Button } from '../components/ui';
import { LoadingScreen } from '../components/ui';
import { useTournamentStore } from '../features/tournaments/tournamentStore';
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
    registration: { label: 'Inscrições', cls: 'bg-[rgba(30,132,73,0.15)] border-[rgba(39,174,96,0.3)] text-[#27ae60]', dot: 'bg-[#27ae60] animate-pulse' },
    ongoing:      { label: 'Ao Vivo',    cls: 'bg-[rgba(192,57,43,0.15)] border-[rgba(231,76,60,0.35)] text-[#e74c3c]', dot: 'bg-[#e74c3c] animate-pulse' },
    completed:    { label: 'Finalizado', cls: 'bg-white/5 border-white/10 text-[#7a5c5c]', dot: 'bg-[#7a5c5c]' },
};

const Discover: React.FC = () => {
    const { tournaments, loadTournaments, isLoading } = useTournamentStore();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = React.useState('');

    React.useEffect(() => { loadTournaments(); }, [loadTournaments]);

    const filtered = tournaments.filter(t => {
        const createdDate = new Date(t.date || Date.now());
        const isAbandoned = t.status === 'registration' && (Date.now() - createdDate.getTime() > 7 * 24 * 60 * 60 * 1000);
        if (isAbandoned || t.status === 'draft') return false;
        return t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               t.format.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (isLoading && tournaments.length === 0) return <LoadingScreen message="Buscando torneios..." />;

    return (
        <PageShell showBackground>
            <div className="container py-10 animate-fade-in relative z-10 pb-28">

                {/* ── HEADER ── */}
                <div className="mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4
                                    bg-[rgba(192,57,43,0.12)] border border-[rgba(192,57,43,0.25)]
                                    text-[10px] font-bold uppercase tracking-[2px] text-[#e74c3c]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#e74c3c] animate-pulse" />
                        Torneios Ativos
                    </div>
                    <h1 className="font-[var(--fp-font-display,_'Cinzel_Decorative',serif)]
                                   text-3xl md:text-4xl text-white mb-3 leading-tight">
                        Descobrir Eventos
                    </h1>
                    <p className="text-[#7a5c5c] text-sm max-w-lg leading-relaxed mb-8">
                        Explore os melhores torneios de TCG da comunidade. Encontre seu próximo desafio e suba no ranking global.
                    </p>

                    {/* Search bar */}
                    <div className="flex gap-3 flex-wrap items-center">
                        <div className="relative flex-grow max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#e74c3c] opacity-50" size={17} />
                            <input
                                placeholder="Buscar por nome ou formato..."
                                className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm text-white
                                           bg-[rgba(255,255,255,0.04)] border border-[rgba(192,57,43,0.2)]
                                           focus:outline-none focus:border-[rgba(231,76,60,0.5)]
                                           focus:ring-2 focus:ring-[rgba(192,57,43,0.12)]
                                           placeholder:text-[#7a5c5c] transition-all"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => toast.success('Filtros avançados em breve!')}
                            className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold
                                       bg-[rgba(255,255,255,0.04)] border border-[rgba(192,57,43,0.15)]
                                       text-[#a07070] hover:border-[rgba(192,57,43,0.35)]
                                       hover:text-[#e74c3c] transition-all">
                            <Filter size={15} /> Filtros
                        </button>
                    </div>
                </div>

                {/* ── GRID ── */}
                {filtered.length === 0 ? (
                    <div className="py-24 text-center rounded-2xl
                                    border-2 border-dashed border-[rgba(192,57,43,0.15)]
                                    bg-[rgba(192,57,43,0.02)]">
                        <Search size={48} className="mx-auto mb-5 text-[#7a5c5c] opacity-30" />
                        <h3 className="text-lg font-semibold text-white mb-2">Nenhum torneio encontrado</h3>
                        <p className="text-[#7a5c5c] text-sm">Tente ajustar sua busca.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map((t, i) => {
                            const sc = statusCfg[t.status] ?? statusCfg.completed;
                            const isMP = t.format === 'multiplayer';
                            return (
                                <div
                                    key={t.id}
                                    onClick={() => navigate(`/tournament/${t.id}/public`)}
                                    className="group relative cursor-pointer rounded-2xl overflow-hidden
                                               border border-[rgba(192,57,43,0.18)]
                                               bg-[linear-gradient(160deg,#130a0a,#1a0c0c)]
                                               transition-all duration-400
                                               hover:-translate-y-1.5 hover:border-[rgba(231,76,60,0.45)]
                                               hover:shadow-[0_0_32px_rgba(192,57,43,0.22),0_20px_40px_rgba(0,0,0,0.5)]"
                                    style={{ animationDelay: `${i * 0.06}s` }}>

                                    {/* linha de energia no topo */}
                                    <div className="absolute top-0 left-[10%] right-[10%] h-px
                                                    bg-gradient-to-r from-transparent via-[rgba(231,76,60,0.7)] to-transparent
                                                    opacity-0 group-hover:opacity-100 transition-opacity" />

                                    {/* glow radial */}
                                    <div className="absolute inset-0 rounded-2xl pointer-events-none
                                                    bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(192,57,43,0.12),transparent_60%)]
                                                    opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="relative p-6">
                                        {/* top row */}
                                        <div className="flex items-center justify-between mb-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                                                              text-[10px] font-bold uppercase tracking-wider border
                                                              ${isMP
                                                                ? 'bg-[rgba(192,57,43,0.12)] border-[rgba(192,57,43,0.28)] text-[#e74c3c]'
                                                                : 'bg-[rgba(230,126,34,0.12)] border-[rgba(230,126,34,0.28)] text-[#e67e22]'
                                                              }`}>
                                                {isMP ? 'Commander' : '1 vs 1'}
                                            </span>
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                                                              text-[10px] font-bold uppercase tracking-wider border ${sc.cls}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                                                {sc.label}
                                            </span>
                                        </div>

                                        {/* name */}
                                        <h3 className="font-semibold text-lg text-white mb-4 leading-tight
                                                       group-hover:text-[#e74c3c] transition-colors">
                                            {cleanName(t.name)}
                                        </h3>

                                        {/* meta */}
                                        <div className="flex flex-col gap-2 mb-5">
                                            {[
                                                { icon: <Calendar size={13} />, text: formatDate(t.date) },
                                                { icon: <Trophy size={13} />,   text: t.location },
                                                { icon: <UsersIcon size={13} />, text: `${t.participants.length} jogadores` },
                                            ].map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-2.5 text-sm text-[#a07070]">
                                                    <span className="w-6 h-6 rounded-lg flex items-center justify-center
                                                                     bg-[rgba(192,57,43,0.1)] border border-[rgba(192,57,43,0.15)]
                                                                     text-[#e74c3c] flex-shrink-0">
                                                        {item.icon}
                                                    </span>
                                                    {item.text}
                                                </div>
                                            ))}
                                        </div>

                                        {/* CTA */}
                                        <button className="w-full py-2.5 rounded-xl text-sm font-bold
                                                           bg-[rgba(192,57,43,0.12)] border border-[rgba(192,57,43,0.28)]
                                                           text-[#e74c3c] tracking-wider uppercase
                                                           group-hover:bg-[rgba(192,57,43,0.2)]
                                                           group-hover:border-[rgba(231,76,60,0.5)]
                                                           transition-all">
                                            Explorar Torneio
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Espaço Publicitário */}
                <div className="mt-12 mx-auto max-w-2xl">
                    <div className="rounded-2xl border border-dashed border-[rgba(255,255,255,0.06)]
                                    bg-[rgba(255,255,255,0.02)] py-6 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-[3px] text-[rgba(122,92,92,0.4)]">
                            Espaço Publicitário
                        </p>
                    </div>
                </div>
            </div>
        </PageShell>
    );
};

export default Discover;
