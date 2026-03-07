import React from 'react';
import { NavLink } from 'react-router-dom';
import { Search, LayoutDashboard, User, Trophy } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const BottomNav: React.FC = () => {
    const { user } = useAuthStore();

    if (!user) return null;

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2">
            <div className="glass shadow-2xl rounded-2xl border-white/10 flex items-center justify-around py-3 px-6 bg-black/80 backdrop-blur-xl">
                <NavLink
                    to="/discover"
                    className={({ isActive }) =>
                        `flex flex-col items-center gap-1 transition-all ${isActive ? 'text-purple' : 'text-secondary hover:text-primary'}`
                    }
                    style={({ isActive }) => isActive ? { color: 'var(--color-purple)' } : {}}
                >
                    <Search size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Explorar</span>
                </NavLink>

                <NavLink
                    to="/leagues"
                    className={({ isActive }) =>
                        `flex flex-col items-center gap-1 transition-all ${isActive ? 'text-purple' : 'text-secondary hover:text-primary'}`
                    }
                    style={({ isActive }) => isActive ? { color: 'var(--color-purple)' } : {}}
                >
                    <Trophy size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Ligas</span>
                </NavLink>

                <NavLink
                    to="/my-area"
                    className={({ isActive }) =>
                        `flex flex-col items-center gap-1 transition-all ${isActive ? 'text-purple' : 'text-secondary hover:text-primary'}`
                    }
                    style={({ isActive }) => isActive ? { color: 'var(--color-purple)' } : {}}
                >
                    <LayoutDashboard size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Área</span>
                </NavLink>

                <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                        `flex flex-col items-center gap-1 transition-all ${isActive ? 'text-purple' : 'text-secondary hover:text-primary'}`
                    }
                    style={({ isActive }) => isActive ? { color: 'var(--color-purple)' } : {}}
                >
                    <User size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Perfil</span>
                </NavLink>
            </div>
        </nav>
    );
};

export default BottomNav;
