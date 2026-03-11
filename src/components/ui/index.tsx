import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronRight, Home } from 'lucide-react';
export * from './DynamicIcon';

// ─────────────────────────────────────────────
// Button
// ─────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'glow';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    loading,
    children,
    className = '',
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-2xl font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';

    const variants = {
        primary: 'bg-purple text-white shadow-lg hover:shadow-glow',
        secondary: 'glass text-primary hover:bg-white/10',
        ghost: 'hover:bg-white/5 text-secondary hover:text-primary',
        danger: 'bg-red text-white hover:shadow-lg',
        glow: 'bg-purple text-white shadow-glow brightness-110'
    };

    const sizes = {
        sm: 'px-4 py-2 text-xs',
        md: 'px-6 py-3.5 text-sm',
        lg: 'px-10 py-5 text-base'
    };

    const styleObj: any = {};
    if (variant === 'primary' || variant === 'glow') styleObj.backgroundColor = 'var(--color-purple)';
    if (variant === 'danger') styleObj.backgroundColor = 'var(--color-red)';

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            style={styleObj}
            disabled={loading || props.disabled}
            {...props}
        >
            {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : children}
        </button>
    );
};

// ─────────────────────────────────────────────
// Card
// ─────────────────────────────────────────────
export interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, onClick }) => (
    <div
        className={`glass-card p-8 group ${onClick ? 'cursor-pointer hover-lift' : ''} ${className}`}
        onClick={onClick}
    >
        {title && <h3 className="mb-8 font-outfit">{title}</h3>}
        {children}
    </div>
);

// ─────────────────────────────────────────────
// Input
// ─────────────────────────────────────────────
export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, ...props }) => (
    <div className="flex flex-col gap-2.5 w-full">
        {label && <label className="text-[10px] font-bold text-muted ml-2 uppercase tracking-widest">{label}</label>}
        <input
            className="w-full glass p-4 focus:outline-none focus:ring-2 focus:ring-purple/20 transition-all border-white/5 bg-white/2 text-primary placeholder:text-muted/50 rounded-2xl"
            {...props}
        />
    </div>
);

// ─────────────────────────────────────────────
// Select
// ─────────────────────────────────────────────
export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; options: { value: string, label: string }[] }> = ({ label, options, ...props }) => (
    <div className="flex flex-col gap-2 w-full text-primary">
        {label && <label className="text-sm font-bold text-primary ml-1 uppercase tracking-wider text-[10px]">{label}</label>}
        <div className="relative">
            <select
                className="w-full glass p-3 focus:outline-none transition-all border-white/5 bg-white/5 appearance-none cursor-pointer"
                {...props}
            >
                {options.map(opt => <option key={opt.value} value={opt.value} className="bg-[#1a1c23] text-primary">{opt.label}</option>)}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted">▼</div>
        </div>
    </div>
);

// ─────────────────────────────────────────────
// Modal
// ─────────────────────────────────────────────
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleEsc);
        }
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            <div className="glass-card w-full max-w-lg relative z-10 flex flex-col max-h-[90vh] shadow-2xl border-white/10">
                <div className="flex justify-between items-center p-6 border-b border-white/5">
                    <h2 className="text-2xl font-outfit font-bold">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors text-secondary hover:text-primary"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {children}
                </div>
                {footer && (
                    <div className="p-6 border-t border-white/5 bg-white/2">
                        {footer}
                    </div>
                )}
            </div>
            <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border-glass); border-radius: 10px; }
      `}</style>
        </div>
    );
};

// ─────────────────────────────────────────────
// LoadingScreen
// ─────────────────────────────────────────────
interface LoadingScreenProps {
    message?: string;
    gifUrl?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
    message = 'Carregando...',
    gifUrl = 'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHp1eHR6ZDV6ZDV6ZDV6ZDV6ZDV6ZDV6ZDV6ZDV6ZDV6ZDV&ep=v1_gifs_search&rid=giphy.gif&ct=g'
}) => {
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-[9999] animate-fade-in">
            <div className="relative w-32 h-32 mb-6">
                <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full animate-pulse"></div>
                <div className="relative w-full h-full rounded-2xl overflow-hidden glass border border-white/10 shadow-2xl flex items-center justify-center">
                    <img
                        src={gifUrl}
                        alt="Loading..."
                        className="w-20 h-20 object-contain mix-blend-screen opacity-80"
                    />
                </div>
            </div>
            <div className="text-center">
                <h3 className="text-lg font-bold font-outfit tracking-wider text-primary mb-2">{message}</h3>
                <div className="flex gap-1 justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce"></div>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────
// Breadcrumbs
// ─────────────────────────────────────────────
interface BreadcrumbItem {
    label: string;
    path?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
    return (
        <nav className="flex items-center gap-2 text-xs text-muted mb-6 overflow-x-auto whitespace-nowrap pb-2 lg:pb-0 no-scrollbar">
            <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
                <Home size={14} />
                <span>Home</span>
            </Link>
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    <ChevronRight size={12} className="opacity-40 shrink-0" />
                    {item.path ? (
                        <Link to={item.path} className="hover:text-primary transition-colors">
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-secondary font-medium">{item.label}</span>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
};
