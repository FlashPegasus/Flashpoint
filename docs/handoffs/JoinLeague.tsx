import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, ArrowRight } from 'lucide-react';
import PageShell from '../components/layout';
import { useAuthStore } from '../features/auth/authStore';
import { useLeagueStore } from '../features/leagues/leagueStore';
import toast from 'react-hot-toast';

const JoinLeague: React.FC = () => {
    const { code: codeFromUrl } = useParams<{ code?: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { joinLeagueByCode } = useLeagueStore();

    const [code, setCode]         = useState(codeFromUrl?.toUpperCase() || '');
    const [isJoining, setIsJoining] = useState(false);

    const handleJoin = async () => {
        if (!user) { navigate('/login'); return; }
        if (!code.trim()) { toast.error('Digite o código de convite!'); return; }
        setIsJoining(true);
        try {
            const league = await joinLeagueByCode(code.trim().toUpperCase(), user.id, user.name);
            toast.success(`Bem-vindo à liga "${league.name}"!`);
            navigate(`/league/${league.id}`);
        } catch (err: any) {
            toast.error(err.message || 'Código inválido ou liga não encontrada.');
        } finally { setIsJoining(false); }
    };

    return (
        <PageShell>
            <div className="container py-12 flex items-center justify-center min-h-[60vh] pb-28">
                <div className="w-full max-w-sm animate-fade-in">

                    <div className="relative overflow-hidden rounded-2xl
                                    bg-[linear-gradient(160deg,#130a0a,#1a0c0c)]
                                    border border-[rgba(212,172,13,0.25)]"
                         style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(212,172,13,0.08)' }}>

                        {/* linha de energia dourada */}
                        <div className="absolute top-0 left-[10%] right-[10%] h-px pointer-events-none"
                             style={{ background: 'linear-gradient(90deg,transparent,rgba(212,172,13,0.7),transparent)' }} />

                        <div className="absolute inset-0 pointer-events-none"
                             style={{ background: 'radial-gradient(ellipse 80% 40% at 50% 0%,rgba(212,172,13,0.08),transparent 60%)' }} />

                        <div className="relative p-8 flex flex-col gap-6">
                            {/* Header */}
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center
                                                bg-[rgba(212,172,13,0.1)] border border-[rgba(212,172,13,0.25)]
                                                shadow-[0_0_20px_rgba(212,172,13,0.15)]">
                                    <Trophy size={28} className="text-[#d4ac0d]" />
                                </div>
                                <h2 className="text-xl font-bold text-white mb-2">Entrar em uma Liga</h2>
                                <p className="text-sm text-[#7a5c5c] leading-relaxed">
                                    Digite o código de convite ou use o link recebido do organizador.
                                </p>
                            </div>

                            {/* Input do código */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] uppercase tracking-[1.5px] font-bold text-[#7a5c5c] ml-1">
                                    Código de Convite
                                </label>
                                <input
                                    placeholder="Ex: STORM42"
                                    value={code}
                                    onChange={e => setCode(e.target.value.toUpperCase())}
                                    className="w-full px-4 py-4 rounded-xl text-center
                                               font-mono text-2xl font-bold tracking-[6px] text-[#d4ac0d]
                                               bg-[rgba(255,255,255,0.04)] border border-[rgba(212,172,13,0.2)]
                                               focus:outline-none focus:border-[rgba(212,172,13,0.5)]
                                               focus:ring-2 focus:ring-[rgba(212,172,13,0.1)]
                                               placeholder:text-[#7a5c5c] placeholder:tracking-normal
                                               placeholder:text-base placeholder:font-normal
                                               transition-all"
                                />
                            </div>

                            {/* CTA */}
                            <button
                                onClick={handleJoin}
                                disabled={isJoining}
                                className="w-full py-3.5 rounded-xl font-bold text-sm text-white
                                           flex items-center justify-center gap-2
                                           bg-gradient-to-r from-[#c0392b] via-[#e67e22] to-[#d4ac0d]
                                           hover:opacity-90 active:scale-[0.98] transition-all
                                           disabled:opacity-60 disabled:cursor-not-allowed
                                           shadow-[0_0_24px_rgba(192,57,43,0.3)]">
                                {isJoining
                                    ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    : <ArrowRight size={16} />
                                }
                                {isJoining ? 'Entrando...' : 'Entrar na Liga'}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </PageShell>
    );
};

export default JoinLeague;
