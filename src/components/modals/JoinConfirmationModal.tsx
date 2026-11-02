import React from 'react';
import { Trophy, CheckCircle, AlertTriangle, ArrowRight, UserCheck } from 'lucide-react';
import { Modal, Button } from '../ui';

interface JoinConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading?: boolean;
    title: string;
    type: 'tournament' | 'league';
    eventName: string;
    organizerName?: string;
    isAlreadyParticipant?: boolean;
    extraInfo?: string;
}

export const JoinConfirmationModal: React.FC<JoinConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    isLoading = false,
    title,
    type,
    eventName,
    organizerName,
    isAlreadyParticipant = false,
    extraInfo
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="flex flex-col items-center text-center p-2">
                {/* Icon Header */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border ${
                    isAlreadyParticipant 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                        : 'bg-primary/10 border-primary/30 text-primary shadow-[0_0_20px_rgba(192,57,43,0.2)]'
                }`}>
                    {isAlreadyParticipant ? (
                        <UserCheck size={32} />
                    ) : (
                        <Trophy size={32} />
                    )}
                </div>

                {/* Event Name & Type */}
                <span className="text-[10px] uppercase font-black tracking-widest text-muted mb-1">
                    {type === 'tournament' ? 'Torneio Selecionado' : 'Liga Selecionada'}
                </span>
                <h3 className="text-xl font-bold text-white mb-1 leading-tight">
                    {eventName}
                </h3>

                {organizerName && (
                    <p className="text-xs text-secondary mb-4">
                        Organizado por <span className="text-white font-bold">{organizerName}</span>
                    </p>
                )}

                {/* Notice Card */}
                {isAlreadyParticipant ? (
                    <div className="w-full p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-left my-4 flex items-start gap-3">
                        <CheckCircle size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-bold text-emerald-300">Você já está inscrito!</p>
                            <p className="text-[11px] text-emerald-400/80 mt-0.5 leading-relaxed">
                                Sua participação já foi confirmada neste evento. Você pode acessar o painel a qualquer momento.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-left my-4 flex items-start gap-3">
                        <AlertTriangle size={20} className="text-[var(--fp-gold)] shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-bold text-white">Confirmação de Inscrição</p>
                            <p className="text-[11px] text-secondary mt-0.5 leading-relaxed">
                                {extraInfo || (type === 'tournament' ? 'Deseja realmente confirmar sua entrada neste torneio?' : 'Deseja realmente confirmar sua entrada nesta liga?')}
                            </p>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 w-full mt-4">
                    <Button variant="ghost" className="flex-1" onClick={onClose} disabled={isLoading}>
                        Fechar
                    </Button>
                    {!isAlreadyParticipant && (
                        <Button variant="glow" className="flex-1" onClick={onConfirm} loading={isLoading}>
                            <span>Confirmar Entrada</span> <ArrowRight size={16} className="ml-1" />
                        </Button>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default JoinConfirmationModal;
