import React from 'react';
import { Button } from '../../../components/ui';
import type { LeagueMember } from '../../../types';

interface LeagueMembersTabProps {
    members: LeagueMember[];
    isOrganizer: boolean;
    userId?: string;
    onUpdateMember: (playerId: string, status: 'active' | 'banned') => Promise<void>;
}

export const LeagueMembersTab: React.FC<LeagueMembersTabProps> = ({
    members,
    isOrganizer,
    userId,
    onUpdateMember
}) => {
    return (
        <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold mb-2">Comunidade da Liga</h3>
            {members.length === 0 ? (
                <p className="text-secondary text-center py-10">Buscando membros...</p>
            ) : (
                members.map(m => (
                    <div key={m.playerId} className="glass p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple/20 flex items-center justify-center font-bold text-purple">
                                {m.playerName[0].toUpperCase()}
                            </div>
                            <div>
                                <p className="font-bold flex items-center gap-2">
                                    {m.playerName}
                                    {m.status === 'banned' && <span className="bg-red-500/20 text-red-500 text-[10px] px-2 py-0.5 rounded-full border border-red-500/30">BANIDO</span>}
                                </p>
                                <p className="text-xs text-muted">Entrou em: {new Date(m.joinedAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                        {isOrganizer && m.playerId !== userId && (
                            <Button
                                variant={m.status === 'banned' ? 'glow' : 'danger'}
                                className="px-3 py-1 h-auto text-[10px]"
                                onClick={() => onUpdateMember(m.playerId, m.status === 'banned' ? 'active' : 'banned')}
                            >
                                {m.status === 'banned' ? 'Desbanir' : 'Banir'}
                            </Button>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};
