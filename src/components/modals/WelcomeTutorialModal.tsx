import React, { useState, useEffect } from 'react';
import { Modal, Button } from '../ui';
import { Sparkles, Trophy, QrCode, Swords, ArrowRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ONBOARDING_SEEN_KEY = 'flashpoint_welcome_tutorial_v1';

export const WelcomeTutorialModal: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const seen = localStorage.getItem(ONBOARDING_SEEN_KEY);
        if (!seen) {
            const timer = setTimeout(() => setIsOpen(true), 800);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        localStorage.setItem(ONBOARDING_SEEN_KEY, 'seen');
        setIsOpen(false);
    };

    const steps = [
        {
            icon: <Sparkles size={32} className="text-[var(--fp-purple-hi)]" />,
            badge: "Bem-vindo ao FlashPoint",
            title: "Sua Plataforma Definitiva de TCG",
            description: "O FlashPoint foi desenhado para organizar campeonatos, participar de ligas e subir no ranking competitivo dos seus jogos de cartas favoritos com facilidade máxima."
        },
        {
            icon: <QrCode size={32} className="text-[#22d3ee]" />,
            badge: "Passo 1: Como Entrar em Eventos",
            title: "Entrada Fácil & Check-In",
            description: "Você pode entrar rapidamente em torneios ou ligas com o código de convite ou link recebido do organizador. No celular ou PC, o check-in é instantâneo e sem burocracia."
        },
        {
            icon: <Swords size={32} className="text-[#ef4444]" />,
            badge: "Passo 2: Durante o Torneio",
            title: "Mesas, Pareamentos e Tempo",
            description: "Acompanhe suas partidas ao vivo na página pública do torneio. Veja quem é seu oponente, número da mesa, cronômetro de rodada e submeta seus resultados sem filas."
        },
        {
            icon: <Trophy size={32} className="text-[#f59e0b]" />,
            badge: "Passo 3: Ligas e Ranking",
            title: "Panteão das Lendas & Ligas",
            description: "Participe de ligas sazonais, acumule pontos pelas suas vitórias e suba no ranking global. Cada evento sincroniza seus resultados em tempo real!"
        }
    ];

    const currentStep = steps[step];

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Guia Rápido FlashPoint">
            <div className="flex flex-col items-center text-center p-2">
                {/* Step indicator dots */}
                <div className="flex items-center gap-1.5 mb-6">
                    {steps.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setStep(i)}
                            className={`h-1.5 rounded-full transition-all ${
                                step === i 
                                    ? 'w-6 bg-[var(--fp-primary)]' 
                                    : 'w-2 bg-white/20 hover:bg-white/40'
                            }`}
                            aria-label={`Ir para passo ${i + 1}`}
                        />
                    ))}
                </div>

                {/* Icon card */}
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                    {currentStep.icon}
                </div>

                {/* Badge */}
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--fp-purple-hi)] bg-[var(--fp-purple)]/10 px-3 py-1 rounded-full border border-[var(--fp-purple)]/20 mb-2">
                    {currentStep.badge}
                </span>

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-2 leading-tight">
                    {currentStep.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-secondary leading-relaxed max-w-sm mb-6">
                    {currentStep.description}
                </p>

                {/* Buttons */}
                <div className="flex gap-3 w-full">
                    {step > 0 ? (
                        <Button
                            variant="ghost"
                            className="flex-1"
                            onClick={() => setStep(step - 1)}
                        >
                            Voltar
                        </Button>
                    ) : (
                        <Button
                            variant="ghost"
                            className="flex-1"
                            onClick={handleClose}
                        >
                            Pular
                        </Button>
                    )}

                    {step < steps.length - 1 ? (
                        <Button
                            variant="glow"
                            className="flex-1"
                            onClick={() => setStep(step + 1)}
                        >
                            <span>Próximo</span> <ArrowRight size={16} className="ml-1" />
                        </Button>
                    ) : (
                        <Button
                            variant="glow"
                            className="flex-1"
                            onClick={() => {
                                handleClose();
                                navigate('/discover');
                            }}
                        >
                            <Check size={16} className="mr-1" /> <span>Começar a Usar</span>
                        </Button>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default WelcomeTutorialModal;
