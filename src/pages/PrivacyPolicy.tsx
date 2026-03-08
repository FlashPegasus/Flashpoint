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
                        <h1 className="text-4xl font-bold mb-2">PolÃ­tica de Privacidade</h1>
                        <p className="text-secondary text-sm">Ãšltima atualizaÃ§Ã£o: marÃ§o de 2026</p>
                    </div>

                    <div className="space-y-6 animate-slide-up">
                        {/* Section 1 */}
                        <Section icon={<Database size={20} />} title="Quais dados coletamos">
                            <p>O FlashPoint coleta apenas os dados necessÃ¡rios para o funcionamento do serviÃ§o:</p>
                            <ul className="mt-3 space-y-2 text-secondary text-sm leading-relaxed">
                                <li>ðŸ”¹ <strong>Nome de usuÃ¡rio</strong> â€” para identificaÃ§Ã£o nos torneios</li>
                                <li>ðŸ”¹ <strong>EndereÃ§o de e-mail</strong> â€” para autenticaÃ§Ã£o (apenas se vocÃª criar uma conta com e-mail)</li>
                                <li>ðŸ”¹ <strong>Foto de perfil</strong> â€” obtida do Google quando vocÃª usa o login com Google (opcional)</li>
                                <li>ðŸ”¹ <strong>HistÃ³rico de torneios</strong> â€” torneios criados e participados, pontuaÃ§Ãµes e resultados</li>
                                <li>ðŸ”¹ <strong>UID anÃ´nimo</strong> â€” um identificador Ãºnico gerado automaticamente para contas de Convidado</li>
                            </ul>
                        </Section>

                        {/* Section 2 */}
                        <Section icon={<Lock size={20} />} title="Como usamos seus dados">
                            <ul className="space-y-2 text-secondary text-sm leading-relaxed">
                                <li>âœ… Exibir seu perfil e estatÃ­sticas dentro do aplicativo</li>
                                <li>âœ… Gerenciar sua participaÃ§Ã£o em torneios</li>
                                <li>âœ… Sincronizar seus dados entre dispositivos (quando a sincronizaÃ§Ã£o em nuvem estÃ¡ ativada)</li>
                                <li>âŒ Seus dados <strong>nunca sÃ£o vendidos</strong> a terceiros</li>
                                <li>âŒ <strong>NÃ£o</strong> enviamos e-mails de marketing</li>
                                <li>âŒ <strong>NÃ£o</strong> compartilhamos dados com anunciantes</li>
                            </ul>
                        </Section>

                        {/* Section 3 */}
                        <Section icon={<Shield size={20} />} title="SeguranÃ§a dos dados">
                            <ul className="space-y-2 text-secondary text-sm leading-relaxed">
                                <li>ðŸ”’ Toda a comunicaÃ§Ã£o Ã© criptografada via <strong>HTTPS/TLS</strong></li>
                                <li>ðŸ”’ A autenticaÃ§Ã£o Ã© feita pelo <strong>Firebase Authentication</strong> (Google), que usa padrÃµes de seguranÃ§a de nÃ­vel empresarial</li>
                                <li>ðŸ”’ Dados na nuvem sÃ£o armazenados no <strong>Firebase Firestore</strong> com regras de seguranÃ§a que garantem que apenas vocÃª acessa seus prÃ³prios dados</li>
                                <li>ðŸ”’ Senhas nunca sÃ£o armazenadas em texto simples â€” o Firebase usa hashing seguro (bcrypt)</li>
                            </ul>
                        </Section>

                        {/* Section 4 â€” Guest accounts */}
                        <div className="p-5 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl">
                            <h3 className="font-bold text-yellow-300 flex items-center gap-2 mb-3">
                                <span>âš ï¸</span> Contas de Convidado
                            </h3>
                            <p className="text-sm text-secondary leading-relaxed">
                                Ao entrar como <strong>Convidado</strong>, um UID anÃ´nimo Ãºnico Ã© gerado para a sua sessÃ£o.
                                Seus dados ficam vinculados a esse UID no seu dispositivo e no Firestore.
                                <br /><br />
                                <strong>AtenÃ§Ã£o:</strong> se vocÃª limpar o cache do navegador ou acessar de outro dispositivo sem vincular uma conta permanente (e-mail ou Google), seus dados podem ser perdidos.
                                Recomendamos que vocÃª <strong>crie uma conta permanente</strong> pelo seu perfil para garantir a preservaÃ§Ã£o dos seus dados.
                            </p>
                        </div>

                        {/* Section 5 */}
                        <Section icon={<Trash2 size={20} />} title="Seus direitos">
                            <ul className="space-y-2 text-secondary text-sm leading-relaxed">
                                <li>ðŸ“‹ <strong>Acesso:</strong> vocÃª pode visualizar todos os seus dados na pÃ¡gina de Perfil</li>
                                <li>ðŸ“‹ <strong>ExportaÃ§Ã£o:</strong> use o botÃ£o "Backup Local (JSON)" na pÃ¡gina de Perfil para exportar seus dados</li>
                                <li>ðŸ“‹ <strong>ExclusÃ£o:</strong> para solicitar a exclusÃ£o completa da sua conta e dados, entre em contato conosco pelo e-mail abaixo</li>
                                <li>ðŸ“‹ <strong>Consentimento:</strong> vocÃª pode revogar o acesso do Google Ã  qualquer momento nas configuraÃ§Ãµes da sua conta Google</li>
                            </ul>
                        </Section>

                        {/* Section 6 */}
                        <Section icon={<Mail size={20} />} title="Contato">
                            <p className="text-secondary text-sm leading-relaxed">
                                Para dÃºvidas, solicitaÃ§Ãµes de exclusÃ£o de dados ou qualquer questÃ£o relacionada Ã  sua privacidade, entre em contato:
                            </p>
                            <div className="mt-4 p-4 glass rounded-xl border border-white/10">
                                <p className="text-sm font-mono">flashpoint-suporte@flashpoint.app</p>
                                <p className="text-xs text-muted mt-1">Respondemos em atÃ© 5 dias Ãºteis</p>
                            </div>
                        </Section>

                        <p className="text-center text-xs text-muted pt-4 border-t border-white/5">
                            Esta polÃ­tica se aplica ao serviÃ§o FlashPoint disponÃ­vel em <strong>flashpoint-anti.web.app</strong>.
                            Podemos atualizar este documento periodicamente â€” a data da Ãºltima atualizaÃ§Ã£o estarÃ¡ sempre no topo desta pÃ¡gina.
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
