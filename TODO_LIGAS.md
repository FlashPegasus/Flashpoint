🏆 Planejamento Expandido: Sistema de Ligas
🎯 Objetivo

Permitir que organizadores criem grupos fechados (Ligas) onde múltiplos torneios acumulam pontos para um ranking sazonal ou permanente, com controle de permissões entre organizadores e regras customizáveis de pontuação.

🧱 1. Estrutura de Dados
Coleção leagues
leagues
 └ leagueId
     name
     description
     bannerUrl
     createdBy
     createdAt
     seasonStart
     seasonEnd
     visibility (public / private)
     inviteCode
Subcoleção organizers

Permite múltiplos organizadores com permissões.

organizers
 └ userId
      role: master | admin | moderator
      addedBy
      addedAt
Subcoleção members

Lista de jogadores da liga.

members
 └ playerId
      joinedAt
      status: active | banned
      nickname
Subcoleção tournaments

Torneios vinculados.

tournaments
 └ tournamentId
      addedAt
      addedBy
Subcoleção ranking

Ranking acumulado.

ranking
 └ playerId
      totalPoints
      tournamentsPlayed
      wins
      lastUpdate
Subcoleção settings

Regras da liga.

settings
    pointsParticipation
    pointsWin
    pointsTop4
    pointsTop8
    streakBonus
    dropWorstTournament

Isso evita documentos gigantes e reduz leitura desnecessária.

👑 2. Sistema de Permissões
Permissão	Master	Admin	Moderator
Criar Liga	✔	❌	❌
Editar Configurações	✔	✔	✔
Adicionar Torneios	✔	✔	✔
Remover Torneios	✔	✔	✔
Adicionar Organizadores	✔	✔	❌
Remover Organizadores	✔	✔	❌
Excluir Liga	✔	❌	❌
Banir Jogadores	✔	✔	✔
Regra importante

Sempre deve existir pelo menos 1 Master.

⚙️ 3. Funcionalidades Necessárias
Gestão de Liga

 Criar Liga

 Editar Liga

 Upload de Banner

 Definir temporada (data início/fim)

 Definir formato principal (Commander / Modern / etc)

Gestão de Jogadores

 Entrar por link convite

 Aprovação manual (opcional)

 Banir jogador

 Remover jogador

Gestão de Torneios

 Vincular torneio existente

 Criar torneio direto da liga

 Definir se o torneio pontua ou não

 Multiplicador especial para torneios grandes

Exemplo:

Friday Night Magic → x1
Championship → x2
Final da Liga → x3
🏆 4. Sistema de Pontuação

Aqui é onde liga fica divertida.

Pontuação base
Evento	Pontos
Participação	1
Vitória	3
Top 8	+2
Top 4	+3
Finalista	+4
Campeão	+5
Multiplicadores

Torneio grande → x2

Final da liga → x3

Bônus interessantes
🔥 Win Streak

3 vitórias seguidas → +2

🧠 UnderDog

Se derrotar jogador Top 3 → +2

🏁 Consistência

Participou de 5 torneios seguidos → +3

📊 5. Dashboard da Liga

Página principal da liga:

Ranking
1️⃣ João — 48 pts
2️⃣ Ana — 42 pts
3️⃣ Pedro — 39 pts
Estatísticas

jogador com mais vitórias

jogador com mais participações

maior streak

maior upset

🔗 6. Sistema de Convite

Tipos de entrada:

Link convite
flashpoint.gg/league/abc123
Código
JOIN: DRAGONS24
Modos
Tipo	Descrição
Public	qualquer um entra
Private	só convite
Approval	entra mas precisa aprovação
🏅 7. Temporadas

Uma liga pode ter temporadas.

Season 1
Season 2
Season 3

Cada temporada reinicia ranking.

Estrutura sugerida:

leagues
   seasons
       seasonId
            startDate
            endDate
            ranking
## 📋 Checklist de Execução Técnica (Revisado pela TaskTeam)

### 🧱 1. Estrutura de Dados & Escalabilidade
- [ ] **Otimização de Custos (Cache)**: Adicionar campo `cachedTopRanking` no documento principal da Liga (contendo os top 10 ou 20).
- [ ] **Sincronização em Tempo Real**: Implementar nó `/sync/leagues/{leagueId}` no RTDB para disparar atualizações instantâneas no dashboard da liga sem polling no Firestore.
- [ ] **Histórico de Alterações**: Criar subcoleção `audit_log` para ações de Moderadores/Admins (Banimento, remoção de torneio).

### ⚙️ 2. Core Service Implementation
- [ ] **LeagueService**: Desenvolver métodos de CRUD, validação de permissões e geração de `inviteCode` curto e amigável.
- [ ] **Scoring Engine**: Criar um motor que processe os resultados de um torneio e atualize o ranking da liga.
    - *Desafio Técnico:* Implementar a regra "Melhores X Resultados" requer guardar o histórico de todos os torneios do jogador na liga para recalcular se o novo resultado entra no Top X.

### 🎨 3. UI/UX "Premium"
- [ ] **League Dashboard**: Design com glassmorphism, evidenciando o pódio (1º, 2º, 3º) com animações de brilho.
- [ ] **Experience Mobile**: Navbar específica para navegação interna da liga (Ranking, Torneios, Membros).

---

## 🧠 Respostas às Decisões Críticas

1.  **Temporadas múltiplas?** Sim, sugerimos o modelo "Archive". A liga é eterna, mas o ranking é filtrado por `seasonId`. Isso mantém o histórico de glórias passadas.
2.  **Entrar antes de jogar?** Sim. Isso evita que o organizador precise "caçar" jogadores anônimos. O jogador clica no link, entra na liga, e então seus resultados passam a contar automaticamente.
3.  **Torneio em múltiplas ligas?** Sim, tecnicamente possível. O `tournamentService` pode notificar N ligas cadastradas.
4.  **Tempo Real ou Finalização?** Ao finalizar o torneio (status: `completed`). Isso evita flutuações confusas no ranking durante as rodadas.
5.  **Ordenação?** Firestore para escalabilidade, mas Frontend para o "Top 10" cacheado.

---

## ✅ Checklist de Implementação (Fase 26)
- [ ] Iniciar `features/leagues` (Service, Store, Types).
- [ ] Migrar regras de segurança do Firestore para incluir `leagues`.
- [ ] Desenvolver fluxo de criação e geração de convite.
- [ ] Integrar conclusão de torneio com atualização de ranking da liga.
- [ ] Criar visualização de Ranking com animações de "Upset/Streak".

> [!IMPORTANT]
> **TaskTeam Insight:** Para manter o **Plano Spark (Grátis)**, a regra de "Melhores X Torneios" deve ser calculada no Frontend durante a visualização do perfil ou via cache atômico no Firestore. Jamais recalcularemos toda a liga por causa de um único jogador.
