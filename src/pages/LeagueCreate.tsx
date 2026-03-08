import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Trophy } from 'lucide-react';
import PageShell from '../components/layout';
import { Button, Card, Input } from '../components/ui';
import { useAuthStore } from '../features/auth/authStore';
import { useLeagueStore } from '../features/leagues/leagueStore';
import { TCG_PRESETS, type ScoringPreset } from '../utils/tcgPresets';
import toast from 'react-hot-toast';

const LeagueCreate: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { createLeague } = useLeagueStore();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        visibility: 'public' as 'public' | 'private',
        pointsParticipation: 1,
        pointsWin: 5,
        pointsTop4: 3,
        pointsTop8: 2,
        bestXof: undefined as number | undefined,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!user || user.isAnonymous) {
        return (
            <PageShell>
                <div className="container section text-center pt-20">
                    <h2 className="text-2xl font-bold mb-4">Conta necessária para criar ligas</h2>
                    <Button onClick={() => navigate('/profile')} variant="glow">Proteger Conta Local</Button>
                </div>
            </PageShell>
        );
    }

    const handleCreate = async () => {
        if (!formData.name.trim()) {
            toast.error('Dê um nome à sua liga!');
            return;
        }

        setIsSubmitting(true);

        try {
            const league = await createLeague({ ...formData, organizerId: user.id });
            toast.success(`Liga "${league.name}" criada! 🏆`);
            navigate(`/league/${league.id}`);
        } catch (err: any) {
            toast.error(err.message || 'Erro ao criar liga. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const update = (field: string, value: unknown) => setFormData(prev => ({ ...prev, [field]: value }));

    const applyPreset = (preset: ScoringPreset) => {
        setFormData(prev => ({
            ...prev,
            pointsParticipation: preset.leaguePoints.participation,
            pointsWin: preset.leaguePoints.win,
            pointsTop4: preset.leaguePoints.top4,
            pointsTop8: preset.leaguePoints.top8
        }));
        toast.success(`Preset "${preset.name}" aplicado!`);
    };

    return (
        <PageShell>
            <div className="container py-8 animate-fade-in max-w-2xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-outfit mb-1 flex items-center gap-3">
                        <Trophy size={32} style={{ color: 'var(--color-gold)' }} />
                        Nova Liga
                    </h1>
                    <p className="text-secondary">Configure sua competição sazonal e convide jogadores.</p>
                </div>

                <div className="flex flex-col gap-6">
                    {/* Basic Info */}
                    <Card title="Informações Básicas">
                        <div className="flex flex-col gap-4">
                            <Input
                                label="Nome da Liga *"
                                value={formData.name}
                                onChange={e => update('name', e.target.value)}
                                placeholder="Ex: Liga Commander Regional S1"
                            />
                            <div>
                                <label className="block text-sm font-medium mb-2 text-secondary">Descrição</label>
                                <textarea
                                    className="w-full glass rounded-xl px-4 py-3 text-sm outline-none border border-white/5 focus:border-purple/30 transition-colors resize-none"
                                    rows={3}
                                    placeholder="Descreva as regras e objetivos da liga..."
                                    value={formData.description}
                                    onChange={e => update('description', e.target.value)}
                                    style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--color-text)' }}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Data de Início"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={e => update('startDate', e.target.value)}
                                />
                                <Input
                                    label="Data de Fim (opcional)"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={e => update('endDate', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-secondary">Visibilidade</label>
                                <div className="flex gap-3">
                                    {(['public', 'private'] as const).map(v => (
                                        <button
                                            key={v}
                                            onClick={() => update('visibility', v)}
                                            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all glass border ${formData.visibility === v ? 'border-purple/50 text-purple' : 'border-white/5 text-secondary'}`}
                                            style={{ color: formData.visibility === v ? 'var(--color-purple)' : undefined }}
                                        >
                                            {v === 'public' ? '🌐 Pública' : '🔒 Privada'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Presets Quick-Select */}
                    <Card title="⚡ Presets de Formato (TCG)">
                        <p className="text-secondary text-xs mb-4">Escolha um formato para configurar automaticamente os pontos da liga.</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {TCG_PRESETS.map(preset => (
                                <button
                                    key={preset.id}
                                    onClick={() => applyPreset(preset)}
                                    className="glass p-4 rounded-2xl border border-white/5 hover:border-purple/40 text-left transition-all active:scale-95 group"
                                >
                                    <div className="text-2xl mb-2">{preset.icon}</div>
                                    <h3 className="font-bold text-sm mb-1 group-hover:text-purple transition-colors">{preset.name}</h3>
                                    <p className="text-[10px] text-muted leading-tight">{preset.description}</p>
                                </button>
                            ))}
                        </div>
                    </Card>

                    {/* Scoring */}
                    <Card title="🏆 Sistema de Pontuação">
                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Pontos por Participação" type="number" value={formData.pointsParticipation} onChange={e => update('pointsParticipation', +e.target.value)} />
                                <Input label="Bônus por Vitória (1º)" type="number" value={formData.pointsWin} onChange={e => update('pointsWin', +e.target.value)} />
                                <Input label="Bônus Top 4" type="number" value={formData.pointsTop4} onChange={e => update('pointsTop4', +e.target.value)} />
                                <Input label="Bônus Top 8" type="number" value={formData.pointsTop8} onChange={e => update('pointsTop8', +e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-secondary">💎 Melhores X Torneios (opcional)</label>
                                <Input
                                    placeholder="Ex: 8 (conta apenas os 8 melhores resultados)"
                                    type="number"
                                    value={formData.bestXof ?? ''}
                                    onChange={e => update('bestXof', e.target.value ? +e.target.value : undefined)}
                                />
                            </div>
                        </div>
                    </Card>

                    <div className="flex justify-end">
                        <Button onClick={handleCreate} variant="glow" disabled={isSubmitting} className="px-10">
                            <Save size={18} className="mr-2" />
                            {isSubmitting ? 'Criando...' : 'Criar Liga'}
                        </Button>
                    </div>
                </div>
            </div>
        </PageShell>
    );
};

export default LeagueCreate;
