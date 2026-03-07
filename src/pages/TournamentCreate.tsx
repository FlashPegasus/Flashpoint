import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Save, HelpCircle } from 'lucide-react';
import PageShell from '../components/layout/PageShell';
import { Button, Card, Input, Select } from '../components/ui';
import { useTournamentStore } from '../stores/tournamentStore';
import { useAuthStore } from '../stores/authStore';
import type { TournamentFormat } from '../types';

const TournamentCreate: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { createTournament } = useTournamentStore();
    const [step, setStep] = useState(1);

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

    const [formData, setFormData] = useState({
        name: '',
        date: new Date().toISOString().split('T')[0],
        location: 'Local Game Store',
        description: '',
        format: 'multiplayer' as TournamentFormat,
        pairingMode: 'standard' as 'standard' | 'fair',
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
        allowWithdrawal: true
    });

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const handleCreate = async () => {
        const tournament = await createTournament({
            ...formData,
            organizerId: user?.id || 'anonymous'
        });
        if (tournament) {
            navigate(`/tournament/${tournament.id}`);
        }
    };

    return (
        <PageShell>
            <div className="container section max-w-3xl">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl mb-4">Create Tournament</h1>
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
                    <Card title="Basic Information" className="animate-fade-in">
                        <div className="flex flex-col gap-6">
                            <Input
                                label="Tournament Name"
                                placeholder="e.g. Commander Night #42"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Date"
                                    type="date"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                />
                                <Input
                                    label="Location"
                                    placeholder="Store or Online"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-primary ml-1 uppercase tracking-wider text-[10px]">Description</label>
                                <textarea
                                    className="w-full glass p-3 focus:outline-none min-h-[100px] border-white/5 bg-white/5 text-primary placeholder:text-muted"
                                    placeholder="Share details about entry fees, prizes, and rules..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <Button onClick={nextStep} className="self-end" disabled={!formData.name}>
                                Next <ChevronRight size={18} className="ml-1" />
                            </Button>
                        </div>
                    </Card>
                )}

                {step === 2 && (
                    <Card title="Format & Scoring" className="animate-fade-in">
                        <div className="flex flex-col gap-6">
                            <Select
                                label="Match Format"
                                options={[
                                    { value: '1v1', label: '1v1 (Standard)' },
                                    { value: 'multiplayer', label: 'Multiplayer (Commander/Casual)' }
                                ]}
                                value={formData.format}
                                onChange={e => setFormData({ ...formData, format: e.target.value as TournamentFormat })}
                            />

                            {formData.format === '1v1' && (
                                <Select
                                    label="Pairing Mode"
                                    options={[
                                        { value: 'standard', label: 'Standard Swiss (Minimize Score Gap)' },
                                        { value: 'fair', label: 'Fair Swiss (Minimize Repetitions)' }
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
                                {formData.format === 'multiplayer' && (
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

                            {formData.format === 'multiplayer' && (
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
                                    <span className="font-bold text-sm uppercase">Automatic Scoring</span>
                                </div>
                                <p className="text-xs text-secondary mb-2">
                                    {formData.format === '1v1'
                                        ? 'Standard Swiss: 3 points per win, 1 per draw, 0 per loss.'
                                        : 'Position-based: Points are awarded based on table finishing order.'}
                                </p>
                                {formData.format === 'multiplayer' && (
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
                                <Button variant="ghost" onClick={prevStep}>
                                    <ChevronLeft size={18} className="mr-1" /> Back
                                </Button>
                                <Button onClick={nextStep}>
                                    Next <ChevronRight size={18} className="ml-1" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}

                {step === 3 && (
                    <Card title="Review & Launch" className="animate-fade-in">
                        <div className="flex flex-col gap-6">
                            <div className="glass p-6 rounded-2xl">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-2xl">{formData.name}</h3>
                                        <p className="text-secondary">{formData.date} • {formData.location}</p>
                                    </div>
                                    <div className="px-3 py-1 glass rounded-full text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-purple)' }}>
                                        {formData.format}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-muted">Table Size</span>
                                        <span>{formData.format === '1v1' ? '2 players' : `${formData.minPlayersPerTable}-${formData.maxPlayersPerTable} players`}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-muted">Late Registration</span>
                                        <span>{formData.allowLateRegistration ? 'Enabled' : 'Disabled'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between">
                                <Button variant="ghost" onClick={prevStep}>
                                    <ChevronLeft size={18} className="mr-1" /> Back
                                </Button>
                                <Button onClick={handleCreate} variant="glow" className="px-10">
                                    <Save size={18} className="mr-2" /> Launch Tournament
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </PageShell>
    );
};

export default TournamentCreate;
