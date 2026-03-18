import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tournamentService } from '../features/tournaments/tournamentService';
import { useAuthStore } from '../features/auth/authStore';
import type { Tournament } from '../types';
import PageShell from '../components/layout';
import { Calendar, MapPin, Users, Trophy, LogIn, CheckCircle } from 'lucide-react';
import { LoadingScreen } from '../components/ui';

// const dicebear = (seed: string) =>
//     `https://api.dicebear.com/7.x/rings/svg?seed=${encodeURIComponent(seed)}&size=64`;

const JoinTournament: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const [tournament, setTournament]           = useState<Tournament | null>(null);
    const [loading, setLoading]                 = useState(true);
    const [joining, setJoining]                 = useState(false);
    const [joined, setJoined]                   = useState(false);
    const [error, setError]                     = useState('');
    const [commanderName, setCommanderName]     = useState('');
    const [commanderImageUrl, setCommanderImageUrl] = useState('');
    const [decklistUrl, setDecklistUrl]         = useState('');

    useEffect(() => {
        if (!id) return;
        tournamentService.getTournament(id).then(t => {
            setTournament(t || null);
            setLoading(false);
            if (t && user) {
                const p = t.participants.find(p => p.playerId === user.id);
                setJoined(!!(p && p.status === 'active'));
            }
        }).catch(() => setLoading(false));
    }, [id, user]);

    const handleJoin = async () => {
        if (!user) {
            sessionStorage.setItem('joinAfterLogin', `/join/${id}`);
            navigate('/login');
            return;
        }
        if (!tournament || !id || joining) return;
        setJoining(true); setError('');
        try {
            await tournamentService.joinTournament(id, user.id, user.name, user.avatar, {
                commanderName, commanderImageUrl, decklistUrl
            });
            setJoined(true);
        } catch (e: any) {
            setError(e.message || 'Erro ao entrar no torneio.');
        } finally { setJoining(false); }
    };

    if (loading) return <LoadingScreen message="Carregando convite..." />;

    if (!tournament) return (
        <PageShell>
            <div className="container py-20 text-center">
                <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center
                                bg-[rgba(192,57,43,0.1)] border border-[rgba(192,57,43,0.25)]">
                    <Trophy size={28} className="text-[#e74c3c]" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Torneio não encontrado</h2>
                <p className="text-[#7a5c5c] text-sm mb-6">O link pode estar incorreto ou o torneio foi removido.</p>
                <button onClick={() => navigate('/discover')}
                        className="px-6 py-3 rounded-xl font-bold text-sm text-white
                                   bg-gradient-to-r from-[#c0392b] to-[#e67e22]
                                   hover:opacity-90 transition-opacity">
                    Explorar Torneios
                </button>
            </div>
        </PageShell>
    );

    const participantCount = tournament.participants.length;
    const maxParticipants  = tournament.maxParticipants;
    const isFull  = maxParticipants ? participantCount >= maxParticipants : false;
    const isOpen  = tournament.status === 'registration' || 
                    tournament.status === 'draft' || 
                    (tournament.status === 'ongoing' && tournament.allowLateRegistration);

    const metaItems = [
        { icon: <Calendar size={14} />, text: new Date(tournament.date).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
        ...(tournament.location ? [{ icon: <MapPin size={14} />, text: tournament.location }] : []),
        { icon: <Users size={14} />, text: `${participantCount} participante${participantCount !== 1 ? 's' : ''}${maxParticipants ? ` / ${maxParticipants} vagas` : ''}` },
    ];

    return (
        <PageShell>
            <div className="container py-12 flex justify-center pb-28">
                <div className="w-full max-w-lg animate-fade-in">

                    {/* ── CARD PRINCIPAL ── */}
                    <div className="relative overflow-hidden rounded-2xl
                                    bg-[linear-gradient(160deg,#130a0a,#1a0c0c)]
                                    border border-[rgba(192,57,43,0.25)]"
                         style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(192,57,43,0.1)' }}>

                        {/* linha de energia topo */}
                        <div className="absolute top-0 left-[10%] right-[10%] h-px pointer-events-none"
                             style={{ background: 'linear-gradient(90deg,transparent,rgba(231,76,60,0.7),transparent)' }} />

                        {/* glow radial */}
                        <div className="absolute inset-0 pointer-events-none"
                             style={{ background: 'radial-gradient(ellipse 80% 40% at 50% 0%,rgba(192,57,43,0.1),transparent 60%)' }} />

                        <div className="relative p-8">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center
                                                bg-[rgba(192,57,43,0.12)] border border-[rgba(192,57,43,0.28)]
                                                shadow-[0_0_20px_rgba(192,57,43,0.2)]">
                                    <Trophy size={28} className="text-[#e74c3c]" />
                                </div>
                                <p className="text-[10px] uppercase tracking-[2px] text-[#7a5c5c] font-bold mb-2">
                                    Convite para torneio
                                </p>
                                <h1 className="text-2xl font-bold text-white leading-tight">
                                    {tournament.name}
                                </h1>
                            </div>

                            {/* Meta info */}
                            <div className="flex flex-col gap-2 mb-6">
                                {metaItems.map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl
                                                            bg-[rgba(255,255,255,0.03)] border border-[rgba(192,57,43,0.1)]">
                                        <span className="text-[#e74c3c] flex-shrink-0">{item.icon}</span>
                                        <span className="text-sm text-[#a07070]">{item.text}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Descrição */}
                            {tournament.description && (
                                <div className="p-4 rounded-xl mb-6
                                                bg-[rgba(255,255,255,0.02)] border border-[rgba(192,57,43,0.1)]">
                                    <p className="text-sm text-[#a07070] leading-relaxed">{tournament.description}</p>
                                </div>
                            )}

                            {/* Formulário deck/commander */}
                            {!joined && isOpen && !isFull && (
                                <div className="mb-6">
                                    <div className="h-px bg-[rgba(192,57,43,0.15)] mb-5" />
                                    <h3 className="text-[11px] uppercase tracking-[1.5px] font-bold text-[#e74c3c] mb-4">
                                        Informações de Deck
                                    </h3>
                                    <div className="flex flex-col gap-3">
                                        {[
                                            { label: 'Comandante / Deck (Opcional)', placeholder: "Ex: Atraxa, Praetors' Voice", value: commanderName, onChange: setCommanderName, type: 'text' },
                                            { label: 'URL da Imagem (Opcional)', placeholder: 'Link direto da imagem (ex: do Scryfall)', value: commanderImageUrl, onChange: setCommanderImageUrl, type: 'text' },
                                            { label: 'Link da Decklist (Opcional)', placeholder: 'Moxfield, Archidekt, etc.', value: decklistUrl, onChange: setDecklistUrl, type: 'text' },
                                        ].map((f, i) => (
                                            <div key={i} className="flex flex-col gap-1">
                                                <label className="text-[10px] uppercase font-bold text-[#7a5c5c] ml-1">
                                                    {f.label}
                                                </label>
                                                <input
                                                    type={f.type}
                                                    placeholder={f.placeholder}
                                                    value={f.value}
                                                    onChange={e => f.onChange(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl text-sm text-white
                                                               bg-[rgba(255,255,255,0.04)] border border-[rgba(192,57,43,0.18)]
                                                               focus:outline-none focus:border-[rgba(231,76,60,0.45)]
                                                               focus:ring-2 focus:ring-[rgba(192,57,43,0.12)]
                                                               placeholder:text-[#7a5c5c] transition-all" />
                                            </div>
                                        ))}

                                        {/* Preview da carta */}
                                        {commanderImageUrl && (
                                            <div className="mt-2 flex flex-col items-center gap-2 animate-fade-in">
                                                <p className="text-[10px] uppercase font-bold text-[#7a5c5c]">Pré-visualização</p>
                                                <div className="w-36 h-52 rounded-xl overflow-hidden border border-[rgba(192,57,43,0.3)]
                                                                shadow-[0_0_20px_rgba(192,57,43,0.15)] bg-[rgba(255,255,255,0.03)]">
                                                    <img src={commanderImageUrl} className="w-full h-full object-cover" alt="Preview"
                                                         onError={e => (e.currentTarget.style.display = 'none')} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="h-px bg-[rgba(192,57,43,0.15)] mt-5" />
                                </div>
                            )}

                            {/* Erro */}
                            {error && (
                                <div className="mb-4 p-3 rounded-xl text-xs text-[#e74c3c] text-center
                                                bg-[rgba(192,57,43,0.1)] border border-[rgba(192,57,43,0.3)]">
                                    {error}
                                </div>
                            )}

                            {/* CTA / estado */}
                            {joined ? (
                                <div className="flex flex-col items-center gap-4 p-6 rounded-2xl
                                                bg-[rgba(30,132,73,0.1)] border border-[rgba(39,174,96,0.3)]">
                                    <CheckCircle size={36} className="text-[#27ae60]" />
                                    <div className="text-center">
                                        <p className="font-bold text-[#27ae60]">Inscrição confirmada!</p>
                                        <p className="text-sm text-[#7a5c5c] mt-1">Você está inscrito neste torneio.</p>
                                    </div>
                                    <button onClick={() => navigate(`/tournament/${tournament.id}`)}
                                            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white
                                                       bg-gradient-to-r from-[#c0392b] to-[#e67e22]
                                                       hover:opacity-90 transition-opacity">
                                        Ver Torneio
                                    </button>
                                </div>
                            ) : tournament.status === 'ongoing' && !tournament.allowLateRegistration ? (
                                <div className="text-center p-6 rounded-2xl border border-[rgba(231,76,60,0.3)] bg-[rgba(231,76,60,0.05)]">
                                    <div className="flex justify-center mb-3">
                                        <div className="px-3 py-1 bg-[var(--fp-rose-lo)] border border-[var(--fp-rose-hi)] rounded-full text-[10px] font-bold text-[var(--fp-rose-hi)] uppercase tracking-widest animate-pulse">
                                            Torneio em Andamento
                                        </div>
                                    </div>
                                    <p className="font-bold text-white text-sm mb-1">Inscrições Encerradas</p>
                                    <p className="text-xs text-[#7a5c5c] mb-4">Este torneio já começou e não está aceitando retardatários.</p>
                                    <button onClick={() => navigate(`/tournament/${tournament.id}/public`)}
                                            className="w-full py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider
                                                       bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]
                                                       text-[#7a5c5c] hover:text-white hover:border-white/20 transition-all">
                                        Ver Resultados Online
                                    </button>
                                </div>
                            ) : !isOpen ? (
                                <div className="text-center p-5 rounded-xl
                                                bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.07)]">
                                    <p className="font-semibold text-white text-sm">Inscrições encerradas</p>
                                    <p className="text-xs text-[#7a5c5c] mt-1">Este torneio não está aceitando novos participantes.</p>
                                </div>
                            ) : isFull ? (
                                <div className="text-center p-5 rounded-xl
                                                bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.07)]">
                                    <p className="font-semibold text-white text-sm">Torneio lotado</p>
                                    <p className="text-xs text-[#7a5c5c] mt-1">Todas as vagas foram preenchidas.</p>
                                </div>
                            ) : (
                                <button onClick={handleJoin} disabled={joining}
                                        className="w-full py-3.5 rounded-xl font-bold text-sm text-white
                                                   flex items-center justify-center gap-2
                                                   bg-gradient-to-r from-[#c0392b] to-[#e67e22]
                                                   hover:opacity-90 active:scale-[0.98] transition-all
                                                   disabled:opacity-60 disabled:cursor-not-allowed
                                                   shadow-[0_0_24px_rgba(192,57,43,0.35)]">
                                    {joining
                                        ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        : <LogIn size={16} />
                                    }
                                    {user ? (joining ? 'Inscrevendo...' : 'Participar do Torneio') : 'Entrar e Participar'}
                                </button>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </PageShell>
    );
};

export default JoinTournament;
