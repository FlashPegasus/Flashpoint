import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tournamentService } from '../features/tournaments/tournamentService';
import { useAuthStore } from '../features/auth/authStore';
import type { Tournament } from '../types';
import PageShell from '../components/layout';
import { Calendar, MapPin, Users, Trophy, LogIn, CheckCircle } from 'lucide-react';
import { LoadingScreen } from '../components/ui';

const JoinTournament: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [joined, setJoined] = useState(false);
    const [error, setError] = useState('');

    // Commander/Deck State
    const [commanderName, setCommanderName] = useState('');
    const [commanderImageUrl, setCommanderImageUrl] = useState('');
    const [decklistUrl, setDecklistUrl] = useState('');

    useEffect(() => {
        if (!id) return;
        tournamentService.getTournament(id)
            .then(t => {
                setTournament(t || null);
                setLoading(false);
                if (t && user) {
                    const already = t.participants.some(p => p.playerId === user.id);
                    setJoined(already);
                }
            })
            .catch(() => setLoading(false));
    }, [id, user]);

    const handleJoin = async () => {
        if (!user) {
            // Save intended destination and redirect to login
            sessionStorage.setItem('joinAfterLogin', `/join/${id}`);
            navigate('/login');
            return;
        }
        if (!tournament || !id) return;
        setJoining(true);
        setError('');
        try {
            await tournamentService.joinTournament(id, user.id, user.name, user.avatar, {
                commanderName,
                commanderImageUrl,
                decklistUrl
            });
            setJoined(true);
        } catch (e: any) {
            setError(e.message || 'Erro ao entrar no torneio.');
        } finally {
            setJoining(false);
        }
    };

    if (loading) {
        return <LoadingScreen message="Carregando convite..." />;
    }

    if (!tournament) {
        return (
            <PageShell>
                <div className="container section text-center">
                    <h2 className="text-2xl font-bold mb-2">Torneio nÃ£o encontrado</h2>
                    <p className="text-secondary mb-6">O link pode estar incorreto ou o torneio foi removido.</p>
                    <button onClick={() => navigate('/discover')} className="px-6 py-3 rounded-xl font-bold" style={{ backgroundColor: 'var(--color-purple)', color: 'white' }}>
                        Explorar Torneios
                    </button>
                </div>
            </PageShell>
        );
    }

    const participantCount = tournament.participants.length;
    const maxParticipants = tournament.maxParticipants;
    const isFull = maxParticipants ? participantCount >= maxParticipants : false;
    const isOpen = tournament.status === 'registration' || tournament.status === 'draft';

    return (
        <PageShell>
            <div className="container section flex justify-center">
                <div className="glass-card p-10 w-full max-w-lg animate-fade-in">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-accent/20">
                            <Trophy size={32} className="text-accent" />
                        </div>
                        <p className="text-xs uppercase tracking-widest text-muted font-bold mb-1">Convite para torneio</p>
                        <h1 className="text-3xl font-bold">{tournament.name}</h1>
                    </div>

                    {/* Info */}
                    <div className="space-y-3 mb-8">
                        <div className="flex items-center gap-3 p-3 glass rounded-xl">
                            <Calendar size={16} className="text-accent" />
                            <span className="text-sm">{new Date(tournament.date).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        {tournament.location && (
                            <div className="flex items-center gap-3 p-3 glass rounded-xl">
                                <MapPin size={16} className="text-accent" />
                                <span className="text-sm">{tournament.location}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-3 p-3 glass rounded-xl">
                            <Users size={16} className="text-accent" />
                            <span className="text-sm">
                                {participantCount} participante{participantCount !== 1 ? 's' : ''}
                                {maxParticipants ? ` / ${maxParticipants} vagas` : ''}
                            </span>
                        </div>
                    </div>

                    {tournament.description && (
                        <p className="text-secondary text-sm mb-8 leading-relaxed p-4 glass rounded-xl border border-white/5">
                            {tournament.description}
                        </p>
                    )}

                    {/* Commander/Deck Info Form */}
                    {!joined && isOpen && !isFull && (
                        <div className="flex flex-col gap-4 mb-8">
                            <div className="h-px bg-white/10 my-2"></div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-purple" style={{ color: 'var(--color-purple)' }}>InformaÃ§Ãµes de Deck</h3>

                            <div className="flex flex-col gap-3">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] uppercase font-bold text-muted ml-1">Comandante / Deck (Opcional)</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Atraxa, Praetors' Voice"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-purple/50 outline-none"
                                        value={commanderName}
                                        onChange={e => setCommanderName(e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] uppercase font-bold text-muted ml-1">URL da Imagem (Opcional)</label>
                                    <input
                                        type="text"
                                        placeholder="Link direto da imagem (ex: do Scryfall)"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-purple/50 outline-none"
                                        value={commanderImageUrl}
                                        onChange={e => setCommanderImageUrl(e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] uppercase font-bold text-muted ml-1">Link da Decklist (Opcional)</label>
                                    <input
                                        type="text"
                                        placeholder="Moxfield, Archidekt, etc."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-purple/50 outline-none"
                                        value={decklistUrl}
                                        onChange={e => setDecklistUrl(e.target.value)}
                                    />
                                </div>

                                {commanderImageUrl && (
                                    <div className="mt-2 flex flex-col items-center gap-2 animate-fade-in">
                                        <p className="text-[10px] uppercase font-bold text-muted">PrÃ©-visualizaÃ§Ã£o:</p>
                                        <div className="w-40 h-56 rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-white/5">
                                            <img
                                                src={commanderImageUrl}
                                                className="w-full h-full object-cover"
                                                alt="Preview"
                                                onError={(e) => (e.currentTarget.style.display = 'none')}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="h-px bg-white/10 my-2"></div>
                        </div>
                    )}

                    {error && (
                        <p className="text-red-400 text-xs p-2 bg-red-500/10 rounded-lg mb-4 border border-red-500/20 text-center">{error}</p>
                    )}

                    {joined ? (
                        <div className="flex flex-col items-center gap-4 p-6 bg-green-500/10 rounded-2xl border border-green-500/30">
                            <CheckCircle size={40} className="text-green-400" />
                            <div className="text-center">
                                <p className="font-bold text-green-300">InscriÃ§Ã£o confirmada!</p>
                                <p className="text-sm text-muted mt-1">VocÃª estÃ¡ inscrito neste torneio.</p>
                            </div>
                            <button
                                onClick={() => navigate(`/tournament/${tournament.id}`)}
                                className="px-6 py-2.5 rounded-xl text-sm font-bold"
                                style={{ backgroundColor: 'var(--color-purple)', color: 'white' }}
                            >
                                Ver Torneio
                            </button>
                        </div>
                    ) : !isOpen ? (
                        <div className="text-center p-6 glass rounded-xl text-secondary">
                            <p className="font-bold">InscriÃ§Ãµes encerradas</p>
                            <p className="text-sm mt-1">Este torneio nÃ£o estÃ¡ aceitando novos participantes.</p>
                        </div>
                    ) : isFull ? (
                        <div className="text-center p-6 glass rounded-xl text-secondary">
                            <p className="font-bold">Torneio lotado</p>
                            <p className="text-sm mt-1">Todas as vagas foram preenchidas.</p>
                        </div>
                    ) : (
                        <button
                            onClick={handleJoin}
                            disabled={joining}
                            className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                            style={{ backgroundColor: 'var(--color-purple)', color: 'white', opacity: joining ? 0.7 : 1 }}
                        >
                            {joining ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <LogIn size={18} />}
                            {user ? (joining ? 'Inscrevendo...' : 'Participar do Torneio') : 'Entrar e Participar'}
                        </button>
                    )}
                </div>
            </div>
        </PageShell >
    );
};

export default JoinTournament;

