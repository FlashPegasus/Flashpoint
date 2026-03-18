import React from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Trophy, Users, LayoutDashboard, LogOut, Search, Menu, X, User as UserIcon, Plus, ChevronDown, Home, Compass } from 'lucide-react';
import { useAuthStore } from '../../features/auth/authStore';
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
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isCreateOpen, setIsCreateOpen] = React.useState(false);

    // Detect mobile for the SVG bump position
    const isMobile = useMediaQuery('(max-width: 768px)');
    const { navRef, svgRef, pathRef, logoRef, spacerRef } = useNavBump(isMobile);

    const closeAll = () => { setIsMenuOpen(false); setIsCreateOpen(false); };

    return (
        <div className="nav-container">
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
                        </div>

                        {/* CENTRAL SPACER (SVG BUMP AREA) */}
                        <div ref={spacerRef} className="nav-logo-spacer" />

                        {/* RIGHT ITEMS */}
                        <div className="nav-right-items gap-2 md:gap-4 lg:gap-6">
                            <div className="hidden md:flex items-center gap-4 lg:gap-6">
                                <Link to="/discover" className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${location.pathname === '/discover' ? 'text-primary' : 'text-secondary hover:text-primary'}`}>
                                    <Search size={14} /><span>Descobrir</span>
                                </Link>
                                <Link to="/leagues" className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${location.pathname === '/leagues' ? 'text-primary' : 'text-secondary hover:text-primary'}`}>
                                    <Users size={14} /><span>Ligas</span>
                                </Link>
                                <Link to="/ranking" className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${location.pathname === '/ranking' ? 'text-primary' : 'text-secondary hover:text-primary'}`}>
                                    <Trophy size={14} /><span>Ranking</span>
                                </Link>
                                
                                {user && (
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
            </div>

            {/* MOBILE MENU */}
            {isMenuOpen && (
                <div className="md:hidden fixed inset-x-0 top-24 mx-4 glass-card p-6 animate-fade-in shadow-2xl border border-white/10 z-[1001] pointer-events-auto">
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-5">
                            <button 
                                onClick={() => { navigate('/ranking'); closeAll(); }} 
                                className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-secondary hover:text-primary transition-colors text-left"
                            >
                                <Trophy size={18} /> <span>Ranking Global</span>
                            </button>
                            <button 
                                onClick={() => { navigate('/leagues'); closeAll(); }} 
                                className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-secondary hover:text-primary transition-colors text-left"
                            >
                                <Users size={18} /> <span>Ver Ligas</span>
                            </button>
                            <button 
                                onClick={() => { navigate('/en'); closeAll(); }} 
                                className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-secondary hover:text-primary transition-colors text-left"
                            >
                                <LayoutDashboard size={18} /> <span>Guia de Tradução</span>
                            </button>
                            
                            {user && (
                                <>
                                    <div className="h-px bg-white/10 my-1"></div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#7a5c5c] ml-1">Gerenciamento</p>
                                    <button 
                                        onClick={() => { navigate('/tournament/create'); closeAll(); }}
                                        className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-secondary hover:text-primary transition-colors text-left"
                                    >
                                        <Plus size={18} /> <span>Criar Torneio</span>
                                    </button>
                                    <button 
                                        onClick={() => { navigate('/league/create'); closeAll(); }}
                                        className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-secondary hover:text-primary transition-colors text-left"
                                    >
                                        <Users size={18} /> <span>Criar Liga</span>
                                    </button>
                                </>
                            )}
                        </div>
                        
                        <div className="h-px bg-white/10"></div>
                        <div className="flex flex-col gap-4">
                            {user ? (
                                <>
                                    <button onClick={() => { navigate('/profile'); closeAll(); }} className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-secondary text-left">
                                        <UserIcon size={18} /> <span>Meu Perfil</span>
                                    </button>
                                    <button 
                                        onClick={async () => { await logout(); navigate('/'); closeAll(); }} 
                                        className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-red-500 text-left"
                                    >
                                        <LogOut size={18} /> <span>Sair</span>
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => { navigate('/login'); closeAll(); }} className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-accent-primary text-left">
                                    <LogOut size={18} className="rotate-180" /> <span>Fazer Login</span>
                                </button>
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
const NAV_ITEMS = [
  { path: '/',         label: 'Home',       icon: Home    },
  { path: '/my-area',  label: 'Minha Área', icon: UserIcon    },
  { path: '/discover', label: 'Descobrir',  icon: Compass },
] as const;

export const BottomNav: React.FC = () => {
    const { user } = useAuthStore();
    const location = useLocation();

    // Ocultar nav em páginas que não precisam dela
    const hidden = ['/', '/login'].includes(location.pathname);
    if (hidden) return null;

    return (
        <>
            {/* Safe area spacer — empurra conteúdo acima da nav */}
            <div style={{ height: '72px' }} className="md:hidden" />

            <nav className="md:hidden flex items-center gap-2" style={{
                position: 'fixed',
                bottom: '12px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 100,
                background: '#16161f',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '100px',
                padding: '5px',
                boxShadow: '0 4px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                paddingBottom: 'max(5px, env(safe-area-inset-bottom, 5px))',
            }}>
                {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
                    const href = path === '/my-area' && !user ? '/login' : path;
                    const isActive = location.pathname === path ||
                        (path === '/my-area' && location.pathname.startsWith('/my-area'));

                    return (
                        <NavLink
                            key={path}
                            to={href}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '3px',
                                padding: '8px 20px',
                                borderRadius: '100px',
                                textDecoration: 'none',
                                fontSize: '10px',
                                fontFamily: "'Outfit', sans-serif",
                                fontWeight: 700,
                                letterSpacing: '0.3px',
                                transition: 'all 0.25s ease',
                                background: isActive ? 'rgba(192,57,43,0.18)' : 'transparent',
                                border: isActive ? '1px solid rgba(192,57,43,0.4)' : '1px solid transparent',
                                color: isActive ? '#e74c3c' : '#7a5c5c',
                                boxShadow: isActive ? '0 0 16px rgba(192,57,43,0.2)' : 'none',
                            }}
                        >
                            <Icon
                                size={18}
                                style={{
                                    color: isActive ? '#e74c3c' : '#7a5c5c',
                                    transition: 'color 0.25s',
                                }}
                            />
                            {label}
                        </NavLink>
                    );
                })}
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
                    <p className="text-xs mt-3 flex items-center justify-center gap-4">
                        <a href="/privacy" className="hover:text-accent transition-colors underline underline-offset-2">
                            Política de Privacidade
                        </a>
                        <span className="w-1 h-1 rounded-full bg-white/10" />
                        <a href="/en" className="hover:text-accent transition-colors underline underline-offset-2">
                            English Guide
                        </a>
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default PageShell;
