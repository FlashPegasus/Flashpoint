import React from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Trophy, Users, LayoutDashboard, LogOut, Search, Menu, X, User, Bell, Plus, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../features/auth/authStore';
import { IconCreatePlus } from '../../assets/icons';
import AdPlaceholder from '../ui/AdPlaceholder';
import { DesignLab } from './DesignLab';

// ——————————————————————————————————————————————————————————————————————————
// Navbar
// ——————————————————————————————————————————————————————————————————————————
export const Navbar: React.FC = () => {
    const { user, logout, uiMode, setUiMode } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isCreateOpen, setIsCreateOpen] = React.useState(false);
    const [isNotifOpen, setIsNotifOpen] = React.useState(false);
    const toggleUiMode = () => setUiMode(uiMode === 'player' ? 'organizer' : 'player');
    const handleLogout = () => { logout(); navigate('/'); };
    const isGuest = user?.email === 'guest@flashpoint.app';

    const closeAll = () => {
        setIsMenuOpen(false);
        setIsCreateOpen(false);
        setIsNotifOpen(false);
    };

    return (
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-6xl">
            <div className="relative flex items-center justify-between h-16 md:h-20">
                {/* Background Glass Bar - Split or Shaped */}
                <div className="absolute inset-0 glass shadow-2xl rounded-2xl border-white/10 bg-black/60 backdrop-blur-xl -z-10" />
                
                {/* 1. LEFT SECTION: Mode Toggle */}
                <div className="flex-1 flex items-center pl-4 md:pl-8">
                    {user && (
                        <div className="hidden lg:flex items-center bg-white/5 rounded-full p-1 border border-white/10 shadow-inner">
                            <button
                                onClick={() => setUiMode('player')}
                                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${uiMode === 'player' ? 'bg-purple text-white shadow-glow' : 'text-secondary hover:text-primary'}`}
                                style={uiMode === 'player' ? { backgroundColor: 'var(--accent-primary)' } : {}}
                            >
                                Jogador
                            </button>
                            <button
                                onClick={() => setUiMode('organizer')}
                                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${uiMode === 'organizer' ? 'bg-purple text-white shadow-glow' : 'text-secondary hover:text-primary'}`}
                                style={uiMode === 'organizer' ? { backgroundColor: 'var(--accent-primary)' } : {}}
                            >
                                Organizador
                            </button>
                        </div>
                    )}
                </div>

                {/* 2. CENTER SECTION: The Bulge & Logo */}
                <div className="relative flex-shrink-0 flex items-center justify-center">
                    {/* The Bulge Shape */}
                    <div className="absolute -top-6 w-32 md:w-48 h-28 md:h-36 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-[50%] shadow-[0_15px_50px_rgba(0,0,0,0.8)] flex items-center justify-center -z-10">
                        {/* Inner glow */}
                        <div className="absolute inset-2 rounded-[50%] border-t border-white/20 blur-sm pointer-events-none" />
                        <div className="absolute inset-0 rounded-[50%] bg-gradient-to-b from-transparent to-red-600/10 pointer-events-none" />
                    </div>

                    <Link to="/" className="relative z-10 block transform -translate-y-2 hover:scale-110 transition-transform duration-500" aria-label="FlashPoint Home">
                        <img
                            src="https://i.postimg.cc/054yqDWK/Image-1-(1).png"
                            alt="FlashPoint Logo"
                            className="h-16 md:h-24 w-auto object-contain drop-shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                        />
                    </Link>
                </div>

                {/* 3. RIGHT SECTION: Navigation & User */}
                <div className="flex-1 flex items-center justify-end pr-4 md:pr-8 gap-4 md:gap-8">
                    <div className="hidden md:flex items-center gap-6">
                        {uiMode === 'player' ? (
                            <>
                                <Link to="/discover" className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${location.pathname === '/discover' ? 'text-primary' : 'text-secondary hover:text-primary'}`}>
                                    <Search size={14} /><span>Descobrir</span>
                                </Link>
                                <Link to="/leagues" className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${location.pathname === '/leagues' ? 'text-primary' : 'text-secondary hover:text-primary'}`}>
                                    <Users size={14} /><span>Ligas</span>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/my-area" className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors ${location.pathname === '/my-area' ? 'text-primary' : 'text-secondary hover:text-primary'}`}>
                                    <LayoutDashboard size={14} /><span>Meus Eventos</span>
                                </Link>
                                <div className="relative">
                                    <button
                                        onClick={() => setIsCreateOpen(!isCreateOpen)}
                                        className="flex items-center gap-2 px-4 py-2 bg-accent-glow text-accent-primary border border-accent-glow-strong rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-accent-primary hover:text-white transition-all shadow-glow-sm"
                                        style={{ color: isCreateOpen ? 'white' : 'var(--accent-primary)', backgroundColor: isCreateOpen ? 'var(--accent-primary)' : 'var(--accent-bg-glass)' }}
                                    >
                                        <Plus size={14} /> <span>Criar</span> <ChevronDown size={12} className={`transition-transform ${isCreateOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isCreateOpen && (
                                        <div className="absolute top-full right-0 mt-3 w-48 glass-card p-2 shadow-2xl border border-white/10 z-[60] animate-fade-in-up">
                                            <button
                                                onClick={() => { navigate('/tournament/create'); setIsCreateOpen(false); }}
                                                className="w-full flex items-center gap-3 p-3 text-xs font-bold text-left hover:bg-white/5 rounded-lg transition-colors group"
                                            >
                                                <div className="p-1.5 bg-blue/10 text-blue rounded-md group-hover:bg-blue group-hover:text-white transition-all">
                                                    <Trophy size={14} />
                                                </div>
                                                Novo Torneio
                                            </button>
                                            <button
                                                onClick={() => { navigate('/league/create'); setIsCreateOpen(false); }}
                                                className="w-full flex items-center gap-3 p-3 text-xs font-bold text-left hover:bg-white/5 rounded-lg transition-colors group"
                                            >
                                                <div className="p-1.5 bg-green/10 text-green rounded-md group-hover:bg-green group-hover:text-white transition-all">
                                                    <Users size={14} />
                                                </div>
                                                Nova Liga
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                    <div className="h-4 w-px bg-white/10 mx-2"></div>
                    <div className="flex items-center gap-3">
                        {/* Legacy theme toggle removed per user request */}

                        {user ? (
                            <>
                                <div className="relative">
                                    <button
                                        onClick={() => setIsNotifOpen(!isNotifOpen)}
                                        className="p-2 text-secondary hover:text-primary transition-all relative rounded-lg hover:bg-white/5"
                                    >
                                        <Bell size={18} />
                                        <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-black animate-pulse"></span>
                                    </button>
                                    {isNotifOpen && (
                                        <div className="absolute top-full right-0 mt-3 w-72 glass-card p-4 shadow-2xl border border-white/10 z-[60] animate-fade-in-up">
                                            <div className="flex justify-between items-center mb-4">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Notificações</p>
                                                <button className="text-[9px] text-purple hover:underline">Limpar tudo</button>
                                            </div>
                                            <div className="text-center py-8 opacity-40">
                                                <Bell size={24} className="mx-auto mb-2" />
                                                <p className="text-[10px]">Tudo em ordem por aqui!</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 bg-white/5 pl-1 pr-1 py-1 rounded-full border border-white/10">
                                    <Link to="/profile" className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-white/5 transition-all">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] overflow-hidden shadow-lg border border-white/20" style={{ backgroundColor: 'var(--color-purple)' }}>
                                            {user.avatar
                                                ? <img src={user.avatar} className="w-full h-full object-cover" alt="" />
                                                : user.name.charAt(0).toUpperCase()
                                            }
                                        </div>
                                        <span className="text-[9px] font-bold uppercase tracking-wider max-w-[80px] truncate">
                                            {isGuest ? 'Convidado' : user.name}
                                        </span>
                                    </Link>
                                    <button onClick={handleLogout} className="p-2 text-muted hover:text-red transition-colors">
                                        <LogOut size={14} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <Link to="/login" className="px-6 py-2.5 bg-accent-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:shadow-glow transition-all shadow-glow-sm" style={{ backgroundColor: 'var(--accent-primary)' }}>
                                Entrar
                            </Link>
                        )}
                    </div>
                </div>

                {/* Mobile Toggle */}
                <div className="flex md:hidden items-center gap-2">
                    {user && (
                        <button
                            onClick={toggleUiMode}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border border-white/10 transition-all ${uiMode === 'organizer' ? 'bg-purple/20 text-purple border-purple/30' : 'bg-white/5 text-secondary'}`}
                        >
                            {uiMode === 'organizer' ? 'Org' : 'Player'}
                        </button>
                    )}
                    <button className="p-2 text-secondary bg-white/5 rounded-lg border border-white/10" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden mt-2 glass-card p-6 animate-fade-in shadow-2xl border border-white/10">
                    <div className="flex flex-col gap-6">
                        <Link to="/discover" onClick={closeAll} className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-secondary hover:text-primary transition-colors">
                            <Search size={18} /> <span>Descobrir Eventos</span>
                        </Link>
                        <Link to="/leagues" onClick={closeAll} className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-secondary hover:text-primary transition-colors">
                            <Users size={18} /> <span>Ver Ligas</span>
                        </Link>
                        {user && (
                            <Link to="/my-area" onClick={closeAll} className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-secondary hover:text-primary transition-colors">
                                <LayoutDashboard size={18} /> <span>Minha Área</span>
                            </Link>
                        )}
                        <div className="h-px bg-white/10"></div>
                        <div className="flex flex-col gap-4">
                            {/* Legacy theme toggle removed */}
                            {user ? (
                                <>
                                    <Link to="/profile" onClick={closeAll} className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-secondary">
                                        <User size={18} /> <span>Meu Perfil</span>
                                    </Link>
                                    <button onClick={handleLogout} className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-red">
                                        <LogOut size={18} /> <span>Sair</span>
                                    </button>
                                </>
                            ) : (
                                <Link to="/login" onClick={closeAll} className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-purple">
                                    <LogOut size={18} className="rotate-180" /> <span>Fazer Login</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

// ——————————————————————————————————————————————————————————————————————————
// BottomNav
// ——————————————————————————————————————————————————————————————————————————
export const BottomNav: React.FC = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [isCreateOpen, setIsCreateOpen] = React.useState(false);

    if (!user) return null;

    return (
        <>
            {/* Create Overlay Mobile */}
            {isCreateOpen && (
                <div className="md:hidden fixed inset-0 z-[60] animate-fade-in bg-black/60 backdrop-blur-sm" onClick={() => setIsCreateOpen(false)}>
                    <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex flex-col gap-4 w-[calc(100%-4rem)] animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => { navigate('/tournament/create'); setIsCreateOpen(false); }}
                            className="bg-black/80 glass border border-white/10 p-5 rounded-2xl flex items-center justify-between shadow-2xl active:scale-95 transition-transform"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue/20 text-blue rounded-xl">
                                    <Trophy size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold uppercase tracking-wider">Novo Torneio</p>
                                    <p className="text-[10px] text-muted">Gestão completa de mesas</p>
                                </div>
                            </div>
                            <Plus size={18} className="text-muted" />
                        </button>

                        <button
                            onClick={() => { navigate('/league/create'); setIsCreateOpen(false); }}
                            className="bg-black/80 glass border border-white/10 p-5 rounded-2xl flex items-center justify-between shadow-2xl active:scale-95 transition-transform"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green/20 text-green rounded-xl">
                                    <Users size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold uppercase tracking-wider">Nova Liga</p>
                                    <p className="text-[10px] text-muted">Rankings e temporadas</p>
                                </div>
                            </div>
                            <Plus size={18} className="text-muted" />
                        </button>
                    </div>
                </div>
            )}

            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2">
                <div className="glass shadow-2xl rounded-2xl border-white/10 flex items-center justify-around py-3 px-2 bg-black/80 backdrop-blur-xl relative">
                    <NavLink
                        to="/discover"
                        className={({ isActive }) =>
                            `flex flex-col items-center gap-1 transition-all flex-1 ${isActive ? 'text-purple' : 'text-secondary hover:text-primary'}`
                        }
                        style={({ isActive }) => isActive ? { color: 'var(--color-purple)' } : {}}
                    >
                        {({ isActive }) => (
                            <>
                                <Search size={22} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-[9px] font-bold uppercase tracking-wider">Descobrir</span>
                            </>
                        )}
                    </NavLink>

                    <NavLink
                        to="/leagues"
                        className={({ isActive }) =>
                            `flex flex-col items-center gap-1 transition-all flex-1 ${isActive ? 'text-purple' : 'text-secondary hover:text-primary'}`
                        }
                        style={({ isActive }) => isActive ? { color: 'var(--color-purple)' } : {}}
                    >
                        {({ isActive }) => (
                            <>
                                <Trophy size={22} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-[9px] font-bold uppercase tracking-wider">Ligas</span>
                            </>
                        )}
                    </NavLink>

                    {/* Central FAB */}
                    <div className="flex-1 flex justify-center -translate-y-6">
                        <button
                            onClick={() => setIsCreateOpen(!isCreateOpen)}
                            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-glow shadow-purple/30 transition-all border-4 border-black group active:scale-90 ${isCreateOpen ? 'rotate-45' : ''}`}
                            style={{ backgroundColor: 'var(--color-purple)' }}
                        >
                            <IconCreatePlus size={28} color="white" />
                        </button>
                    </div>

                    <NavLink
                        to="/my-area"
                        className={({ isActive }) =>
                            `flex flex-col items-center gap-1 transition-all flex-1 ${isActive ? 'text-purple' : 'text-secondary hover:text-primary'}`
                        }
                        style={({ isActive }) => isActive ? { color: 'var(--color-purple)' } : {}}
                    >
                        {({ isActive }) => (
                            <>
                                <LayoutDashboard size={22} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-[9px] font-bold uppercase tracking-wider">Gestão</span>
                            </>
                        )}
                    </NavLink>

                    <NavLink
                        to="/profile"
                        className={({ isActive }) =>
                            `flex flex-col items-center gap-1 transition-all flex-1 ${isActive ? 'text-purple' : 'text-secondary hover:text-primary'}`
                        }
                        style={({ isActive }) => isActive ? { color: 'var(--color-purple)' } : {}}
                    >
                        {({ isActive }) => (
                            <>
                                <User size={22} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-[9px] font-bold uppercase tracking-wider">Perfil</span>
                            </>
                        )}
                    </NavLink>
                </div>
            </nav>
        </>
    );
};

// ——————————————————————————————————————————————————————————————————————————
// PageShell
// ——————————————————————————————————————————————————————————————————————————
interface PageShellProps {
    children: React.ReactNode;
    title?: string;
    showAd?: boolean;
    showBackground?: boolean;
}

const PageShell: React.FC<PageShellProps> = ({ children, showAd = true, showBackground = false }) => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <DesignLab />
            
            {showBackground && (
                <>
                    <div className="bg-premium-mesh" aria-hidden="true" />
                    <div className="bg-premium-grid" aria-hidden="true" />
                </>
            )}

            <main className="flex-grow pt-24 animate-fade-in relative z-10">
                {children}

                {showAd && (
                    <div className="container mt-8">
                        <AdPlaceholder className="ad-shell-banner" />
                    </div>
                )}
            </main>
            <footer className="py-16 mt-auto border-t border-white/5 bg-white/[0.02]">
                <div className="container text-center text-muted">
                    <p>© {new Date().getFullYear()} FlashPoint - Gerenciador de Torneios TCG</p>
                    <p className="text-sm mt-1">Feito para a comunidade de TCG.</p>
                    <p className="text-xs mt-3">
                        <a href="/privacidade" className="hover:text-accent transition-colors underline underline-offset-2">
                            Política de Privacidade
                        </a>
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default PageShell;
