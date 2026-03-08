import React from 'react';
import PageShell from '../components/layout';
import { Shield, Lock, Database, Trash2, Mail } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
    return (
        <PageShell>
            <div className="container section pb-16">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12 animate-fade-in">
                        <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-accent/20">
                            <Shield size={32} className="text-accent" />
                        </div>
                        <h1 className="text-4xl font-bold mb-2">Política de Privacidade</h1>
                        <p className="text-secondary text-sm">Última atualização: março de 2026</p>
                    </div>

                    <div className="space-y-6 animate-slide-up">
                        {/* Section 1 */}
                        <Section icon={<Database size={20} />} title="Quais dados coletamos">
                            <p>O FlashPoint coleta apenas os dados necessários para o funcionamento do serviço:</p>
                            <ul className="mt-3 space-y-2 text-secondary text-sm leading-relaxed">
                                <li>🔸 <strong>Nome de usuário</strong> - para identificação nos torneios</li>
                                <li>🔸 <strong>Endereço de e-mail</strong> - para autenticação (apenas se você criar uma conta com e-mail)</li>
                                <li>🔸 <strong>Foto de perfil</strong> - obtida do Google quando você usa o login com Google (opcional)</li>
                                <li>🔸 <strong>Histórico de torneios</strong> - torneios criados e participados, pontuações e resultados</li>
                                <li>🔸 <strong>UID anônimo</strong> - um identificador único gerado automaticamente para contas de Convidado</li>
                            </ul>
                        </Section>

                        {/* Section 2 */}
                        <Section icon={<Lock size={20} />} title="Como usamos seus dados">
                            <ul className="space-y-2 text-secondary text-sm leading-relaxed">
                                <li>⚙️ Exibir seu perfil e estatísticas dentro do aplicativo</li>
                                <li>⚙️ Gerenciar sua participação em torneios</li>
                                <li>⚙️ Sincronizar seus dados entre dispositivos (quando a sincronização em nuvem está ativada)</li>
                                <li>🚫 Seus dados <strong>nunca são vendidos</strong> a terceiros</li>
                                <li>🚫 <strong>Não</strong> enviamos e-mails de marketing</li>
                                <li>🚫 <strong>Não</strong> compartilhamos dados com anunciantes</li>
                            </ul>
                        </Section>

                        {/* Section 3 */}
                        <Section icon={<Shield size={20} />} title="Segurança dos dados">
                            <ul className="space-y-2 text-secondary text-sm leading-relaxed">
                                <li>🔒 Toda a comunicação é criptografada via <strong>HTTPS/TLS</strong></li>
                                <li>🔒 A autenticação é feita pelo <strong>Firebase Authentication</strong> (Google), que usa padrões de segurança de nível empresarial</li>
                                <li>🔒 Dados na nuvem são armazenados no <strong>Firebase Firestore</strong> com regras de segurança que garantem que apenas você acessa seus próprios dados</li>
                                <li>🔒 Senhas nunca são armazenadas em texto simples - o Firebase usa hashing seguro (bcrypt)</li>
                            </ul>
                        </Section>

                        {/* Section 4 - Guest accounts */}
                        <div className="p-5 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl">
                            <h3 className="font-bold text-yellow-300 flex items-center gap-2 mb-3">
                                <span>⚠️</span> Contas de Convidado
                            </h3>
                            <p className="text-sm text-secondary leading-relaxed">
                                Ao entrar como <strong>Convidado</strong>, um UID anônimo único é gerado para a sua sessão.
                                Seus dados ficam vinculados a esse UID no seu dispositivo e no Firestore.
                                <br /><br />
                                <strong>Atenção:</strong> se você limpar o cache do navegador ou acessar de outro dispositivo sem vincular uma conta permanente (e-mail ou Google), seus dados podem ser perdidos.
                                Recomendamos que você <strong>crie uma conta permanente</strong> pelo seu perfil para garantir a preservação dos seus dados.
                            </p>
                        </div>

                        {/* Section 5 */}
                        <Section icon={<Trash2 size={20} />} title="Seus direitos">
                            <ul className="space-y-2 text-secondary text-sm leading-relaxed">
                                <li>📌 <strong>Acesso:</strong> você pode visualizar todos os seus dados na página de Perfil</li>
                                <li>📌 <strong>Exportação:</strong> use o botão "Backup Local (JSON)" na página de Perfil para exportar seus dados</li>
                                <li>📌 <strong>Exclusão:</strong> para solicitar a exclusão completa da sua conta e dados, entre em contato conosco pelo e-mail abaixo</li>
                                <li>📌 <strong>Consentimento:</strong> você pode revogar o acesso do Google à qualquer momento nas configurações da sua conta Google</li>
                            </ul>
                        </Section>

                        {/* Section 6 */}
                        <Section icon={<Mail size={20} />} title="Contato">
                            <p className="text-secondary text-sm leading-relaxed">
                                Para dúvidas, solicitações de exclusão de dados ou qualquer questão relacionada à sua privacidade, entre em contato:
                            </p>
                            <div className="mt-4 p-4 glass rounded-xl border border-white/10">
                                <p className="text-sm font-mono">flashpoint-suporte@flashpoint.app</p>
                                <p className="text-xs text-muted mt-1">Respondemos em até 5 dias úteis</p>
                            </div>
                        </Section>

                        <p className="text-center text-xs text-muted pt-4 border-t border-white/5">
                            Esta política se aplica ao serviço FlashPoint disponível em <strong>flashpoint-anti.web.app</strong>.
                            Podemos atualizar este documento periodicamente - a data da última atualização estará sempre no topo desta página.
                        </p>
                    </div>
                </div>
            </div>
        </PageShell>
    );
};

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="glass-card p-6">
        <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <span className="text-accent">{icon}</span>
            {title}
        </h2>
        <div className="text-sm leading-relaxed">{children}</div>
    </div>
);

export default PrivacyPolicy;
