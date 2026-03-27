import React, { useState } from 'react';
import { UserCircle, Mail } from 'lucide-react';
import { useAuthStore } from '../../features/auth/authStore';
import { Modal } from '../ui';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { loginWithGoogle, loginAnonymously, isLoading, error } = useAuthStore();
    const [authError, setAuthError] = useState<string | null>(null);

    const handleGoogleLogin = async () => {
        setAuthError(null);
        const user = await loginWithGoogle();
        if (user) {
            if (onSuccess) onSuccess();
            onClose();
        }
    };

    const handleGuestLogin = async () => {
        setAuthError(null);
        try {
            await loginAnonymously();
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            setAuthError((err as Error).message);
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="" // Empty title to use custom card header
            className="auth-card-modal"
        >
            <div className="auth-card-header">
                <div className="flex flex-col items-center">
                    <span className="text-4xl mb-2 drop-shadow-glow">⚡</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400 opacity-80">FlashPoint Auth</span>
                </div>
            </div>

            <div className="auth-card-body flex flex-col items-center text-center">
                <h3 className="text-xl font-bold font-outfit mb-2">Entrar na Arena</h3>
                <p className="text-muted text-xs mb-8 px-4 leading-relaxed">
                    Você precisa estar conectado para comprar cartas e sincronizar seu deck.
                </p>

                <div className="w-full space-y-3">
                    <button
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full glass py-4 flex items-center justify-center gap-3 hover:bg-white/10 transition-all rounded-2xl border border-white/5 active:scale-[0.98]"
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" alt="Google" />
                        <span className="text-sm font-bold">Continuar com Google</span>
                    </button>

                    <button
                        onClick={handleGuestLogin}
                        disabled={isLoading}
                        className="w-full glass py-4 flex items-center justify-center gap-3 hover:bg-white/10 transition-all rounded-2xl border border-white/5 active:scale-[0.98]"
                    >
                        <UserCircle size={20} className="text-secondary" />
                        <span className="text-sm font-bold text-secondary">Entrar como Convidado</span>
                    </button>
                    
                    <div className="pt-4 flex items-center gap-3">
                        <div className="h-[1px] bg-white/5 flex-1" />
                        <span className="text-[10px] text-muted uppercase tracking-widest font-black">Ou use e-mail</span>
                        <div className="h-[1px] bg-white/5 flex-1" />
                    </div>

                    <a 
                        href="/login" 
                        className="w-full py-4 flex items-center justify-center gap-2 text-xs font-bold text-muted hover:text-primary transition-colors"
                    >
                        <Mail size={14} /> Ir para login completo
                    </a>
                </div>

                {(error || authError) && (
                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl w-full">
                        <p className="text-red-400 text-xs text-center">{error || authError}</p>
                    </div>
                )}

                <p className="mt-8 text-[9px] text-muted uppercase tracking-[0.2em] leading-relaxed px-6 opacity-30">
                    Ao entrar, você concorda com nossos termos. Dados de convidado são locais e temporários.
                </p>
            </div>
        </Modal>
    );
};

export default AuthModal;
