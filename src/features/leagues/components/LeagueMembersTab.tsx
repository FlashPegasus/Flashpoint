import React from 'react';
import { Button, GlowAvatar } from '../../../components/ui';
import type { LeagueMember } from '../../../types';

interface LeagueMembersTabProps {
    members: LeagueMember[];
    isOrganizer: boolean;
    isLoading?: boolean;
    userId?: string;
    onUpdateMember: (playerId: string, status: 'active' | 'banned') => Promise<void>;
}

export const LeagueMembersTab: React.FC<LeagueMembersTabProps> = ({
    members,
    isOrganizer,
    isLoading = false,
    userId,
    onUpdateMember
}) => {
    return (
        <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold mb-2">Comunidade da Liga</h3>
            
            {isLoading && members.length === 0 && (
                <p className="text-secondary text-center py-10 animate-pulse">Buscando membros...</p>
            )}

            {!isLoading && members.length === 0 && (
                <div className="text-center py-12 px-6 rounded-3xl border border-dashed border-white/5 bg-white/[0.02]">
                    <p className="text-secondary text-sm mb-2">Nenhum membro encontrado.</p>
                    <p className="text-[10px] text-muted">Aguardando novos jogadores entrarem pelo código.</p>
                </div>
            )}

            {!isLoading && members.length > 0 && members.map(m => (
                <div key={m.playerId} className="glass p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                    <GlowAvatar 
                        seed={m.playerId || m.playerName} 
                        size={40} 
                        glowColor={m.activeGlow}
                        chosenGuildId={m.chosenGuildId}
                        level={m.level}
                        className="border border-white/5"
                    />
                        <div>
                            <p className="font-bold flex items-center gap-2">
                                {m.playerName}
                                {m.status === 'banned' && <span className="bg-red-500/20 text-red-500 text-[10px] px-2 py-0.5 rounded-full border border-red-500/30">BANIDO</span>}
                                {m.status === 'pending' && <span className="bg-amber-500/20 text-amber-500 text-[10px] px-2 py-0.5 rounded-full border border-amber-500/30">PENDENTE</span>}
                            </p>
                            <p className="text-xs text-muted">Entrou em: {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString('pt-BR') : 'Data desconhecida'}</p>
                        </div>
                    </div>
                    {isOrganizer && m.playerId !== userId && (
                        <div className="flex gap-2">
                             <Button
                                variant={m.status === 'banned' ? 'glow' : 'danger'}
                                className="px-3 py-1 h-auto text-[10px]"
                                onClick={() => onUpdateMember(m.playerId, m.status === 'banned' ? 'active' : 'banned')}
                            >
                                {m.status === 'banned' ? 'Desbanir' : 'Banir'}
                            </Button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};
