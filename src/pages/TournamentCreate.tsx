import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Save, HelpCircle } from 'lucide-react';
import PageShell from '../components/layout';
import { Button, Card, Input, Select, DynamicIcon } from '../components/ui';
import { useTournamentStore } from '../features/tournaments/tournamentStore';
import { useTemplateStore } from '../features/tournaments/templateStore';
import { useLeagueStore } from '../features/leagues/leagueStore';
import { useAuthStore } from '../features/auth/authStore';
import { TCG_PRESETS, type ScoringPreset } from '../utils/tcgPresets';
import type { TournamentFormat, TournamentTemplate } from '../types';
import toast from 'react-hot-toast';

const TournamentCreate: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { createTournament } = useTournamentStore();
    const { myLeagues, loadMyLeagues, linkTournament } = useLeagueStore();
    const { templates, loadTemplates, saveTemplate } = useTemplateStore();
    const [step, setStep] = useState(1);
    const [saveAsTemplate, setSaveAsTemplate] = useState(false);
    const [templateName, setTemplateName] = useState('');

    React.useEffect(() => {
        if (user?.id && !user.isAnonymous) {
            loadMyLeagues(user.id);
            loadTemplates(user.id);
        }
    }, [user, loadMyLeagues, loadTemplates]);

    const [formData, setFormData] = useState({
        name: '',
        date: new Date().toISOString().split('T')[0],
        location: 'Local Game Store',
        description: '',
        format: 'multiplayer' as TournamentFormat,
        pairingMode: 'standard' as 'standard' | 'fair',
        leagueId: '',
        minPlayersPerTable: 3,
        maxPlayersPerTable: 4,
        scoring: {
            type: 'positional' as const,
            positions: {
                4: { 1: 4, 2: 2, 3: 1, 4: 0 } as Record<number, number>,
                3: { 1: 3, 2: 1, 3: 0 } as Record<number, number>
            }
        },
        hasTimer: true,
        allowByes: true,
        allowLateRegistration: true,
        allowWithdrawal: true,
        requiresCheckIn: false,
        epicFinalEnabled: false,
        maxRounds: undefined as number | undefined,
        pointsLimit: undefined as number | undefined
    });

    if (user?.isAnonymous) {
        return (
            <PageShell>
                <div className="container section text-center pt-20">
                    <h2 className="text-2xl font-bold mb-4">Contas de Convidado não podem criar torneios</h2>
                    <p className="text-secondary mb-8">Para organizar eventos e evitar span, você precisa vincular um e-mail ou Google na sua conta.</p>
                    <Button onClick={() => navigate('/profile')} variant="glow">Proteger Conta Local</Button>
                </div>
            </PageShell>
        );
    }

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const handleCreate = async () => {
        const payload = { ...formData, organizerId: user?.id || 'anonymous' };
        const { leagueId, ...tournamentData } = payload as any;

        if (saveAsTemplate && templateName.trim() && user?.id) {
            await saveTemplate(user.id, {
                ...tournamentData,
                name: templateName.trim()
            });
        }

        const tournament = await createTournament(tournamentData);
        if (tournament) {
            if (formData.leagueId && user?.id) {
                try {
                    await linkTournament(formData.leagueId, tournament.id, user.id);
                } catch (err: any) {
                    console.error('Failed to link tournament to league:', err);
                }
            }
            navigate(`/tournament/${tournament.id}`);
        }
    };

    const applyPreset = (preset: ScoringPreset) => {
        setFormData(prev => ({
            ...prev,
            format: preset.id === 'modern' ? '1v1' : (preset.id === 'battle_royale' ? 'battle_royale' : 'multiplayer'),
            scoring: {
                ...prev.scoring,
                positions: preset.tournamentScoring.positions
            },
            minPlayersPerTable: preset.id === 'commander' || preset.id === 'battle_royale' ? 3 : prev.minPlayersPerTable,
            maxPlayersPerTable: preset.id === 'commander' || preset.id === 'battle_royale' ? 4 : prev.maxPlayersPerTable,
            allowLateRegistration: preset.id === 'battle_royale' ? false : prev.allowLateRegistration,
            epicFinalEnabled: preset.id === 'battle_royale'
        }));
        toast.success(`Preset "${preset.name}" aplicado!`);
    };

    const applyTemplate = (template: TournamentTemplate) => {
        setFormData(prev => ({
            ...prev,
            format: template.format,
            pairingMode: template.pairingMode,
            minPlayersPerTable: template.minPlayersPerTable,
            maxPlayersPerTable: template.maxPlayersPerTable,
            exactTableSize: template.exactTableSize,
            hasTimer: template.hasTimer,
            defaultRoundTimer: template.defaultRoundTimer,
            allowByes: template.allowByes,
            scoring: template.scoring as any,
            allowLateRegistration: template.allowLateRegistration,
            requiresCheckIn: template.requiresCheckIn,
            avoidRepeatedMatchups: template.avoidRepeatedMatchups,
            epicFinalEnabled: template.epicFinalEnabled ?? false,
            epicFinalMaxPlayers: template.epicFinalMaxPlayers,
            maxRounds: template.maxRounds,
            pointsLimit: template.pointsLimit,
        }));
        toast.success(`Modelo "${template.name}" aplicado!`);
    };

    return (
        <PageShell>
            <div className="container section max-w-3xl">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl mb-4">Criar Torneio</h1>
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3].map(i => (
                            <div
                                key={i}
                                className={`w-12 h-1.5 rounded-full transition-all ${step >= i ? 'bg-purple' : 'bg-glass'}`}
                                style={{ backgroundColor: step >= i ? 'var(--color-purple)' : 'var(--bg-glass)' }}
                            />
                        ))}
                    </div>
                </div>

                {step === 1 && (
                    <Card title="Informações Básicas" className="animate-fade-in">
                        <div className="flex flex-col gap-6">
                            <Input
                                label="Nome do Torneio"
                                placeholder="ex: Commander Night #42"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Data"
                                    type="date"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                />
                                <Input
                                    label="Local"
                                    placeholder="Loja ou Online"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>

                            {myLeagues.length > 0 && (
                                <Select
                                    label="Vincular a uma Liga (Opcional)"
                                    options={[
                                        { value: '', label: 'Não vincular (Torneio Único)' },
                                        ...myLeagues.map(l => ({ value: l.id, label: l.name }))
                                    ]}
                                    value={formData.leagueId}
                                    onChange={e => setFormData({ ...formData, leagueId: e.target.value })}
                                />
                            )}

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-primary ml-1 uppercase tracking-wider text-[10px]">Descrição</label>
                                <textarea
                                    className="w-full glass p-3 focus:outline-none min-h-[100px] border-white/5 bg-white/5 text-primary placeholder:text-muted"
                                    placeholder="Compartilhe detalhes sobre taxas de inscrição, prêmios e regras..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button onClick={nextStep} disabled={!formData.name}>
                                    Próximo <ChevronRight size={18} className="ml-1" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}

                {step === 2 && (
                    <div className="flex flex-col gap-6 animate-fade-in">
                        {templates.length > 0 && (
                            <Card title="Meus Modelos Salvos">
                                <p className="text-secondary text-[10px] mb-4 uppercase tracking-tighter">Seus presets personalizados</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {templates.map(pt => (
                                        <button
                                            key={pt.id}
                                            type="button"
                                            onClick={() => applyTemplate(pt)}
                                            className="glass p-3 rounded-2xl border border-white/5 hover:border-purple/40 text-left transition-all active:scale-95 group"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="mb-1 text-purple">
                                                    <DynamicIcon icon="zap" size={24} />
                                                </div>
                                                <span className="px-1.5 py-0.5 rounded-md bg-white/5 text-[8px] font-black uppercase text-secondary">Modelo</span>
                                            </div>
                                            <h3 className="font-bold text-[12px] group-hover:text-purple transition-colors line-clamp-1">{pt.name}</h3>
                                            <p className="text-[10px] text-muted mt-1 uppercase">{pt.format} • {pt.minPlayersPerTable}-{pt.maxPlayersPerTable}p</p>
                                        </button>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Presets Quick-Select */}
                        <Card title="⚡ Presets de Base">
                            <p className="text-secondary text-[10px] mb-4 uppercase tracking-tighter">Configuração rápida baseada no TCG</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {TCG_PRESETS.map(preset => (
                                    <button
                                        key={preset.id}
                                        type="button"
                                        onClick={() => applyPreset(preset)}
                                        className="glass p-3 rounded-2xl border border-white/5 hover:border-purple/40 text-left transition-all active:scale-95 group"
                                    >
                                            <div className="flex justify-between items-start">
                                                <div className="mb-1 text-purple">
                                                    <DynamicIcon icon={preset.icon} size={24} />
                                                </div>
                                                {preset.id === 'battle_royale' && (
                                                    <span className="px-1.5 py-0.5 rounded-md bg-[var(--fp-purple)] text-[8px] font-black text-white uppercase animate-pulse shadow-[0_0_10px_rgba(139,92,246,0.5)]">
                                                        Novo
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="font-bold text-[11px] group-hover:text-purple transition-colors">{preset.name}</h3>
                                        </button>
                                ))}
                            </div>
                        </Card>

                        <Card title="Formato & Pontuação">
                            <div className="flex flex-col gap-6">
                                <Select
                                    label="Formato da Partida"
                                    options={[
                                        { value: '1v1', label: '1v1 (Padrão)' },
                                        { value: 'multiplayer', label: 'Multijogador (Commander/Casual)' },
                                        { value: 'battle_royale', label: 'Battle Royale (Eliminação)' }
                                    ]}
                                    value={formData.format}
                                    onChange={e => setFormData({ ...formData, format: e.target.value as TournamentFormat })}
                                />

                                {formData.format === '1v1' && (
                                    <Select
                                        label="Modo de Pareamento"
                                        options={[
                                            { value: 'standard', label: 'Suíço Padrão (Foco em Pontuação)' },
                                            { value: 'fair', label: 'Suíço Justo (Foco em Não Repetir Mesas)' }
                                        ]}
                                        value={formData.pairingMode}
                                        onChange={e => setFormData({ ...formData, pairingMode: e.target.value as 'standard' | 'fair' })}
                                    />
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <Select
                                        label="Tempo Limitado (Rodadas)?"
                                        options={[
                                            { value: 'true', label: 'Sim (Com Cronômetro)' },
                                            { value: 'false', label: 'Não (Tempo Livre)' }
                                        ]}
                                        value={formData.hasTimer.toString()}
                                        onChange={e => setFormData({ ...formData, hasTimer: e.target.value === 'true' })}
                                    />
                                    <Select
                                        label="Exigir Check-in Presencial?"
                                        options={[
                                            { value: 'false', label: 'Não (Inscrição Direta)' },
                                            { value: 'true', label: 'Sim (Evitar Ausências)' }
                                        ]}
                                        value={formData.requiresCheckIn.toString()}
                                        onChange={e => setFormData({ ...formData, requiresCheckIn: e.target.value === 'true' })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Select
                                        label="Inscrição Tardia?"
                                        options={[
                                            { value: 'true', label: 'Permitida' },
                                            { value: 'false', label: 'Proibida (Padrão BR)' }
                                        ]}
                                        disabled={formData.format === 'battle_royale'}
                                        value={formData.format === 'battle_royale' ? 'false' : formData.allowLateRegistration.toString()}
                                        onChange={e => setFormData({ ...formData, allowLateRegistration: e.target.value === 'true' })}
                                    />
                                    {formData.format === 'battle_royale' && (
                                        <Select
                                            label="Final Épica (Top 5)?"
                                            options={[
                                                { value: 'true', label: 'Sim (Mesa Final Única)' },
                                                { value: 'false', label: 'Não (Normal)' }
                                            ]}
                                            value={formData.epicFinalEnabled.toString()}
                                            onChange={e => setFormData({ ...formData, epicFinalEnabled: e.target.value === 'true' })}
                                        />
                                    )}
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    {(formData.format === 'multiplayer' || formData.format === 'battle_royale') && (
                                        <Select
                                            label="Permitir Byes (Vitória Automática)?"
                                            options={[
                                                { value: 'true', label: 'Sim (Recomendado)' },
                                                { value: 'false', label: 'Não (Redistribuir Mesas)' }
                                            ]}
                                            value={formData.allowByes.toString()}
                                            onChange={e => setFormData({ ...formData, allowByes: e.target.value === 'true' })}
                                        />
                                    )}
                                </div>

                                {/* ── Tournament Limits (Progress) ── */}
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <Input
                                        label="Limite de Rodadas (opcional)"
                                        type="number"
                                        placeholder="Ex: 5"
                                        value={formData.maxRounds ?? ''}
                                        onChange={e => setFormData({ ...formData, maxRounds: e.target.value ? parseInt(e.target.value) : undefined })}
                                    />
                                    <Input
                                        label="Pontuação Alvo (opcional)"
                                        type="number"
                                        placeholder="Ex: 20"
                                        value={formData.pointsLimit ?? ''}
                                        onChange={e => setFormData({ ...formData, pointsLimit: e.target.value ? parseInt(e.target.value) : undefined })}
                                    />
                                </div>
                                <p className="text-[10px] text-[var(--fp-muted)] -mt-2 ml-1">
                                    Define quando o torneio deve terminar. Deixe em branco para rodadas ilimitadas.
                                </p>

                                {(formData.format === 'multiplayer' || formData.format === 'battle_royale') && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-bold text-primary ml-1 uppercase tracking-wider">Mín. Jogadores por Mesa</label>
                                            <div className="flex items-center justify-between glass p-2 rounded-xl border border-white/5">
                                                <button type="button"
                                                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center font-bold text-lg transition-colors"
                                                    onClick={() => setFormData({ ...formData, minPlayersPerTable: Math.max(2, formData.minPlayersPerTable - 1) })}
                                                >-</button>
                                                <span className="font-outfit text-xl font-bold">{formData.minPlayersPerTable}</span>
                                                <button type="button"
                                                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center font-bold text-lg transition-colors"
                                                    onClick={() => setFormData({ ...formData, minPlayersPerTable: Math.min(formData.maxPlayersPerTable, formData.minPlayersPerTable + 1) })}
                                                >+</button>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-bold text-primary ml-1 uppercase tracking-wider">Máx. Jogadores por Mesa</label>
                                            <div className="flex items-center justify-between glass p-2 rounded-xl border border-white/5">
                                                <button type="button"
                                                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center font-bold text-lg transition-colors"
                                                    onClick={() => setFormData({ ...formData, maxPlayersPerTable: Math.max(formData.minPlayersPerTable, formData.maxPlayersPerTable - 1) })}
                                                >-</button>
                                                <span className="font-outfit text-xl font-bold">{formData.maxPlayersPerTable}</span>
                                                <button type="button"
                                                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center font-bold text-lg transition-colors"
                                                    onClick={() => setFormData({ ...formData, maxPlayersPerTable: formData.maxPlayersPerTable + 1 })}
                                                >+</button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="p-4 glass rounded-xl border-purple/30" style={{ borderLeft: '4px solid var(--color-purple)' }}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <HelpCircle size={16} className="text-purple" style={{ color: 'var(--color-purple)' }} />
                                        <span className="font-bold text-sm uppercase">Pontuação Automática</span>
                                    </div>
                                    <p className="text-xs text-secondary mb-2">
                                        {formData.format === '1v1'
                                            ? 'Suíço Padrão: 3 pts vitória, 1 pt empate, 0 pt derrota.'
                                            : (formData.format === 'battle_royale' 
                                                ? 'Battle Royale: 5 pts para o vencedor, 2 pts para sobreviventes.'
                                                : 'Posicional: Os pontos são dados de acordo com a colocação final na mesa.')}
                                    </p>
                                    {(formData.format === 'multiplayer' || formData.format === 'battle_royale') && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {[1, 2, 3, 4].map(pos => (
                                                <div key={pos} className="px-3 py-1 glass rounded-lg text-[10px] font-bold">
                                                    {pos}º: {formData.scoring.positions?.[4]?.[pos] || 0} pts
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between">
                                    <Button variant="ghost" type="button" onClick={prevStep}>
                                        <ChevronLeft size={18} className="mr-1" /> Voltar
                                    </Button>
                                    <Button type="button" onClick={nextStep}>
                                        Próximo <ChevronRight size={18} className="ml-1" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {step === 3 && (
                    <Card title="Revisar & Criar" className="animate-fade-in">
                        <div className="flex flex-col gap-6">
                            <div className="glass p-6 rounded-2xl">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-2xl">{formData.name}</h3>
                                        <p className="text-secondary">{formData.date} ⬢ {formData.location}</p>
                                    </div>
                                    <div className="px-3 py-1 glass rounded-full text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-purple)' }}>
                                        {formData.format}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-muted">Tamanho da Mesa</span>
                                        <span>{formData.format === '1v1' ? '2 jogadores' : `${formData.minPlayersPerTable}-${formData.maxPlayersPerTable} jogadores`}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-muted">Inscrição Tardia</span>
                                        <span>{formData.allowLateRegistration ? 'Permitida' : 'Proibida'}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-muted">Check-in</span>
                                        <span>{formData.requiresCheckIn ? 'Obrigatório' : 'Opcional'}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-muted">Final Épica</span>
                                        <span>{formData.epicFinalEnabled ? 'Ativada' : 'Desativada'}</span>
                                    </div>
                                </div>

                                <div className="p-4 glass rounded-xl border-purple/30 bg-purple/5" style={{ borderLeft: '4px solid var(--color-purple)' }}>
                                    <p className="text-xs text-secondary">
                                        <strong>Nota:</strong> Seu torneio será criado como <strong>Rascunho</strong>. Você poderá revisá-lo e publicá-lo no painel de controle para que ele apareça na busca pública.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3 p-4 glass rounded-xl border border-white/5 mt-2">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative flex items-center justify-center">
                                            <input 
                                                type="checkbox" 
                                                className="peer sr-only" 
                                                checked={saveAsTemplate}
                                                onChange={e => setSaveAsTemplate(e.target.checked)}
                                            />
                                            <div className="w-5 h-5 rounded border border-white/20 peer-checked:bg-purple peer-checked:border-purple transition-colors flex items-center justify-center group-hover:border-purple/50">
                                            </div>
                                        </div>
                                        <span className="text-sm font-bold text-primary">Salvar configuração como um Novo Modelo</span>
                                    </label>
                                    
                                    {saveAsTemplate && (
                                        <div className="pl-8 animate-fade-in">
                                            <Input 
                                                placeholder="Ex: Mesão Animado 4 Players" 
                                                value={templateName}
                                                onChange={e => setTemplateName(e.target.value)}
                                            />
                                            <p className="text-[10px] text-muted mt-1">Isso criará um atalho rápido na aba "Meus Modelos Salvos" para seus próximos torneios.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between mt-4">
                                    <Button variant="ghost" type="button" onClick={prevStep}>
                                        <ChevronLeft size={18} className="mr-1" /> Voltar
                                    </Button>
                                    <Button type="button" onClick={handleCreate} variant="glow" className="px-10">
                                        <Save size={18} className="mr-2" /> Criar Torneio
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </PageShell>
    );
};

export default TournamentCreate;
