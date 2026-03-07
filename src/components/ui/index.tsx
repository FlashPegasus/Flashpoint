import React from 'react';

// Re-exporting from other files
export { default as Modal } from './Modal';

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

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, ...props }) => (
    <div className="flex flex-col gap-2.5 w-full">
        {label && <label className="text-[10px] font-bold text-muted ml-2 uppercase tracking-widest">{label}</label>}
        <input
            className="w-full glass p-4 focus:outline-none focus:ring-2 focus:ring-purple/20 transition-all border-white/5 bg-white/2 text-primary placeholder:text-muted/50 rounded-2xl"
            {...props}
        />
    </div>
);

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
