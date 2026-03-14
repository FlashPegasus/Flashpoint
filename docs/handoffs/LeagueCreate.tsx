import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Trophy } from 'lucide-react';
import PageShell from '../components/layout';
import { Button, Input } from '../components/ui';
import { useAuthStore } from '../features/auth/authStore';
import { useLeagueStore } from '../features/leagues/leagueStore';
import { TCG_PRESETS, type ScoringPreset } from '../utils/tcgPresets';
import toast from 'react-hot-toast';

/* ── helpers ── */
const inputCls = `w-full px-4 py-3 rounded-xl text-sm text-white
  bg-[rgba(255,255,255,0.04)] border border-[rgba(192,57,43,0.18)]
  focus:outline-none focus:border-[rgba(231,76,60,0.45)]
  focus:ring-2 focus:ring-[rgba(192,57,43,0.12)]
  placeholder:text-[#7a5c5c] transition-all`;

const labelCls = `block text-[10px] uppercase tracking-[1.2px] font-bold text-[#7a5c5c] mb-1.5`;

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="relative overflow-hidden rounded-2xl
                    bg-[linear-gradient(160deg,#130a0a,#1a0c0c)]
                    border border-[rgba(192,57,43,0.18)]">
        <div className="px-5 py-4 border-b border-[rgba(192,57,43,0.12)] flex items-center gap-2">
            <span className="text-sm font-semibold text-white">{title}</span>
        </div>
        <div className="p-5">{children}</div>
    </div>
);

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

    if (!user || user.isAnonymous) return (
        <PageShell>
            <div className="container py-20 text-center">
                <h2 className="text-xl font-bold text-white mb-4">Conta necessária para criar ligas</h2>
                <button onClick={() => navigate('/profile')}
                        className="px-6 py-3 rounded-xl font-bold text-sm text-white
                                   bg-gradient-to-r from-[#c0392b] to-[#e67e22] hover:opacity-90 transition-opacity">
                    Proteger Conta Local
                </button>
            </div>
        </PageShell>
    );

    const update = (field: string, value: unknown) => setFormData(prev => ({ ...prev, [field]: value }));

    const applyPreset = (preset: ScoringPreset) => {
        setFormData(prev => ({
            ...prev,
            pointsParticipation: preset.leaguePoints.participation,
            pointsWin:  preset.leaguePoints.win,
            pointsTop4: preset.leaguePoints.top4,
            pointsTop8: preset.leaguePoints.top8,
        }));
        toast.success(`Preset "${preset.name}" aplicado!`);
    };

    const handleCreate = async () => {
        if (!formData.name.trim()) { toast.error('Dê um nome à sua liga!'); return; }
        setIsSubmitting(true);
        try {
            const league = await createLeague({ ...formData, organizerId: user.id });
            toast.success(`Liga "${league.name}" criada!`);
            navigate(`/league/${league.id}`);
        } catch (err: any) {
            toast.error(err.message || 'Erro ao criar liga. Tente novamente.');
        } finally { setIsSubmitting(false); }
    };

    return (
        <PageShell>
            <div className="container py-8 pb-28 animate-fade-in max-w-2xl mx-auto">

                {/* ── HEADER ── */}
                <div className="relative overflow-hidden rounded-2xl mb-8 p-6
                                bg-[linear-gradient(160deg,#130a0a,#1a0c0c)]
                                border border-[rgba(212,172,13,0.22)]"
                     style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                    <div className="absolute top-0 left-[10%] right-[10%] h-px pointer-events-none"
                         style={{ background: 'linear-gradient(90deg,transparent,rgba(212,172,13,0.7),transparent)' }} />
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                                        bg-[rgba(212,172,13,0.12)] border border-[rgba(212,172,13,0.25)]
                                        shadow-[0_0_20px_rgba(212,172,13,0.15)]">
                            <Trophy size={22} className="text-[#d4ac0d]" />
                        </div>
                        <div>
                            <h1 className="font-[var(--fp-font-display,_'Cinzel_Decorative',serif)]
                                           text-2xl text-white leading-tight">
                                Nova Liga
                            </h1>
                            <p className="text-[#7a5c5c] text-sm mt-0.5">
                                Configure sua competição sazonal e convide jogadores.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-5">

                    {/* ── INFORMAÇÕES BÁSICAS ── */}
                    <Section title="Informações Básicas">
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className={labelCls}>Nome da Liga *</label>
                                <input className={inputCls}
                                    placeholder="Ex: Liga Commander Regional S1"
                                    value={formData.name}
                                    onChange={e => update('name', e.target.value)} />
                            </div>
                            <div>
                                <label className={labelCls}>Descrição</label>
                                <textarea
                                    rows={3}
                                    placeholder="Descreva as regras e objetivos da liga..."
                                    value={formData.description}
                                    onChange={e => update('description', e.target.value)}
                                    className={`${inputCls} resize-none`} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelCls}>Data de Início</label>
                                    <input type="date" className={inputCls}
                                        value={formData.startDate}
                                        onChange={e => update('startDate', e.target.value)} />
                                </div>
                                <div>
                                    <label className={labelCls}>Data de Fim (opcional)</label>
                                    <input type="date" className={inputCls}
                                        value={formData.endDate}
                                        onChange={e => update('endDate', e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Visibilidade</label>
                                <div className="flex gap-3">
                                    {(['public', 'private'] as const).map(v => (
                                        <button key={v} onClick={() => update('visibility', v)}
                                                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border
                                                            ${formData.visibility === v
                                                                ? 'bg-[rgba(192,57,43,0.15)] border-[rgba(192,57,43,0.45)] text-[#e74c3c]'
                                                                : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.07)] text-[#7a5c5c] hover:text-[#a07070]'
                                                            }`}>
                                            {v === 'public' ? '🌐 Pública' : '🔒 Privada'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* ── PRESETS TCG ── */}
                    <Section title="⚡ Presets de Formato">
                        <p className="text-[#7a5c5c] text-xs mb-4">
                            Escolha um formato para configurar automaticamente os pontos da liga.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {TCG_PRESETS.map(preset => (
                                <button key={preset.id} onClick={() => applyPreset(preset)}
                                        className="p-4 rounded-2xl text-left transition-all active:scale-95 group
                                                   bg-[rgba(255,255,255,0.02)] border border-[rgba(192,57,43,0.12)]
                                                   hover:border-[rgba(192,57,43,0.4)] hover:bg-[rgba(192,57,43,0.06)]">
                                    <div className="text-2xl mb-2">{preset.icon}</div>
                                    <h3 className="font-bold text-sm text-white mb-1
                                                   group-hover:text-[#e74c3c] transition-colors">
                                        {preset.name}
                                    </h3>
                                    <p className="text-[10px] text-[#7a5c5c] leading-tight">{preset.description}</p>
                                </button>
                            ))}
                        </div>
                    </Section>

                    {/* ── PONTUAÇÃO ── */}
                    <Section title="🏆 Sistema de Pontuação">
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            {[
                                { label: 'Pontos por Participação', field: 'pointsParticipation', value: formData.pointsParticipation },
                                { label: 'Bônus por Vitória (1º)',  field: 'pointsWin',           value: formData.pointsWin },
                                { label: 'Bônus Top 4',            field: 'pointsTop4',          value: formData.pointsTop4 },
                                { label: 'Bônus Top 8',            field: 'pointsTop8',          value: formData.pointsTop8 },
                            ].map(f => (
                                <div key={f.field}>
                                    <label className={labelCls}>{f.label}</label>
                                    <input type="number" className={inputCls}
                                        value={f.value}
                                        onChange={e => update(f.field, +e.target.value)} />
                                </div>
                            ))}
                        </div>
                        <div>
                            <label className={labelCls}>💎 Melhores X Torneios (opcional)</label>
                            <input type="number" className={inputCls}
                                placeholder="Ex: 8 (conta apenas os 8 melhores resultados)"
                                value={formData.bestXof ?? ''}
                                onChange={e => update('bestXof', e.target.value ? +e.target.value : undefined)} />
                        </div>
                    </Section>

                    {/* ── SUBMIT ── */}
                    <div className="flex justify-end pt-2">
                        <button onClick={handleCreate} disabled={isSubmitting}
                                className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm text-white
                                           bg-gradient-to-r from-[#c0392b] via-[#e67e22] to-[#d4ac0d]
                                           hover:opacity-90 active:scale-[0.98] transition-all
                                           disabled:opacity-60 disabled:cursor-not-allowed
                                           shadow-[0_0_24px_rgba(192,57,43,0.35)]">
                            <Save size={16} />
                            {isSubmitting ? 'Criando...' : 'Criar Liga'}
                        </button>
                    </div>

                    {/* Espaço Publicitário */}
                    <div className="mt-4 mx-auto w-full">
                        <div className="rounded-2xl border border-dashed border-[rgba(255,255,255,0.06)]
                                        bg-[rgba(255,255,255,0.02)] py-6 text-center">
                            <p className="text-[10px] font-bold uppercase tracking-[3px] text-[rgba(122,92,92,0.4)]">
                                Espaço Publicitário
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </PageShell>
    );
};

export default LeagueCreate;
