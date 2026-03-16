import React, { useState } from 'react';
import { Shield, UserPlus, Settings, Trash2, ShieldAlert, ShieldCheck } from 'lucide-react';
import type { LeagueOrganizer, LeagueMember } from '../../../types';
import { Modal } from '../../../components/ui';

interface LeagueManagersTabProps {
    organizers: LeagueOrganizer[];
    members: LeagueMember[];
    isMaster: boolean; // only the league creator can manage roles
    onAddOrganizer: (userId: string, role: 'admin' | 'moderator') => void;
    onRemoveOrganizer: (userId: string) => void;
    onUpdateRole: (userId: string, role: 'admin' | 'moderator') => void;
}

const ROLE_LABELS = {
    master: { label: 'Proprietário', color: 'text-[#d4ac0d]', bg: 'bg-[rgba(212,172,13,0.1)]', border: 'border-[rgba(212,172,13,0.3)]', icon: ShieldAlert },
    admin: { label: 'Administrador', color: 'text-[#e74c3c]', bg: 'bg-[rgba(192,57,43,0.1)]', border: 'border-[rgba(192,57,43,0.3)]', icon: Shield },
    moderator: { label: 'Moderador', color: 'text-[#3498db]', bg: 'bg-[rgba(52,152,219,0.1)]', border: 'border-[rgba(52,152,219,0.3)]', icon: ShieldCheck },
};

export const LeagueManagersTab: React.FC<LeagueManagersTabProps> = ({ organizers, members, isMaster, onAddOrganizer, onRemoveOrganizer, onUpdateRole }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const activeMembers = members.filter(m => m.status === 'active');
    // Filter out users who are already organizers
    const eligibleMembers = activeMembers.filter(m => !organizers.some(o => o.userId === m.playerId));

    const filteredMembers = eligibleMembers.filter(m => m.playerName.toLowerCase().includes(searchTerm.toLowerCase()));

    const handlePromote = (userId: string) => {
        onAddOrganizer(userId, 'moderator'); // Default to moderator
        setIsAddModalOpen(false);
        setSearchTerm('');
    };

    return (
        <div className="flex flex-col gap-4 animate-fade-in">
            {isMaster && (
                <div className="flex justify-between items-center bg-[rgba(255,255,255,0.02)] p-4 rounded-2xl border border-[rgba(192,57,43,0.15)]">
                    <div>
                        <h3 className="text-white font-semibold">Equipe de Organização</h3>
                        <p className="text-sm text-[#7a5c5c]">Delegue permissões para ajudar a administrar a liga.</p>
                    </div>
                    <button onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white
                                       bg-gradient-to-r from-[#c0392b] to-[#e67e22] hover:opacity-90 transition-opacity">
                        <UserPlus size={16} /> Adicionar
                    </button>
                </div>
            )}

            <div className="grid gap-3">
                {organizers.map(org => {
                    const RoleIcon = ROLE_LABELS[org.role]?.icon || Shield;
                    const memberInfo = members.find(m => m.playerId === org.userId);
                    const name = memberInfo?.playerName || 'Usuário Desconhecido';

                    return (
                        <div key={org.userId} className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-4 rounded-2xl
                                                         bg-[linear-gradient(160deg,#130a0a,#1a0c0c)] border border-[rgba(255,255,255,0.05)]">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${ROLE_LABELS[org.role]?.bg} ${ROLE_LABELS[org.role]?.border}`}>
                                    <RoleIcon size={20} className={ROLE_LABELS[org.role]?.color} />
                                </div>
                                <div>
                                    <p className="font-semibold text-white">{name}</p>
                                    <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full border ${ROLE_LABELS[org.role]?.bg} ${ROLE_LABELS[org.role]?.border} ${ROLE_LABELS[org.role]?.color}`}>
                                        {ROLE_LABELS[org.role]?.label}
                                    </span>
                                </div>
                            </div>

                            {isMaster && org.role !== 'master' && (
                                <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[rgba(255,255,255,0.05)]">
                                    <button onClick={() => onUpdateRole(org.userId, org.role === 'admin' ? 'moderator' : 'admin')}
                                            className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5
                                                       bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[#a07070]
                                                       hover:bg-[rgba(255,255,255,0.08)] hover:text-white transition-all"
                                            title="Alternar Permissão">
                                        <Settings size={14} /> {org.role === 'admin' ? 'Rebaixar p/ Moderador' : 'Promover p/ Admin'}
                                    </button>
                                    <button onClick={() => { if (window.confirm('Remover organizador da equipe?')) onRemoveOrganizer(org.userId); }}
                                            className="p-1.5 rounded-lg text-[#7a5c5c] hover:bg-[rgba(192,57,43,0.15)] hover:text-[#e74c3c] transition-all"
                                            title="Remover Equipe">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Adicionar Organizador">
                <div className="p-6 flex flex-col gap-4">
                    <p className="text-sm text-[#a07070]">Selecione um membro ativo da liga para promover à equipe.</p>
                    <input type="text" placeholder="Buscar membro..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                           className="w-full bg-[rgba(0,0,0,0.3)] border border-[rgba(192,57,43,0.3)] rounded-xl px-4 py-2.5 text-white
                                      focus:outline-none focus:border-[#e74c3c] transition-colors" />
                    
                    <div className="max-h-[40vh] overflow-y-auto flex flex-col gap-2 pr-2">
                        {filteredMembers.length === 0 ? (
                            <p className="text-sm text-[#7a5c5c] text-center mt-4">Nenhum membro elegível encontrado.</p>
                        ) : (
                            filteredMembers.map(m => (
                                <div key={m.playerId} className="flex justify-between items-center p-3 rounded-xl border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)]">
                                    <span className="text-sm font-semibold text-white">{m.playerName}</span>
                                    <button onClick={() => handlePromote(m.playerId)}
                                            className="px-3 py-1 text-xs font-bold rounded-lg text-[#e74c3c] bg-[rgba(192,57,43,0.1)] hover:bg-[rgba(192,57,43,0.2)]">
                                        Promover
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
};
