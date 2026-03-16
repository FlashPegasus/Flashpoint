import React from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Trophy, Users, LayoutDashboard, LogOut, Search, Menu, X, User, Plus, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../features/auth/authStore';
import { IconCreatePlus } from '../../assets/icons';
import AdPlaceholder from '../ui/AdPlaceholder';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useNavBump } from '../../hooks/useNavBump';
import { NotificationBell } from './NotificationBell';

// ——————————————————————————————————————————————————————————————————————————
// Navbar Sub-components
// ——————————————————————————————————————————————————————————————————————————
const NavBackground: React.FC<{ 
    svgRef: React.RefObject<SVGSVGElement | null>, 
    pathRef: React.RefObject<SVGPathElement | null> 
}> = ({ svgRef, pathRef }) => (
    <svg className="nav-bg-svg" ref={svgRef}>
        <path
            ref={pathRef}
            fill="#16161f"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="1"
            className="drop-shadow-2xl"
        />
    </svg>
);

// ——————————————————————————————————————————————————————————————————————————
// Navbar
// ——————————————————————————————————————————————————————————————————————————
export const Navbar: React.FC = () => {
    const { user, logout, uiMode, setUiMode } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isCreateOpen, setIsCreateOpen] = React.useState(false);

    // Detect mobile for the SVG bump position
    const isMobile = useMediaQuery('(max-width: 768px)');
    const { navRef, svgRef, pathRef, logoRef, spacerRef } = useNavBump(isMobile);

    
    const handleModeSwitch = (newMode: 'player' | 'organizer') => {
        setUiMode(newMode);
        
        // Sempre redirecionar para o dashboard correspondente ao trocar de modo
        if (newMode === 'player') {
            navigate('/my-area');
        } else {
            navigate('/organizer/dashboard');
        }
    };

    const handleLogout = () => { logout(); navigate('/'); };
    const closeAll = () => { setIsMenuOpen(false); setIsCreateOpen(false); };

    return (
        <div className="nav-wrap">
            <nav className="nav-shape" ref={navRef}>
                {/* 1. LAYER: SVG Background Shape */}
                <NavBackground svgRef={svgRef} pathRef={pathRef} />
                
                {/* 1.5 LAYER: Masked Glint Layer */}
                <div className="nav-glint-layer" />

                {/* 2. LAYER: The Logo in the Bump */}
                <div className="nav-logo-bump" ref={logoRef}>
                    <Link to="/" onClick={closeAll}>
                        <img 
                            src="https://i.postimg.cc/LX1Z1Ss4/Image-1-(1).png" 
                            alt="FlashPoint" 
                            className="w-full h-full object-contain"
                        />
                    </Link>
                </div>

                {/* 3. LAYER: Foreground Content */}
                <div className="nav-content">
                    {/* LEFT ITEMS */}
                    <div className="nav-left-items">
                        {/* LEFT ITEMS (Mobile might use this for back button or breadcrumbs later) */}
                    </div>

                    {/* CENTRAL SPACER (SVG BUMP AREA) */}
                    <div ref={spacerRef} className="nav-logo-spacer" />

                    {/* RIGHT ITEMS */}
                    <div className="nav-right-items gap-2 md:gap-4 lg:gap-6">
                        <div className="hidden md:flex items-center gap-4 lg:gap-6">
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
                                <div className="relative">
                                    <button
                                        onClick={() => setIsCreateOpen(!isCreateOpen)}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-accent-glow text-accent-primary border border-accent-glow-strong rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-accent-primary hover:text-white transition-all shadow-glow-sm"
                                        style={{ color: isCreateOpen ? 'white' : 'var(--accent-primary)', backgroundColor: isCreateOpen ? 'var(--accent-primary)' : 'var(--accent-bg-glass)' }}
                                    >
                                        <Plus size={14} /> <span>Criar</span> <ChevronDown size={11} className={`transition-transform ${isCreateOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isCreateOpen && (
                                        <div className="absolute top-full right-0 mt-3 w-48 glass-card p-2 shadow-2xl border border-white/10 z-[60] animate-fade-in-up">
                                            <button
                                                onClick={() => { navigate('/tournament/create'); closeAll(); }}
                                                className="w-full flex items-center gap-3 p-3 text-[10px] font-bold text-left hover:bg-white/5 rounded-lg transition-colors group"
                                            >
                                                <div className="p-1.5 bg-blue/10 text-blue rounded-md group-hover:bg-blue group-hover:text-white transition-all">
                                                    <Trophy size={14} />
                                                </div>
                                                Novo Torneio
                                            </button>
                                            <button
                                                onClick={() => { navigate('/league/create'); closeAll(); }}
                                                className="w-full flex items-center gap-3 p-3 text-[10px] font-bold text-left hover:bg-white/5 rounded-lg transition-colors group"
                                            >
                                                <div className="p-1.5 bg-green/10 text-green rounded-md group-hover:bg-green group-hover:text-white transition-all">
                                                    <Users size={14} />
                                                </div>
                                                Nova Liga
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2 md:gap-3">
                            {user && (
                                <>
                                    {/* Mode Selector (PC) */}
                                    <div className="hidden lg:flex items-center bg-white/5 rounded-full p-1 border border-white/10 shadow-inner mr-2 relative z-0">
                                        <button
                                            onClick={() => handleModeSwitch('player')}
                                            className={`relative px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${uiMode === 'player' ? 'text-white' : 'text-muted hover:text-secondary'}`}
                                        >
                                            {uiMode === 'player' && (
                                                <div className="absolute inset-0 bg-primary rounded-full shadow-[0_0_15px_rgba(192,57,43,0.5)] animate-fade-in -z-1" />
                                            )}
                                            <span className="relative z-10">Jogador</span>
                                        </button>
                                        <button
                                            onClick={() => handleModeSwitch('organizer')}
                                            className={`relative px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${uiMode === 'organizer' ? 'text-white' : 'text-muted hover:text-secondary'}`}
                                        >
                                            {uiMode === 'organizer' && (
                                                <div className="absolute inset-0 bg-primary rounded-full shadow-[0_0_15px_rgba(192,57,43,0.5)] animate-fade-in -z-1" />
                                            )}
                                            <span className="relative z-10">Organizador</span>
                                        </button>
                                    </div>
                                    
                                    <NotificationBell />
                                </>
                            )}

                            {user ? (
                                <>
                                    <div className="nav-user-profile relative">
                                        <button
                                            onClick={() => navigate('/profile')}
                                            className="w-8 h-8 rounded-full border border-white/10 p-0.5 hover:border-accent-primary transition-all overflow-hidden"
                                        >
                                            <img
                                                src={user.avatar || `https://ui-avatars.com/api/?name=${user.name || 'User'}&background=random`}
                                                alt="Profile"
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        </button>
                                    </div>
                                    <div className="mobile-menu-toggle flex lg:hidden items-center">
                                       <button className="p-2 text-secondary bg-white/5 rounded-lg border border-white/5" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                                           {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                                       </button>
                                   </div>
                                </>
                            ) : (
                                <Link to="/login" className="px-4 py-1.5 bg-accent-primary text-white text-[9px] font-bold uppercase tracking-widest rounded-lg hover:shadow-glow transition-all shadow-glow-sm">
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {isMenuOpen && (
                <div className="md:hidden fixed inset-x-0 top-20 mx-4 glass-card p-6 animate-fade-in shadow-2xl border border-white/10 z-[1001]">
                    <div className="flex flex-col gap-6">
                        {user && (
                            <div className="flex flex-col gap-3">
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#7a5c5c] ml-1">Modo de Visualização</p>
                                <div className="flex items-center bg-white/5 rounded-xl p-1 border border-white/10 shadow-inner relative z-0">
                                    <button
                                        onClick={() => handleModeSwitch('player')}
                                        className={`relative flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${uiMode === 'player' ? 'text-white' : 'text-muted'}`}
                                    >
                                        {uiMode === 'player' && (
                                            <div className="absolute inset-0 bg-[#c0392b] rounded-lg shadow-[0_0_15px_rgba(192,57,43,0.4)] animate-scale-in -z-1" />
                                        )}
                                        <span className="relative z-10">Jogador</span>
                                    </button>
                                    <button
                                        onClick={() => handleModeSwitch('organizer')}
                                        className={`relative flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${uiMode === 'organizer' ? 'text-white' : 'text-muted'}`}
                                    >
                                        {uiMode === 'organizer' && (
                                            <div className="absolute inset-0 bg-[#c0392b] rounded-lg shadow-[0_0_15px_rgba(192,57,43,0.4)] animate-scale-in -z-1" />
                                        )}
                                        <span className="relative z-10">Organizador</span>
                                    </button>
                                </div>
                            </div>
                        )}

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
                        </div>
                        
                        <div className="h-px bg-white/10"></div>
                        <div className="flex flex-col gap-4">
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
                                <Link to="/login" onClick={closeAll} className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-accent-primary">
                                    <LogOut size={18} className="rotate-180" /> <span>Fazer Login</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
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
                            `flex flex-col items-center gap-1 transition-all flex-1 ${isActive ? 'text-accent-primary' : 'text-secondary hover:text-primary'}`
                        }
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
                            `flex flex-col items-center gap-1 transition-all flex-1 ${isActive ? 'text-accent-primary' : 'text-secondary hover:text-primary'}`
                        }
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
                            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all border-4 border-black group active:scale-90 fab-neon-solid animate-pulse-subtle ${isCreateOpen ? 'rotate-45' : ''}`}
                        >
                            <IconCreatePlus size={28} color="white" />
                        </button>
                    </div>

                    <NavLink
                        to="/my-area"
                        className={({ isActive }) =>
                            `flex flex-col items-center gap-1 transition-all flex-1 ${isActive ? 'text-accent-primary' : 'text-secondary hover:text-primary'}`
                        }
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
                            `flex flex-col items-center gap-1 transition-all flex-1 ${isActive ? 'text-accent-primary' : 'text-secondary hover:text-primary'}`
                        }
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

            
            {showBackground && (
                <>
                    <div className="bg-premium-mesh" aria-hidden="true" />
                    <div className="bg-premium-grid" aria-hidden="true" />
                </>
            )}

            <main className="flex-grow pt-32 animate-fade-in relative">
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
