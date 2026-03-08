import React from 'react';
import { Trophy, RefreshCw, Trash2 } from 'lucide-react';
import { Button, Card } from '../../../components/ui';
import type { League } from '../../../types';

interface LeagueDetailsTabProps {
    activeLeague: League;
    isOrganizer: boolean;
    editMode: boolean;
    editData: any;
    setEditMode: (mode: boolean) => void;
    setEditData: (data: any) => void;
    handleSaveEdit: () => Promise<void>;
    handleOpenAudit: () => Promise<void>;
    handleDeleteLeague: () => Promise<void>;
    setIsSeasonModalOpen: (open: boolean) => void;
}

export const LeagueDetailsTab: React.FC<LeagueDetailsTabProps> = ({
    activeLeague,
    isOrganizer,
    editMode,
    editData,
    setEditMode,
    setEditData,
    handleSaveEdit,
    handleOpenAudit,
    handleDeleteLeague,
    setIsSeasonModalOpen
}) => {
    return (
        <Card title="Configurações da Liga">
            {isOrganizer && !editMode && (
                <div className="flex justify-end mb-4">
                    <Button size="sm" variant="secondary" onClick={() => {
                        setEditData({
                            name: activeLeague.name,
                            description: activeLeague.description,
                            primaryColor: activeLeague.primaryColor || '#9333ea',
                            pointsParticipation: activeLeague.pointsParticipation,
                            pointsWin: activeLeague.pointsWin,
                            pointsTop4: activeLeague.pointsTop4,
                            pointsTop8: activeLeague.pointsTop8,
                            bestXof: activeLeague.bestXof || '',
                            visibility: activeLeague.visibility,
                        });
                        setEditMode(true);
                    }}>✏️ Editar Informações</Button>
                </div>
            )}

            {editMode ? (
                <div className="flex flex-col gap-4 animate-fade-in">
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="text-xs text-secondary mt-2">Nome da Liga</label>
                            <input className="w-full glass p-3 border-white/5 text-primary"
                                value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                        </div>
                        <div className="w-24">
                            <label className="text-xs text-secondary mt-2">Cor Primária</label>
                            <input type="color" className="w-full h-12 glass p-1 border-white/5 cursor-pointer bg-transparent"
                                value={editData.primaryColor} onChange={e => setEditData({ ...editData, primaryColor: e.target.value })} />
                        </div>
                    </div>

                    <label className="text-xs text-secondary mt-2">Descrição</label>
                    <textarea className="w-full glass p-3 border-white/5 text-primary"
                        value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })} />

                    <label className="text-xs text-secondary mt-2">Visibilidade</label>
                    <select className="w-full glass p-3 border-white/5 text-primary bg-bg-dark"
                        value={editData.visibility} onChange={e => setEditData({ ...editData, visibility: e.target.value })}>
                        <option value="public">🌍 Pública (Aparece na lista)</option>
                        <option value="private">🔒 Privada (Apenas por código)</option>
                    </select>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                            <label className="text-xs text-secondary mb-1 block">Pts Participação</label>
                            <input type="number" className="w-full glass p-2 border-white/5 text-primary"
                                value={editData.pointsParticipation} onChange={e => setEditData({ ...editData, pointsParticipation: +e.target.value })} />
                        </div>
                        <div>
                            <label className="text-xs text-secondary mb-1 block">Pts Vitória (1º)</label>
                            <input type="number" className="w-full glass p-2 border-white/5 text-primary"
                                value={editData.pointsWin} onChange={e => setEditData({ ...editData, pointsWin: +e.target.value })} />
                        </div>
                        <div>
                            <label className="text-xs text-secondary mb-1 block">Pts Top 4</label>
                            <input type="number" className="w-full glass p-2 border-white/5 text-primary"
                                value={editData.pointsTop4} onChange={e => setEditData({ ...editData, pointsTop4: +e.target.value })} />
                        </div>
                        <div>
                            <label className="text-xs text-secondary mb-1 block">Pts Top 8</label>
                            <input type="number" className="w-full glass p-2 border-white/5 text-primary"
                                value={editData.pointsTop8} onChange={e => setEditData({ ...editData, pointsTop8: +e.target.value })} />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs text-secondary mb-1 block">Melhores X Torneios (Deixe vazio para somar tudo)</label>
                            <input type="number" className="w-full glass p-2 border-white/5 text-primary" placeholder="Ex: 8"
                                value={editData.bestXof} onChange={e => setEditData({ ...editData, bestXof: e.target.value ? +e.target.value : undefined })} />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-white/5">
                        <Button variant="ghost" onClick={() => setEditMode(false)}>Cancelar</Button>
                        <Button variant="glow" onClick={handleSaveEdit}>Salvar Alterações</Button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                        {[
                            { label: 'Participação', value: activeLeague.pointsParticipation ?? 1 },
                            { label: 'Vitória (1º)', value: activeLeague.pointsWin ?? 5 },
                            { label: 'Top 4', value: activeLeague.pointsTop4 ?? 3 },
                            { label: 'Top 8', value: activeLeague.pointsTop8 ?? 2 },
                        ].map(item => (
                            <div key={item.label} className="glass rounded-xl p-4 border border-white/5">
                                <p className="text-muted text-xs mb-1">{item.label}</p>
                                <p className="text-2xl font-bold" style={{ color: 'var(--color-purple)' }}>{item.value} pts</p>
                            </div>
                        ))}
                    </div>
                    {activeLeague.bestXof && (
                        <div className="mt-4 p-4 glass rounded-2xl border border-purple/20">
                            <p className="font-bold text-sm">💎 Regra "Melhores X Torneios"</p>
                            <p className="text-muted text-xs mt-1">Apenas os <strong>{activeLeague.bestXof} melhores resultados</strong> de cada jogador contam para o ranking.</p>
                        </div>
                    )}
                    {isOrganizer && (
                        <div className="mt-8 pt-4 border-t border-purple/20 flex flex-col gap-4">
                            <Button variant="glow" className="w-full flex justify-center items-center" onClick={() => setIsSeasonModalOpen(true)}>
                                <Trophy size={16} className="mr-2" /> Encerrar Temporada
                            </Button>
                            <Button variant="secondary" className="w-full flex justify-center items-center" onClick={handleOpenAudit}>
                                <RefreshCw size={16} className="mr-2" /> Histórico de Ações (Audit)
                            </Button>
                            <Button variant="danger" className="w-full flex justify-center items-center opacity-70 hover:opacity-100 transition-opacity" onClick={handleDeleteLeague}>
                                <Trash2 size={16} className="mr-2" /> Excluir Liga
                            </Button>
                        </div>
                    )}
                </>
            )}
        </Card>
    );
};
