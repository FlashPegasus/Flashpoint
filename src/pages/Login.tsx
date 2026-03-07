import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, UserCircle, Eye, EyeOff, UserPlus, LogIn } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import PageShell from '../components/layout/PageShell';
import { Input } from '../components/ui';

const Login: React.FC = () => {
    const [mode, setMode] = React.useState<'signin' | 'register'>('signin');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [name, setName] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);
    const [validationError, setValidationError] = React.useState('');
    // Google login username customization
    const [googleUser, setGoogleUser] = React.useState<{ uid: string; suggestedName: string; avatar: string } | null>(null);
    const [googleUsername, setGoogleUsername] = React.useState('');

    const { login, register, loginWithGoogle, loginAnonymously, updateProfile, isLoading, error } = useAuthStore();
    const navigate = useNavigate();

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError('');

        if (mode === 'register') {
            if (password !== confirmPassword) {
                setValidationError('As senhas não coincidem.');
                return;
            }
            if (password.length < 6) {
                setValidationError('A senha deve ter no mínimo 6 caracteres.');
                return;
            }
            if (!name.trim()) {
                setValidationError('Digite um nome de usuário.');
                return;
            }
            await register(email, password, name);
        } else {
            await login(email, password);
        }
        navigate('/my-area');
    };

    const handleGoogleLogin = async () => {
        const user = await loginWithGoogle();
        if (!error && user) {
            if ((user as any).isNewUser) {
                // Ask user to confirm/customize their display name
                setGoogleUser({ uid: user.id, suggestedName: user.name, avatar: user.avatar || '' });
                setGoogleUsername(user.name);
                return; // Wait for username confirmation before redirect
            } else {
                navigate('/my-area');
                return;
            }
        }
    };

    const handleGoogleUsernameConfirm = async (e: React.FormEvent) => {
        e.preventDefault();
        const finalName = googleUsername.trim() || googleUser?.suggestedName || 'Usuário';
        await updateProfile({ name: finalName });
        navigate('/my-area');
    };

    const handleGuestLogin = async () => {
        await loginAnonymously();
        navigate('/my-area');
    };

    const displayError = validationError || error;

    return (
        <PageShell>
            {/* Google username confirmation modal */}
            {googleUser && (
                <div className="container section flex justify-center">
                    <div className="glass-card p-10 w-full max-w-md animate-fade-in shadow-2xl text-center">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-accent/30 mx-auto mb-4">
                            {googleUser.avatar
                                ? <img src={googleUser.avatar} className="w-full h-full object-cover" alt="" />
                                : <div className="w-full h-full bg-accent/30 flex items-center justify-center text-2xl font-bold">
                                    {googleUser.suggestedName.charAt(0).toUpperCase()}
                                </div>
                            }
                        </div>
                        <h2 className="text-2xl font-bold mb-1">Bem-vindo!</h2>
                        <p className="text-secondary text-sm mb-6">
                            Você entrou com Google. Como quer ser chamado nos torneios?
                        </p>
                        <form onSubmit={handleGoogleUsernameConfirm} className="flex flex-col gap-4">
                            <input
                                type="text"
                                value={googleUsername}
                                onChange={e => setGoogleUsername(e.target.value)}
                                placeholder="Seu nome de usuário no torneio"
                                maxLength={30}
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-accent"
                            />
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                                style={{ backgroundColor: 'var(--color-purple)', color: 'white', opacity: isLoading ? 0.7 : 1 }}
                            >
                                {isLoading ? 'Aguarde...' : 'Confirmar e Entrar →'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {!googleUser && (
                <div className="container section flex justify-center">
                    <div className="glass-card p-10 w-full max-w-md animate-fade-in shadow-2xl">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-accent/20">
                                <UserCircle size={32} className="text-secondary" />
                            </div>
                            <h2 className="text-3xl mb-1 font-bold">FlashPoint</h2>
                            <p className="text-secondary text-sm">Gerencie seus torneios de TCG</p>
                        </div>

                        {/* Mode Toggle */}
                        <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl mb-6">
                            <button
                                onClick={() => { setMode('signin'); setValidationError(''); }}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${mode === 'signin' ? 'bg-accent text-white shadow-lg' : 'text-secondary hover:text-primary'}`}
                            >
                                <LogIn size={14} />
                                Entrar
                            </button>
                            <button
                                onClick={() => { setMode('register'); setValidationError(''); }}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${mode === 'register' ? 'bg-accent text-white shadow-lg' : 'text-secondary hover:text-primary'}`}
                            >
                                <UserPlus size={14} />
                                Cadastrar
                            </button>
                        </div>

                        <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
                            {mode === 'register' && (
                                <div className="relative">
                                    <Input
                                        label="Nome de usuário"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Seu nome"
                                        required
                                    />
                                    <UserCircle className="absolute right-4 bottom-3 text-muted" size={18} />
                                </div>
                            )}

                            <div className="relative">
                                <Input
                                    label="E-mail"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    required
                                />
                                <Mail className="absolute right-4 bottom-3 text-muted" size={18} />
                            </div>

                            <div className="relative">
                                <Input
                                    label="Senha"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(p => !p)}
                                    className="absolute right-4 bottom-3 text-muted hover:text-primary transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {mode === 'register' && (
                                <div className="relative">
                                    <Input
                                        label="Confirmar senha"
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                    />
                                    <Lock className="absolute right-4 bottom-3 text-muted" size={18} />
                                </div>
                            )}

                            {displayError && (
                                <p className="text-red-400 text-xs text-center p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                                    {displayError}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-glow transition-all active:scale-[0.98] mt-1"
                                style={{ backgroundColor: 'var(--color-purple)', color: 'white', opacity: isLoading ? 0.7 : 1 }}
                            >
                                {isLoading ? 'Aguarde...' : mode === 'signin' ? 'Entrar' : 'Criar Conta'}
                                {!isLoading && <ArrowRight size={18} />}
                            </button>
                        </form>

                        <div className="mt-6">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="h-[1px] bg-white/10 flex-1"></div>
                                <span className="text-[10px] text-muted uppercase tracking-[0.2em] font-bold">Ou continue com</span>
                                <div className="h-[1px] bg-white/10 flex-1"></div>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <button
                                    onClick={handleGoogleLogin}
                                    disabled={isLoading}
                                    className="glass py-3.5 flex items-center justify-center gap-3 hover:bg-white/10 transition-all rounded-xl border border-white/5 active:scale-[0.98]"
                                >
                                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" alt="Google" />
                                    <span className="text-sm font-semibold">Continuar com Google</span>
                                </button>

                                <button
                                    onClick={handleGuestLogin}
                                    disabled={isLoading}
                                    className="glass py-3.5 flex items-center justify-center gap-3 hover:bg-white/10 transition-all rounded-xl border border-white/5 active:scale-[0.98]"
                                >
                                    <UserCircle size={20} className="text-secondary" />
                                    <span className="text-sm font-semibold">Entrar como Convidado</span>
                                </button>
                            </div>
                        </div>

                        <p className="text-[10px] text-muted text-center mt-6 px-4 leading-relaxed">
                            Ao continuar, você concorda com nossos termos. Contas de Convidado são temporárias e os dados podem ser perdidos se o cache do navegador for limpo.
                        </p>
                    </div>
                </div>
            )}
            <style>{`
    input:focus { border: 1px solid var(--color-purple) !important; box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2) !important; }
`}</style>
        </PageShell>
    );
};

export default Login;
