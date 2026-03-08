# 📋 FlashPoint — Phase 28 (Prototype v1.2.0)

> **Regra de Ouro (Golden Rule):** 
> 🛑 **PROIBIDO DEPLOY DIRETO**. Toda e qualquer alteração DEVE ser testada exaustivamente no `localhost:5174` primeiro. O comando `firebase deploy` ou `git push` só pode ser executado após a validação positiva no ambiente local.

---

## 🎯 Objetivo da Fase
Executar a "Fase B" de refatoração do nosso release anterior para evitar a criação de um "monolito" de código na UI, melhorar o gerenciamento de estado e preparar o terreno para as próximas grandes features.

---

## 🏗️ Tarefas de Refatoração (Dashboard de Ligas)

### [ ] 1. Divisão de Responsabilidades (UI Split)
O arquivo `LeagueDashboard.tsx` passou de 560 linhas. Precisamos dividi-lo.
- [ ] Criar `src/features/leagues/components/LeagueMembersTab.tsx`
  - Extrair toda a tabela de membros, botões de banimento e promover organizadores.
- [ ] Criar `src/features/leagues/components/LeagueSeasonsTab.tsx`
  - Extrair a tabela de Hall da Fama e histórico de temporadas passadas.
- [ ] Ajustar `LeagueDashboard.tsx` para apenas importar e renderizar esses componentes, repassando as `props` ou acessando o `useLeagueStore`.

### [ ] 2. Qualidade de Código (Types & Enums)
- [ ] Criar um type explícito para as abas `type LeagueTabId = 'ranking' | 'tournaments' | 'info' | 'membros' | 'seasons'`.
- [ ] Remover comparações com `as any` no controle de abas.
- [ ] Extrair lógica repetida do QR Code / Link de convite para um helper global (`src/utils/inviteHelper.ts`).

### [ ] 3. Melhorias de Robustez (State & RTDB)
- [ ] Implementar timeout de fallback (3000ms) no `_notifyUpdate` do `leagueService.ts` usando `Promise.race`, para o caso da rede oscilar antes do "fire-and-forget".
- [ ] Adicionar try/catch mais granulares nos hooks de carregamento.

---

## 📝 Observações / Novas Funcionalidades (Preencha aqui!)
> **Espaço do Gabriel**: *Anote abaixo as novas ideias, modificações de UI ou outras coisas que você quer incluir nesta fase antes de passarmos tudo pelo TaskTeam.*

- [ ] (Sua anotação aqui...)
- [ ] (Sua anotação aqui...)

---

## 🧪 Regras de Validação (Smoke Tests - Localhost)

Antes de autorizar o deploy para produção, deve-se executar isso no **Localhost**:
- [ ] Verificar navegação limpa entre as Abas (Ranking, Torneios, Membros, Temporadas).
- [ ] Testar a ação de banir/desbanir membro na aba de membros extraída.
- [ ] Testar a geração do link/QR Code de convite com a nova lógica unificada.
- [ ] Visualizar o Audit Log pelo modal do Dashboard.

---

## 📦 Deploy Checklist (Pós-Validação)
- [ ] `npm run build` passa sem erros TypeScript de tipagem rigorosa.
- [ ] `git commit` detalhado sobre a separação de componentes.
- [ ] `firebase deploy --only hosting`
- [ ] `git push`






# 🚀 FlashPoint — Roadmap de Mercado, Inovação e Monetização

## 1) Diagnóstico rápido do produto atual
Com base no estado atual do projeto, o FlashPoint já tem uma fundação forte para o nicho de TCG:
- Gestão de torneios com foco em formatos competitivos e multiplayer.
- Estrutura de ligas com visão de ranking e sazonalidade.
- Arquitetura orientada a custo (Firebase Spark + RTDB para sinais).
- App web/mobile (React + Capacitor), bom para eventos presenciais.

Isso coloca o produto em um **bom ponto de partida** para competir com plataformas de organização de eventos casuais/semiprofissionais.

---

## 2) O que “topo do mercado” está fazendo (e como adaptar)

## A. Experiência de organizador (B2B2C)
1. **Onboarding em 2 minutos**
   - Template de torneio por formato (Commander, Modern, Pioneer etc).
   - “Clone último evento” para evitar retrabalho.
2. **Automação operacional**
   - Check-in por QR code.
   - Pareamentos com projeção de tempo por rodada.
   - “Assistente de round” (alerta de atraso, auto-drop, fila de resultado pendente).
3. **Confiabilidade em dia de evento**
   - Modo contingência (cache local) para queda de internet.
   - Sincronização assíncrona quando conexão voltar.

## B. Experiência do jogador (retenção)
1. **Perfil competitivo vivo**
   - Histórico por deck/arquetipo.
   - Estatísticas por matchup e por loja/organizador.
2. **Social leve**
   - Follow de jogadores/ligas.
   - Feed de resultados e pódios.
3. **Gamificação progressiva**
   - Missões semanais (“jogue 2 eventos”, “vença 1 partida de virada”).
   - Badges e trilhas de progresso sazonais.

## C. Inteligência e insights (diferencial)
1. **Painel de saúde da liga**
   - Retenção 7/30 dias, churn de jogadores, taxa de retorno por organizador.
2. **Recomendação de calendário**
   - Melhor dia/horário com base em presença histórica.
3. **Alertas de risco**
   - “Liga perdendo engajamento” + sugestões automáticas de ação.

---

## 3) Novas ideias de funcionalidades (priorizadas)

## Fase P0 (impacto alto + baixa complexidade)
1. **Template inteligente de torneio**
   - Salva presets de formato, pontuação e duração por rodada.
2. **Check-in por QR + confirmação em 1 toque**
   - Reduz fila e erro manual.
3. **Página pública de liga/torneio otimizada para compartilhamento**
   - Meta tags e “cartão social” para WhatsApp/Instagram.
4. **Centro de notificações essencial**
   - Início de rodada, chamada para mesa, resultado pendente.

## Fase P1 (médio prazo)
1. **Deck tracking opcional**
   - Upload de decklist URL + estatísticas por deck.
2. **Ranking ELO paralelo ao ranking por pontos**
   - Maior percepção competitiva para jogadores hardcore.
3. **Season Pass de liga**
   - Missões, badges e recompensas digitais.
4. **Sistema de staff**
   - Papéis separados: juiz, scorekeeper, streamer.

## Fase P2 (diferenciação forte)
1. **Coach de organizador (IA assistiva)**
   - Sugere estrutura de premiação e número ideal de rodadas.
2. **Marketplace de ligas/eventos**
   - Descoberta regional com filtros avançados.
3. **API/Integrações**
   - Export para BI e bots de Discord.

---

## 4) Melhorias de desempenho (técnico) recomendadas

## A. Front-end e renderização
1. **Code splitting por rota**
   - Lazy loading para páginas pesadas (`TournamentDashboard`, `LeagueDashboard`).
2. **Virtualização de listas grandes**
   - Ranking e participantes com 200+ entradas sem travar scroll.
3. **Memoização seletiva**
   - Evitar re-render em cards estáticos e tabelas de classificação.

## B. Firebase/custo e escala
1. **Leituras incrementais + cache de “top ranking”**
   - Manter top N no documento da liga e carregar detalhe sob demanda.
2. **Snapshot listener só onde importa**
   - Tempo real apenas no que muda por rodada.
3. **Índices e paginação obrigatória**
   - Nunca carregar coleção inteira em telas de descoberta.

## C. Resiliência mobile/evento
1. **Fila offline de ações críticas**
   - Resultado de partida, check-in, drop.
2. **Retry exponencial e deduplicação de escrita**
   - Evitar gravações duplicadas em conexão instável.
3. **Métricas de performance no app**
   - Tempo de abertura, TTI, latência de ação principal.

---

## 5) Plano de monetização pós-lançamento público

## Etapa 1 — Monetização inicial (0–3 meses)
### Modelo Freemium (recomendado)
- **Free (entrada):**
  - Até X torneios/mês por organizador.
  - Recursos essenciais de pareamento e ranking.
- **Pro Organizador (assinatura mensal):**
  - Ligas ilimitadas.
  - Branding da liga/loja.
  - Relatórios avançados e exportação.
  - Suporte prioritário.
- **Pro League (assinatura por liga):**
  - Gestão multi-staff, automações e analytics completos.

### Receita complementar imediata
- **Taxa por evento premium** (pay-as-you-go).
- **Venda de destaque na descoberta** (“evento patrocinado local”).

## Etapa 2 — Escala comercial (3–9 meses)
1. **Planos B2B para lojas e circuitos**
   - Multi-unidade, dashboard consolidado e gestão de equipe.
2. **Parcerias com marcas/distribuidores**
   - Patrocínio de temporadas e premiações oficiais.
3. **Sponsorship in-app não intrusivo**
   - Espaços premium em páginas públicas de campeonato.

## Etapa 3 — Monetização avançada (9–18 meses)
1. **Comissão sobre inscrições pagas**
   - Se houver integração de pagamentos.
2. **Marketplace de serviços**
   - Juízes, cobertura, streamers, designers de evento.
3. **Data products (anonimizados)**
   - Insights de metagame/região para parceiros (com compliance).

---

## 6) KPIs para garantir crescimento monetário saudável

## Produto
- WAU/MAU de organizadores.
- % de torneios concluídos sem incidente.
- Tempo médio de operação por rodada.

## Crescimento
- CAC por organizador ativo.
- Conversão Free → Pro (30/60/90 dias).
- Retenção de ligas por temporada.

## Receita
- MRR total e por segmento (independente, loja, circuito).
- ARPA por organizador.
- Churn de assinatura mensal.

---

## 7) Plano de execução sugerido (90 dias)

## Dias 0–30 (fundação de crescimento)
- Entregar P0: templates, QR check-in, notificações essenciais.
- Instrumentar analytics de funil (criação → inscrição → conclusão).
- Definir e publicar planos Free/Pro (sem cobrança automática ainda).

## Dias 31–60 (conversão)
- Entregar painel de insights básico para organizador.
- Liberar paywall suave para recursos Pro.
- Iniciar campanha com comunidades e lojas-piloto.

## Dias 61–90 (escala)
- Fechar 5–10 parcerias com lojas/circuitos locais.
- Ativar cobrança recorrente dos planos Pro.
- Lançar programa de indicação com crédito em assinatura.

---

## 8) Priorização final (o que fazer primeiro)
1. **P0 + Freemium claro** (maior impacto de adoção e receita).
2. **Performance e confiabilidade no dia de evento** (evita churn).
3. **Analytics para organizador** (justifica upgrade para Pro).
4. **Parcerias e descoberta local patrocinada** (escala comercial).

Se o time executar bem esse roteiro, o FlashPoint tende a crescer com equilíbrio entre:
- **adoção da comunidade**,
- **baixo custo operacional**,
- **recorrência de receita**.
