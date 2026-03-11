import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Zap, Shield, BarChart3, Users, PlusCircle } from 'lucide-react';
import PageShell from '../components/layout';
import { Button, Card } from '../components/ui';
import { useAuthStore } from '../features/auth/authStore';

const Home: React.FC = () => {
    const navigate = useNavigate();
    const { uiMode } = useAuthStore();

    return (
        <PageShell>
            {/* Hero Section */}
            <section className="section py-32 overflow-hidden flex items-center min-h-[85vh]">
                <div className="container relative z-10">
                    <div className="flex flex-col items-center text-center">
                        <div className="p-4 mb-8 glass rounded-2xl shadow-glow">
                            <Zap size={32} className="text-purple fill-purple/30" />
                        </div>
                        <h1 className="mb-8 max-w-4xl">
                            Gerencie Torneios de TCG como um <span className="text-mana-purple">Profissional</span>
                        </h1>
                        <p className="text-xl text-secondary mb-12 max-w-2xl mx-auto leading-relaxed">
                            De noites locais de jogo até ligas de alto nível. FlashPoint é a maneira mais rápida e inteligente de organizar eventos de TCG 1v1 e multiplayer.
                        </p>
                        <div className="flex gap-6 flex-wrap justify-center">
                            {uiMode === 'organizer' ? (
                                <>
                                    <Button size="lg" variant="glow" onClick={() => navigate('/tournament/create')}>
                                        Criar Torneio
                                    </Button>
                                    <Button size="lg" variant="secondary" onClick={() => navigate('/my-area')}>
                                        Gerenciar Eventos
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button size="lg" variant="glow" onClick={() => navigate('/discover')}>
                                        Explorar Torneios
                                    </Button>
                                    <Button size="lg" variant="secondary" onClick={() => navigate('/profile')}>
                                        Minha Área
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="section py-32 bg-white/[0.01]">
                <div className="container">
                    <div className="text-center mb-24">
                        <h2 className="mb-6">Tudo que você precisa</h2>
                        <p className="text-secondary max-w-2xl mx-auto">Recursos poderosos desenvolvidos especificamente para a comunidade moderna de TCG.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[
                            { icon: <Users size={28} />, title: 'Suporte Multiplayer', desc: 'Suporte nativo para Commander e outros formatos multiplayer com agrupamento inteligente de mesas.' },
                            { icon: <Trophy size={28} />, title: 'Pronto para Ligas', desc: 'Conecte múltiplos torneios em uma liga de temporada com classificação automática.' },
                            { icon: <Zap size={28} />, title: 'Pareamentos Rápidos', desc: 'Pareamentos Swiss e multiplayer instantâneos que respeitam pontos e confrontos anteriores.' },
                            { icon: <Shield size={28} />, title: 'Robusto e Confiável', desc: 'Gerencia inscrições tardias, desistências e correções de pontuação com facilidade em qualquer etapa.' },
                            { icon: <BarChart3 size={28} />, title: 'Análises Detalhadas', desc: 'Acompanhe tendências do metagame, taxas de vitória e crescimento dos torneios ao longo do tempo.' },
                            { icon: <PlusCircle size={28} />, title: 'PWA Nativo', desc: 'Instale no celular como um app nativo. Funciona offline e é extremamente rápido.' }
                        ].map((feature, i) => (
                            <Card key={i} className="hover-lift p-10">
                                <div className="mb-6 text-mana-purple">{feature.icon}</div>
                                <h3 className="mb-4">{feature.title}</h3>
                                <p className="text-secondary leading-relaxed">{feature.desc}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
        </PageShell >
    );
};

export default Home;
