import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../features/auth/authStore';
import { tournamentService } from '../features/tournaments/tournamentService';
import PageShell from '../components/layout';
import { Trophy, Star, Target, Calendar, User as UserIcon, LogOut, RefreshCw, Eye, EyeOff, ShieldCheck, Mail, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
    const { user, logout, linkEmail, linkGoogle, isLoading, error } = useAuthStore();
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>(null);

    // Guest upgrade state
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [upgradeEmail, setUpgradeEmail] = useState('');
    const [upgradeName, setUpgradeName] = useState('');
    const [upgradePassword, setUpgradePassword] = useState('');
    const [showUpgradePw, setShowUpgradePw] = useState(false);
    const [upgradeSuccess, setUpgradeSuccess] = useState(false);

    const isGuest = user?.email === 'guest@flashpoint.app';

    useEffect(() => {
        if (user) {
            tournamentService.getUserStats(user.id).then(setStats);
        }
    }, [user]);

    if (!user) return null;

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleLinkEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        await linkEmail(upgradeEmail, upgradePassword, upgradeName);
        if (!error) setUpgradeSuccess(true);
    };

    const handleLinkGoogle = async () => {
        await linkGoogle();
        if (!error) setUpgradeSuccess(true);
    };

    return (
        <PageShell title="Meu Perfil">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
                {/* User Info Card */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="glass card p-6 text-center animate-fade-in">
                        <div className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-accent/30 shadow-lg">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <UserIcon size={40} className="text-accent" />
                            )}
                        </div>
                        <h2 className="text-2xl font-bold mb-1">{isGuest ? 'ðŸ‘¤ Convidado' : user.name}</h2>
                        <p className="text-secondary mb-4 text-sm">{isGuest ? 'Conta temporÃ¡ria' : user.email}</p>

                        <div className="px-4 py-2 bg-accent/10 rounded-full text-accent text-sm font-medium inline-block mb-6 border border-accent/20">
                            {user.role === 'organizer' ? 'Organizador' : user.role === 'player' ? 'Jogador' : 'Admin'}
                        </div>


                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-center gap-2 w-full p-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                            <LogOut size={18} />
                            Sair da Conta
                        </button>
                    </div>

                    {/* Guest Upgrade Banner */}
                    {isGuest && !upgradeSuccess && (
                        <div className="glass border border-yellow-500/30 bg-yellow-500/5 p-5 rounded-2xl animate-fade-in">
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldCheck size={18} className="text-yellow-400" />
                                <h4 className="font-bold text-yellow-300 text-sm">Proteja sua conta</h4>
                            </div>
                            <p className="text-xs text-muted mb-4 leading-relaxed">
                                VocÃª estÃ¡ como Convidado. Seus dados podem ser perdidos. Vincule um e-mail ou Google para salvar sua conta permanentemente.
                            </p>
                            <button
                                onClick={() => setShowUpgradeModal(true)}
                                className="w-full py-2.5 rounded-xl text-xs font-bold bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/30 transition-all"
                            >
                                Criar Conta Permanente
                            </button>
                        </div>
                    )}

                    {upgradeSuccess && (
                        <div className="glass border border-green-500/30 bg-green-500/5 p-5 rounded-2xl">
                            <p className="text-green-400 font-bold text-sm text-center">âœ“ Conta criada com sucesso!</p>
                        </div>
                    )}
                </div>

                {/* Statistics & History */}
                <div className="lg:col-span-2 space-y-8">
                    {stats ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-slide-up">
                            <StatCard icon={<Trophy size={20} className="text-yellow-400" />} label="VitÃ³rias" value={stats.wins} />
                            <StatCard icon={<Star size={20} className="text-accent" />} label="Top 3" value={stats.top3} />
                            <StatCard icon={<Target size={20} className="text-blue-400" />} label="Pontos" value={stats.totalPoints} />
                            <StatCard icon={<ArrowRight size={20} className="text-purple-400" />} label="Tx. VitÃ³ria" value={stats.winRate || '0%'} />
                        </div>
                    ) : (
                        <div className="h-24 flex items-center justify-center">
                            <RefreshCw className="animate-spin text-accent" />
                        </div>
                    )}

                    <div className="glass p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Calendar size={20} className="text-accent" />
                            ParticipaÃ§Ã£o Recente
                        </h3>
                        {stats?.recentTournaments.length > 0 ? (
                            <div className="space-y-4">
                                {stats.recentTournaments.map((t: any) => (
                                    <div
                                        key={t.id}
                                        onClick={() => navigate(`/tournament/${t.id}${t.status === 'completed' ? '/public' : ''}`)}
                                        className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-accent/40 hover:bg-white/10 transition-all cursor-pointer group"
                                    >
                                        <div>
                                            <h4 className="font-semibold group-hover:text-accent transition-colors">{t.name}</h4>
                                            <p className="text-xs text-secondary">{new Date(t.date).toLocaleDateString('pt-BR')}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold">{t.rank ? `#${t.rank}Âº lugar` : 'Sem rank'}</div>
                                            <div className="text-xs text-secondary">{t.points} pts</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-secondary">
                                <p>{stats ? 'VocÃª ainda nÃ£o participou de nenhum torneio.' : 'Carregando...'}</p>
                                {stats && (
                                    <button onClick={() => navigate('/discover')} className="text-accent hover:underline mt-2">
                                        Explorar torneios ativos
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Guest Upgrade Modal */}
            {showUpgradeModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowUpgradeModal(false)}>
                    <div className="glass-card p-8 w-full max-w-md animate-fade-in" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-2">Criar conta permanente</h3>
                        <p className="text-secondary text-sm mb-6">Seus torneios e dados serÃ£o preservados.</p>

                        {error && <p className="text-red-400 text-xs p-2 bg-red-500/10 rounded-lg mb-4 border border-red-500/20">{error}</p>}

                        <form onSubmit={handleLinkEmail} className="space-y-4 mb-4">
                            <input
                                type="text"
                                placeholder="Seu nome"
                                value={upgradeName}
                                onChange={e => setUpgradeName(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-accent"
                            />
                            <input
                                type="email"
                                placeholder="seu@email.com"
                                value={upgradeEmail}
                                onChange={e => setUpgradeEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-accent"
                            />
                            <div className="relative">
                                <input
                                    type={showUpgradePw ? 'text' : 'password'}
                                    placeholder="Senha (mÃ­n. 6 caracteres)"
                                    value={upgradePassword}
                                    onChange={e => setUpgradePassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-accent"
                                />
                                <button type="button" onClick={() => setShowUpgradePw(p => !p)} className="absolute right-3 top-3 text-muted">
                                    {showUpgradePw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                                style={{ backgroundColor: 'var(--color-purple)', color: 'white', opacity: isLoading ? 0.7 : 1 }}
                            >
                                <Mail size={16} />
                                {isLoading ? 'Vinculando...' : 'Vincular com E-mail'}
                            </button>
                        </form>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-px bg-white/10 flex-1"></div>
                            <span className="text-xs text-muted">ou</span>
                            <div className="h-px bg-white/10 flex-1"></div>
                        </div>

                        <button
                            onClick={handleLinkGoogle}
                            disabled={isLoading}
                            className="w-full py-3 rounded-xl font-bold text-sm glass border border-white/10 flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                        >
                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" width="16" alt="Google" />
                            Vincular com Google
                        </button>

                        <button onClick={() => setShowUpgradeModal(false)} className="w-full mt-4 text-xs text-muted hover:text-secondary transition-colors">
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </PageShell>
    );
};

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: number | string }> = ({ icon, label, value }) => (
    <div className="glass p-4 text-center">
        <div className="bg-white/5 w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2 border border-white/10">
            {icon}
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-[10px] uppercase tracking-wider text-secondary font-medium">{label}</div>
    </div>
);

export default Profile;

