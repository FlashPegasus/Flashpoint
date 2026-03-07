import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trophy, Users, LayoutDashboard, LogOut, Search, Menu, X, Sun, Moon } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const Navbar: React.FC = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [theme, setTheme] = React.useState<'light' | 'dark'>(
        (localStorage.getItem('theme') as 'light' | 'dark') || 'dark'
    );

    React.useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isGuest = user?.email === 'guest@flashpoint.app';

    return (
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-6xl">
            <div className="glass px-6 py-3.5 flex items-center justify-between shadow-2xl rounded-2xl border-white/10 bg-black/60 backdrop-blur-xl">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="p-2 glass rounded-xl group-hover:shadow-glow transition-all" style={{ backgroundColor: 'var(--color-purple)' }}>
                        <Trophy size={20} color="white" />
                    </div>
                    <span className="text-xl font-bold font-outfit tracking-tight">
                        FlashPoint
                    </span>
                    <span className="text-sm" title="Português - Brasil">🇧🇷</span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    <div className="flex items-center gap-6">
                        <Link to="/discover" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary hover:text-primary transition-colors">
                            <Search size={14} />
                            <span>Descobrir</span>
                        </Link>
                        <Link to="/leagues" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary hover:text-primary transition-colors">
                            <Users size={14} />
                            <span>Ligas</span>
                        </Link>
                        {user && (
                            <Link to="/my-area" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary hover:text-primary transition-colors">
                                <LayoutDashboard size={14} />
                                <span>Minha Área</span>
                            </Link>
                        )}
                    </div>

                    <div className="h-4 w-px bg-white/10"></div>

                    <div className="flex items-center gap-4">
                        {/* Internationalization Guide Link */}
                        <Link to="/en" title="English / Translate" className="flex items-center hover:scale-110 transition-transform">
                            <img src="https://flagcdn.com/w40/gb.png" alt="English" className="h-4 rounded-sm" />
                        </Link>

                        <button onClick={toggleTheme} className="p-2 text-secondary hover:text-primary transition-all">
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link to="/profile" className="flex items-center gap-2 glass pl-1 pr-3 py-1 rounded-full hover:shadow-glow transition-all border-white/10">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] overflow-hidden" style={{ backgroundColor: 'var(--color-purple)' }}>
                                        {user.avatar
                                            ? <img src={user.avatar} className="w-full h-full object-cover" alt="" />
                                            : user.name.charAt(0).toUpperCase()
                                        }
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider">
                                        {isGuest ? '👤 Convidado' : user.name}
                                    </span>
                                </Link>
                                <button onClick={handleLogout} className="text-muted hover:text-red transition-colors">
                                    <LogOut size={16} />
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className="px-6 py-2.5 bg-purple text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:shadow-glow transition-all" style={{ backgroundColor: 'var(--color-purple)' }}>
                                Entrar
                            </Link>
                        )}
                    </div>
                </div>

                {/* Mobile Toggle */}
                <button className="md:hidden p-2 text-secondary" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden mt-2 glass-card p-6 animate-fade-in">
                    <div className="flex flex-col gap-6">
                        <Link to="/discover" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold uppercase tracking-wider">Descobrir</Link>
                        <Link to="/leagues" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold uppercase tracking-wider">Ligas</Link>
                        {user && <Link to="/my-area" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold uppercase tracking-wider">Minha Área</Link>}
                        <div className="h-px bg-white/10"></div>
                        <Link to="/en" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                            <img src="https://flagcdn.com/w40/gb.png" alt="English" className="h-4 rounded-sm" />
                            <span>English / Traduzir</span>
                        </Link>
                        {user ? (
                            <div className="flex flex-col gap-4">
                                <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold uppercase tracking-wider">Perfil</Link>
                                <button onClick={handleLogout} className="text-left text-sm font-bold uppercase tracking-wider text-red">Sair</button>
                            </div>
                        ) : (
                            <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold uppercase tracking-wider">Entrar</Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
