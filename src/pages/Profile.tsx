import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../features/auth/authStore';
import { tournamentService } from '../features/tournaments/tournamentService';
import PageShell from '../components/layout';
import { Trophy, Star, Target, Calendar, LogOut, RefreshCw, Eye, EyeOff, ShieldCheck, Mail, ArrowRight, Crown, Medal, Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GuildPicker } from '../features/gamification/GuildPicker';
import { rewardService } from '../features/gamification/rewardService';
import { getUnlockedTier, buildGlowStyle, buildConicGradient } from '../features/gamification/mtgTiers';
import { ACHIEVEMENTS } from '../features/gamification/achievements';
import { GlowAvatar } from '../components/ui';
import AdsterraBanner from '../components/ui/AdsterraBanner';

/* ── helpers ── */

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number | string; color: string }> = ({ icon, label, value, color }) => (
    <div className="relative overflow-hidden rounded-2xl p-5
                    bg-[linear-gradient(160deg,#130a0a,#1a0c0c)]
                    border border-[rgba(192,57,43,0.18)]
                    hover:-translate-y-0.5 hover:border-[rgba(192,57,43,0.35)]
                    transition-all group">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3
                        bg-[rgba(192,57,43,0.1)] border border-[rgba(192,57,43,0.2)]
                        group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <div className="text-2xl font-bold mb-0.5" style={{ color }}>{value}</div>
        <div className="text-[10px] uppercase tracking-[1.5px] text-[#7a5c5c] font-semibold">{label}</div>
    </div>
);

const Profile: React.FC = () => {
    const { user, logout, linkEmail, linkGoogle, isLoading, error } = useAuthStore();
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [upgradeEmail, setUpgradeEmail]       = useState('');
    const [upgradeName, setUpgradeName]         = useState('');
    const [upgradePassword, setUpgradePassword] = useState('');
    const [showUpgradePw, setShowUpgradePw]     = useState(false);
    const [upgradeSuccess, setUpgradeSuccess]   = useState(false);
    const [showGuildPicker, setShowGuildPicker] = useState(false);
    const [devPassword, setDevPassword]         = useState('');
    const [isDevMode, setIsDevMode]             = useState(false);

    const [hideCompleted, setHideCompleted] = useState(false);

    const isGuest = user?.email === 'guest@flashpoint.app';

    useEffect(() => {
        if (user) tournamentService.getUserStats(user.id).then(setStats);
    }, [user]);

    if (!user) return null;

    const handleLogout = async () => { await logout(); navigate('/login'); };

    const handleLinkEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        await linkEmail(upgradeEmail, upgradePassword, upgradeName);
        if (!error) setUpgradeSuccess(true);
    };

    const handleLinkGoogle = async () => {
        await linkGoogle();
        if (!error) setUpgradeSuccess(true);
    };

    const filteredTournaments = stats?.recentTournaments?.filter((t: any) => 
        !hideCompleted || t.status !== 'completed'
    ) || [];

    return (
        <PageShell title="Meu Perfil">
            <div className="container py-8 pb-28 animate-fade-in text-left">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ══════════════════════════════════
                        COLUNA ESQUERDA — info do usuário
                    ══════════════════════════════════ */}
                    <div className="lg:col-span-1 flex flex-col gap-4">

                        {/* Card principal */}
                        <div className="relative overflow-hidden rounded-2xl p-6 text-center
                                        bg-[linear-gradient(160deg,#130a0a,#1a0c0c)]
                                        border border-[rgba(192,57,43,0.2)]"
                             style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>

                            {/* glow topo */}
                            <div className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
                                 style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(192,57,43,0.15), transparent 70%)' }} />

                            {/* linha de energia */}
                            <div className="absolute top-0 left-[10%] right-[10%] h-px"
                                 style={{ background: 'linear-gradient(90deg, transparent, rgba(231,76,60,0.6), transparent)' }} />

                            {/* Avatar */}
                            <div className="relative w-24 h-24 mx-auto mb-4">
                                <GlowAvatar 
                                    seed={user.id || 'default'} 
                                    size={96} 
                                    glowColor={user.stats?.activeGlow}
                                    chosenGuildId={user.stats?.chosenGuildId}
                                    level={user.stats?.level}
                                    className="border-2 border-[rgba(255,255,255,0.1)] shadow-xl"
                                />
                            </div>

                            <h2 className="text-xl font-bold text-white mb-1 leading-tight">
                                {isGuest ? 'Convidado' : user.name}
                            </h2>
                            <p className="text-[#7a5c5c] text-sm mb-4">
                                {isGuest ? 'Conta temporária' : user.email}
                            </p>

                            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold
                                             bg-[rgba(192,57,43,0.12)] border border-[rgba(192,57,43,0.28)]
                                             text-[#e74c3c] mb-5">
                                {user.role === 'organizer' ? 'Organizador' : user.role === 'player' ? 'Jogador' : 'Admin'}
                            </span>

                            <button
                                onClick={handleLogout}
                                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl
                                           border border-[rgba(192,57,43,0.25)] text-[#e74c3c] text-sm font-semibold
                                           hover:bg-[rgba(192,57,43,0.1)] transition-colors">
                                <LogOut size={15} /> Sair da Conta
                            </button>
                        </div>

                        {/* Banner de upgrade (guest) */}
                        {isGuest && !upgradeSuccess && (
                            <div className="rounded-2xl p-5
                                            bg-[rgba(212,172,13,0.05)] border border-[rgba(212,172,13,0.25)]">
                                <div className="flex items-center gap-2 mb-2">
                                    <ShieldCheck size={16} className="text-[#d4ac0d]" />
                                    <h4 className="font-bold text-[#d4ac0d] text-sm">Proteja sua conta</h4>
                                </div>
                                <p className="text-xs text-[#7a5c5c] mb-4 leading-relaxed">
                                    Você está como Convidado. Seus dados podem ser perdidos. Vincule um e-mail ou Google para salvar permanentemente.
                                </p>
                                <button
                                    onClick={() => setShowUpgradeModal(true)}
                                    className="w-full py-2.5 rounded-xl text-xs font-bold
                                               bg-[rgba(212,172,13,0.12)] border border-[rgba(212,172,13,0.35)]
                                               text-[#d4ac0d] hover:bg-[rgba(212,172,13,0.2)] transition-all">
                                    Criar Conta Permanente
                                </button>
                            </div>
                        )}

                        {/* ── SOU DEV (Testing Tool) ── */}
                        <div className="mt-8 pt-6 border-t border-white/5">
                            {!isDevMode ? (
                                <div className="flex flex-col gap-2">
                                    <input 
                                        type="password" 
                                        placeholder="Senha Dev"
                                        value={devPassword}
                                        onChange={(e) => setDevPassword(e.target.value)}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-center focus:outline-none focus:border-red-500/50 transition-all"
                                    />
                                    <button
                                        onClick={() => {
                                            if (devPassword === '0707') {
                                                setIsDevMode(true);
                                            } else {
                                                alert('Senha incorreta');
                                            }
                                        }}
                                        className="w-full py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all"
                                    >
                                        SOU DEV
                                    </button>
                                </div>
                            ) : (
                                <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl">
                                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-3 text-center">Dev Panel</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[1, 12, 32, 52, 72, 92].map(lvl => (
                                            <button
                                                key={lvl}
                                                onClick={async () => {
                                                    await rewardService.setDevLevel(user.id, lvl);
                                                    window.location.reload();
                                                }}
                                                className="py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-white hover:bg-red-500/20 hover:border-red-500/30 transition-all"
                                            >
                                                Lvl {lvl}
                                            </button>
                                        ))}
                                    </div>
                                    <button 
                                        onClick={async () => {
                                            const randomAch = ACHIEVEMENTS[Math.floor(Math.random() * ACHIEVEMENTS.length)];
                                            await rewardService.unlockAchievement(user.id, randomAch.id);
                                            window.location.reload();
                                        }}
                                        className="w-full mt-2 py-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg text-[10px] font-bold hover:bg-emerald-500/20 transition-all"
                                    >
                                        + Desbloquear Aleatório
                                    </button>
                                    <button 
                                        onClick={() => setIsDevMode(false)}
                                        className="w-full mt-3 text-[9px] text-muted hover:text-white transition-colors"
                                    >
                                        Sair do modo Dev
                                    </button>
                                </div>
                            )}
                        </div>

                        {upgradeSuccess && (
                            <div className="rounded-2xl p-4 bg-[rgba(30,132,73,0.08)] border border-[rgba(39,174,96,0.3)]">
                                <p className="text-[#27ae60] font-bold text-sm text-center">Conta criada com sucesso!</p>
                            </div>
                        )}

                        {/* ── Identidade de Cor ── */}
                        {!isGuest && (() => {
                            const level = user.stats?.level ?? 1;
                            const chosenGuildId = user.stats?.chosenGuildId;
                            
                            const tier = getUnlockedTier(level);
                            const combo = rewardService.resolveGlow(level, chosenGuildId);
                            
                            const isRainbow = combo?.glowMode === 'rainbow';
                             const style = buildGlowStyle(combo);
                             const gradientColor = combo.glowColors.length > 1
                                 ? buildConicGradient(combo.glowColors)
                                 : combo.glowColors[0] || '#6b7280';

                            return (
                                <div
                                    className="rounded-2xl p-5 border"
                                    style={{
                                        background: 'rgba(255,255,255,0.02)',
                                        borderColor: combo ? `${combo.glowColors[0]}50` : 'rgba(255,255,255,0.06)',
                                        boxShadow: combo ? style.boxShadow : 'none',
                                    }}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Palette size={14} style={{ color: combo?.glowColors[0] ?? '#6b7280' }} />
                                            <h4 className="font-bold text-sm text-white">Identidade de Cor</h4>
                                        </div>
                                        <span
                                            className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                                            style={{
                                                color: combo?.glowColors[0] ?? '#6b7280',
                                                borderColor: `${combo?.glowColors[0] ?? '#6b7280'}50`,
                                                background: `${combo?.glowColors[0] ?? '#6b7280'}15`,
                                            }}
                                        >
                                            Tier {tier.tier} — {tier.label}
                                        </span>
                                    </div>

                                    {/* Color pips */}
                                    <div className="flex items-center gap-2 mb-3">
                                        {(combo?.glowColors ?? ['#6b7280']).map((hex, i) => (
                                            <span
                                                key={i}
                                                style={{
                                                    width: 14, height: 14, borderRadius: '50%',
                                                    background: hex,
                                                    boxShadow: `0 0 8px ${hex}`,
                                                    display: 'inline-block',
                                                    flexShrink: 0,
                                                }}
                                            />
                                        ))}
                                        <span
                                            className="text-sm font-bold ml-1"
                                            style={{
                                                background: isRainbow
                                                    ? 'linear-gradient(135deg, #f9f3e3, #0e68ab, #d3202a, #00733e)'
                                                    : gradientColor,
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                backgroundClip: 'text',
                                            }}
                                        >
                                            {combo?.symbol ?? ''} {combo?.name ?? 'Sem Cor'}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => setShowGuildPicker(true)}
                                        className="w-full py-2 rounded-xl text-xs font-bold transition-all hover:opacity-90"
                                        style={{
                                            background: combo
                                                ? `linear-gradient(135deg, ${combo.glowColors.join(', ')})`
                                                : '#6b7280',
                                            color: '#fff',
                                            boxShadow: combo ? `0 0 14px ${combo.glowColors[0]}50` : 'none',
                                        }}
                                    >
                                        Trocar Identidade
                                    </button>
                                </div>
                            );
                        })()}

                        {/* Achievements Section */}
                        <div className="mt-8">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Medal size={18} className="text-[#e74c3c]" />
                                    <h3 className="font-bold text-white text-base">Conquistas</h3>
                                </div>
                                <span className="text-[10px] text-[#7a5c5c] font-bold uppercase tracking-wider">
                                    {user.stats?.achievements?.length || 0} / {ACHIEVEMENTS.length} Desbloqueadas
                                </span>
                            </div>
                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                                {ACHIEVEMENTS.map(ach => {
                                    const isUnlocked = user.stats?.achievements?.some(a => a.id === ach.id);
                                    const Icon = ach.icon;
                                    
                                    return (
                                        <div 
                                            key={ach.id}
                                            className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 border transition-all relative group
                                                ${isUnlocked 
                                                    ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:scale-105 shadow-[0_0_15px_rgba(255,255,255,0.05)]' 
                                                    : 'bg-black/20 border-white/5 grayscale opacity-40'}`}
                                        >
                                            <div 
                                                className="w-10 h-10 rounded-full flex items-center justify-center mb-1"
                                                style={{ 
                                                    background: isUnlocked ? `${ach.color}20` : 'transparent',
                                                    color: isUnlocked ? ach.color : '#4a4a4a'
                                                }}
                                            >
                                                <Icon size={20} />
                                            </div>
                                            
                                            {/* Tooltip on hover */}
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 rounded-xl bg-black/95 backdrop-blur-md border border-white/10 text-center opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-2xl">
                                                <div className="font-bold text-xs mb-1" style={{ color: ach.color }}>{ach.name}</div>
                                                <div className="text-[10px] text-white/70 leading-relaxed">{ach.description}</div>
                                                <div className="mt-2 text-[9px] font-bold text-white/40 uppercase tracking-widest">{ach.rarity} • {ach.xpReward} XP</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>

                    {/* ══════════════════════════════════
                        COLUNA DIREITA — stats + histórico
                    ══════════════════════════════════ */}
                    <div className="lg:col-span-2 flex flex-col gap-6">

                        {/* Stats grid */}
                        {stats ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <StatCard icon={<Trophy size={17} className="text-[#d4ac0d]" />} label="Vitórias"   value={stats.wins}              color="#d4ac0d" />
                                <StatCard icon={<Star   size={17} className="text-[#e74c3c]" />} label="Top 3"      value={stats.top3}              color="#e74c3c" />
                                <StatCard icon={<Target size={17} className="text-[#e67e22]" />} label="Pontos"     value={stats.totalPoints}        color="#e67e22" />
                                <StatCard icon={<ArrowRight size={17} className="text-[#27ae60]" />} label="Vitórias %" value={stats.winRate || '0%'} color="#27ae60" />
                            </div>
                        ) : (
                            <div className="h-24 flex items-center justify-center">
                                <RefreshCw className="animate-spin text-[#e74c3c]" size={20} />
                            </div>
                        )}

                        {/* Histórico */}
                        <div className="relative overflow-hidden rounded-2xl
                                        bg-[linear-gradient(160deg,#130a0a,#1a0c0c)]
                                        border border-[rgba(192,57,43,0.18)]">

                            <div className="px-5 py-4 border-b border-[rgba(192,57,43,0.12)]
                                            flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-[#e74c3c]" />
                                    <h3 className="font-semibold text-white text-sm">Participação Recente</h3>
                                </div>
                                
                                <button 
                                    onClick={() => setHideCompleted(!hideCompleted)}
                                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all
                                        ${hideCompleted 
                                            ? 'bg-[#e74c3c] text-white' 
                                            : 'bg-white/5 text-[#7a5c5c] border border-white/5 hover:bg-white/10'}`}>
                                    {hideCompleted ? <EyeOff size={11} /> : <Eye size={11} />}
                                    {hideCompleted ? 'Escondendo Concluídos' : 'Mostrar Apenas Ativos'}
                                </button>
                            </div>

                            <div className="p-4">
                                {!stats ? (
                                    <div className="py-10 text-center text-[#7a5c5c] text-sm">Carregando...</div>
                                ) : filteredTournaments.length > 0 ? (
                                    <div className="flex flex-col gap-2">
                                        {filteredTournaments.map((t: any) => (
                                            <div
                                                key={t.id}
                                                onClick={() => navigate(`/tournament/${t.id}${t.status === 'completed' ? '/public' : ''}`)}
                                                className="flex items-center justify-between p-4 rounded-xl cursor-pointer
                                                           bg-[rgba(255,255,255,0.02)] border border-[rgba(192,57,43,0.1)]
                                                           hover:border-[rgba(192,57,43,0.35)] hover:bg-[rgba(192,57,43,0.06)]
                                                           transition-all group">
                                                <div>
                                                    <h4 className="font-semibold text-sm text-white
                                                                   group-hover:text-[#e74c3c] transition-colors">
                                                        {t.name}
                                                    </h4>
                                                    <p className="text-xs text-[#7a5c5c] mt-0.5">
                                                        {new Date(t.date).toLocaleDateString('pt-BR')}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="flex items-center gap-1.5 justify-end">
                                                        {t.rank === 1 && <Crown size={14} className="text-[var(--fp-gold)]" />}
                                                        {t.rank === 2 && <Medal size={14} className="text-[#94a3b8]" />}
                                                        {t.rank === 3 && <Medal size={14} className="text-[#cd7c3a]" />}
                                                        <div className="text-sm font-bold text-white">
                                                            {t.rank ? `#${t.rank}º lugar` : 'Sem rank'}
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-[#7a5c5c]">{t.points} pts</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-12 text-center text-[#7a5c5c]">
                                        <p className="text-sm mb-3">Você ainda não participou de nenhum torneio.</p>
                                        <button
                                            onClick={() => navigate('/discover')}
                                            className="text-[#e74c3c] text-xs font-semibold hover:underline">
                                            Explorar torneios ativos →
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 mx-auto max-w-2xl">
                    <AdsterraBanner />
                </div>
            </div>

            {/* ══════════════════════════════════
                MODAL: UPGRADE DE CONTA
            ══════════════════════════════════ */}
            {showUpgradeModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 p-4"
                     style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                     onClick={() => setShowUpgradeModal(false)}>
                    <div className="relative overflow-hidden rounded-2xl p-8 w-full max-w-md
                                    bg-[linear-gradient(160deg,#130a0a,#1a0c0c)]
                                    border border-[rgba(192,57,43,0.3)]"
                         style={{ boxShadow: '0 0 60px rgba(192,57,43,0.2)' }}
                         onClick={e => e.stopPropagation()}>

                        <div className="absolute top-0 left-[10%] right-[10%] h-px"
                             style={{ background: 'linear-gradient(90deg, transparent, rgba(231,76,60,0.6), transparent)' }} />

                        <h3 className="text-lg font-bold text-white mb-1">Criar conta permanente</h3>
                        <p className="text-[#7a5c5c] text-sm mb-6">Seus torneios e dados serão preservados.</p>

                        {error && (
                            <p className="text-[#e74c3c] text-xs p-3 bg-[rgba(192,57,43,0.1)] rounded-xl mb-4
                                          border border-[rgba(192,57,43,0.3)]">
                                {error}
                            </p>
                        )}

                        <form onSubmit={handleLinkEmail} className="flex flex-col gap-3 mb-4">
                            {[
                                { type: 'text',     placeholder: 'Seu nome',               value: upgradeName,     onChange: (e: any) => setUpgradeName(e.target.value) },
                                { type: 'email',    placeholder: 'seu@email.com',           value: upgradeEmail,    onChange: (e: any) => setUpgradeEmail(e.target.value) },
                            ].map((f, i) => (
                                <input key={i} {...f} required
                                    className="w-full px-4 py-3 rounded-xl text-sm text-white
                                               bg-[rgba(255,255,255,0.04)] border border-[rgba(192,57,43,0.2)]
                                               focus:outline-none focus:border-[rgba(231,76,60,0.5)]
                                               focus:ring-2 focus:ring-[rgba(192,57,43,0.12)]
                                               placeholder:text-[#7a5c5c] transition-all" />
                            ))}
                            <div className="relative">
                                <input
                                    type={showUpgradePw ? 'text' : 'password'}
                                    placeholder="Senha (mín. 6 caracteres)"
                                    value={upgradePassword}
                                    onChange={e => setUpgradePassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-xl text-sm text-white
                                               bg-[rgba(255,255,255,0.04)] border border-[rgba(192,57,43,0.2)]
                                               focus:outline-none focus:border-[rgba(231,76,60,0.5)]
                                               placeholder:text-[#7a5c5c] transition-all" />
                                <button type="button" onClick={() => setShowUpgradePw(p => !p)}
                                        className="absolute right-3 top-3.5 text-[#7a5c5c]">
                                    {showUpgradePw ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                            <button type="submit" disabled={isLoading}
                                    className="w-full py-3 rounded-xl font-bold text-sm text-white
                                               flex items-center justify-center gap-2
                                               bg-gradient-to-r from-[#c0392b] to-[#e67e22]
                                               hover:opacity-90 transition-opacity disabled:opacity-60
                                               shadow-[0_0_20px_rgba(192,57,43,0.35)]">
                                <Mail size={15} />
                                {isLoading ? 'Vinculando...' : 'Vincular com E-mail'}
                            </button>
                        </form>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-px bg-[rgba(192,57,43,0.15)] flex-1" />
                            <span className="text-xs text-[#7a5c5c]">ou</span>
                            <div className="h-px bg-[rgba(192,57,43,0.15)] flex-1" />
                        </div>

                        <button onClick={handleLinkGoogle} disabled={isLoading}
                                className="w-full py-3 rounded-xl font-bold text-sm text-white
                                           bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)]
                                           flex items-center justify-center gap-2
                                           hover:bg-[rgba(255,255,255,0.08)] transition-all">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" width="15" alt="Google" />
                            Vincular com Google
                        </button>

                        <button onClick={() => setShowUpgradeModal(false)}
                                className="w-full mt-3 text-xs text-[#7a5c5c] hover:text-[#a07070] transition-colors">
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* ── Guild Picker Modal ── */}
            {showGuildPicker && (
                <GuildPicker
                    level={user.stats?.level ?? 1}
                    currentGuildId={user.stats?.chosenGuildId}
                    onSelect={async (combinationId) => {
                        await rewardService.chooseGuild(user.id, combinationId, user.stats?.level ?? 1);
                        setShowGuildPicker(false);
                        // Force auth store re-read so the glow updates everywhere
                        window.location.reload();
                    }}
                    onClose={() => setShowGuildPicker(false)}
                />
            )}
        </PageShell>
    );
};

export default Profile;
