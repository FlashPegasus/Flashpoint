import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Zap, ArrowRight, ShieldCheck, Camera, StopCircle } from 'lucide-react';
import { tournamentService } from '../../features/tournaments/tournamentService';
import toast from 'react-hot-toast';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface CheckInModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CheckInModal: React.FC<CheckInModalProps> = ({ isOpen, onClose }) => {
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isOpen && isScanning) {
            stopScanner();
        }
    }, [isOpen]);

    const startScanner = () => {
        setIsScanning(true);
        // Delay initialization to ensure the container is mounted
        setTimeout(() => {
            const scanner = new Html5QrcodeScanner(
                "qr-reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
                /* verbose= */ false
            );
            
            scanner.render((decodedText) => {
                setCode(decodedText.toUpperCase());
                stopScanner();
                toast.success("Código escaneado!");
            }, () => {
                // Ignore frame errors
            });
            
            scannerRef.current = scanner;
        }, 300);
    };

    const stopScanner = () => {
        if (scannerRef.current) {
            scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
            scannerRef.current = null;
        }
        setIsScanning(false);
    };

    const handleCheckIn = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (code.length < 4) {
            toast.error('Código muito curto.');
            return;
        }

        setIsLoading(true);
        try {
            // Check if tournament exists
            const tournament = await tournamentService.getTournament(code);
            if (tournament) {
                toast.success('Torneio encontrado!');
                navigate(`/tournament/${tournament.id}/public`);
                onClose();
            } else {
                toast.error('Torneio não encontrado ou código inválido.');
            }
        } catch (err) {
            toast.error('Erro ao buscar torneio.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-void/80 backdrop-blur-md animate-fade-in">
            <div className="relative w-full max-w-md fp-card p-8 animate-slide-up border-primary/30 overflow-hidden">
                {/* Decorative glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-[60px] pointer-events-none" />
                
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-muted hover:text-white transition-colors z-50"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 text-primary shadow-glow">
                        <Zap size={32} />
                    </div>
                    <h2 className="text-2xl font-display font-black mb-2">Check-in <span className="text-primary">Rápido</span></h2>
                    <p className="text-sm text-muted">Insira o código do torneio ou use a câmera para entrar na arena.</p>
                </div>

                {!isScanning ? (
                    <form onSubmit={handleCheckIn} className="space-y-6">
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-50 group-focus-within:opacity-100 transition-opacity">
                                <ShieldCheck size={20} />
                            </div>
                            <input 
                                type="text" 
                                placeholder="CÓDIGO (EX: FP123X)"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-center font-mono text-xl tracking-[0.3em] focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-muted/30"
                                autoFocus
                                maxLength={10}
                            />
                        </div>

                        <button 
                            type="submit"
                            disabled={isLoading || !code}
                            className="w-full py-4 fp-btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {isLoading ? 'Buscando...' : (
                                <>
                                    Entrar na Arena <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                        
                        <div className="h-px bg-white/5 my-2"></div>

                        <button 
                            type="button"
                            onClick={startScanner}
                            className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-3 active:scale-95"
                        >
                            <Camera size={16} className="text-primary" /> Escanear QR Code
                        </button>
                    </form>
                ) : (
                    <div className="space-y-6 animate-fade-in">
                        <div id="qr-reader" className="w-full overflow-hidden rounded-2xl border border-primary/30 bg-black/40"></div>
                        <button 
                            type="button"
                            onClick={stopScanner}
                            className="w-full py-4 bg-red/10 border border-red/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-red flex items-center justify-center gap-3 active:scale-95 transition-all"
                        >
                            <StopCircle size={18} /> Cancelar Escaneamento
                        </button>
                    </div>
                )}
                
                <p className="mt-8 text-[9px] text-muted text-center uppercase tracking-widest opacity-30">
                    O código pode ser encontrado no seu e-mail ou painel da liga
                </p>
            </div>
        </div>
    );
};

export default CheckInModal;
