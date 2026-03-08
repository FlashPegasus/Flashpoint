import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, ArrowRight } from 'lucide-react';
import PageShell from '../components/layout';
import { Button, Card, Input } from '../components/ui';
import { useAuthStore } from '../features/auth/authStore';
import { useLeagueStore } from '../features/leagues/leagueStore';
import toast from 'react-hot-toast';

const JoinLeague: React.FC = () => {
    const { code: codeFromUrl } = useParams<{ code?: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { joinLeagueByCode } = useLeagueStore();

    const [code, setCode] = useState(codeFromUrl?.toUpperCase() || '');
    const [isJoining, setIsJoining] = useState(false);

    const handleJoin = async () => {
        if (!user) { navigate('/login'); return; }
        if (!code.trim()) { toast.error('Digite o código de convite!'); return; }
        setIsJoining(true);
        try {
            const league = await joinLeagueByCode(code.trim().toUpperCase(), user.id, user.name);
            toast.success(`Bem-vindo à liga "${league.name}"! 🏆`);
            navigate(`/league/${league.id}`);
        } catch (err: any) {
            toast.error(err.message || 'Código inválido ou liga não encontrada.');
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <PageShell>
            <div className="container section flex items-center justify-center min-h-[60vh]">
                <div className="w-full max-w-md animate-fade-in">
                    <Card title="Entrar em uma Liga">
                        <div className="flex flex-col gap-6 py-2">
                            <div className="text-center">
                                <Trophy size={48} className="mx-auto mb-4" style={{ color: 'var(--color-gold)' }} />
                                <p className="text-secondary text-sm">Digite o código de convite ou use o link recebido do organizador.</p>
                            </div>
                            <Input
                                label="Código de Convite"
                                placeholder="Ex: STORM42"
                                value={code}
                                onChange={e => setCode(e.target.value.toUpperCase())}
                                className="font-mono text-center text-xl tracking-widest"
                            />
                            <Button onClick={handleJoin} variant="glow" disabled={isJoining} className="w-full">
                                <ArrowRight size={18} className="mr-2" />
                                {isJoining ? 'Entrando...' : 'Entrar na Liga'}
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </PageShell>
    );
};

export default JoinLeague;
