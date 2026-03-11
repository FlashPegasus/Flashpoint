# 📜 Histórico do Projeto FlashPoint

Este arquivo serve como um diário de bordo da evolução do projeto. Cada "Fase" concluída deve ser registrada aqui para manter a continuidade do desenvolvimento.

## 2026-03-09: Fase 29 - Player Experience (Public View v1.2.1)
- **Objetivo**: Criação de uma página pública otimizada para os jogadores e overhaul visual premium.
- **Implementações**:
  - Lançamento da rota `/tournament/:id/public`.
  - Visual "Neo-Modern TCG" com mesh gradients, glassmorphism e animações.
  - Componente `MatchCard` otimizado para visualização de mesas em tempo real.
  - Sistema de busca de mesas e visualização de ranking pública.
  - Fluxo de inscrição simplificado (Join Modal).

## 2026-03-09: Fase 28 - Refatoração & Check-in (Dashboard v1.2.0)
- **Objetivo**: Divisão do Dashboard de Ligas e implementação de sistema de check-in.
- **Implementações**:
  - UI Split: Extração de `LeagueMembersTab.tsx` e `LeagueSeasonsTab.tsx`.
  - Sistema de Check-In para participantes de torneios.
  - Customização visual básica de ligas (branding).
  - Unificação de lógica de convites (`inviteHelper.ts`).
  - **Tag**: `v1.2.0`

## 2026-03-08: Fase 27 - Gestão Autônoma (Seasons & Members v1.0.3)
- **Objetivo**: Implementação completa de controle de membros (Ban/Unban) e temporadas de ranking (Archive/Reset).
- **Implementações**:
  - Subcoleções `members`, `seasons` e `organizers` para escalabilidade.
  - Abas "👥 Membros" e "🏅 Temporadas" no Dashboard da Liga.
  - Fluxo de "Encerrar Temporada" com Snapshot do ranking anterior.
  - Bloqueio de entrada para usuários banidos.
  - **Tag**: `v1.0.3-autonomous-stable`

## 2026-03-08: Fase 26 - Ligas Core (Ranking & Streaks v1.0.2)
- **Objetivo**: Lançamento funcional do sistema de ligas.
- **Implementações**:
  - Ranking dinâmico com regra "Melhores X Resultados".
  - Sistema de Streaks (🔥) baseado em histórico cronológico.
  - QR Code de convite e vinculação de torneios.
  - **Tag**: `v1.0.2-leagues-core`

## 2026-03-07: Fase 25 - A Faxina (Overhaul Arquitetural v1.0.1)
- **Objetivo**: Simplificação profunda da arquitetura, redução drástica de arquivos mantendo 100% do comportamento.
- **Implementações**:
  - Remoção de código morto (`firebaseExportService`, `migrationService`).
  - Fusão de componentes de UI (`ui/index.tsx`) e Layout (`layout/index.tsx`).
  - Fusão dos algoritmos do motor de pareamento (Swiss + Multiplayer) em `features/tournaments/pairingEngine.ts`.
  - Migração para arquitetura modular por features (`features/auth` e `features/tournaments`).
  - Simplificação total da camada de persistência (`storage.ts` limpo e `firestoreAdapter` fundido/deletado).
  - Redução de ~51% no volume de arquivos base.
  - **Tag**: `v1.0.1-faxina-stable` criada e enviada ao GitHub.

## 2026-03-07: Setup de Segurança e Backups
- **Objetivo**: Garantir que alterações pesadas não quebrem o projeto.
- **Implementações**:
  - Criação da Tag `v1.0.0-stable` como ponto de restauração.
  - Mudança para o branch `develop` para desenvolvimento ativo.
  - Estabelecimento desta camada de documentação (`HISTORICO.md`, `GUIA_PROJETO.md`).

## 2026-03-07: Finalização de Funcionalidades de Torneio
- **Objetivo**: Limpeza e deploy final das funções de torneio.
- **Implementações**:
  - Build e Deploy para Firebase Hosting.
  - Verificação da presença online.

## 2026-03-06: Fase 24 - Sincronização Otimizada e UX
- **Objetivo**: Redução de custos no Firestore e melhoria de UI.
- **Implementações**:
  - Sincronização via RTDB para reduzir leituras no Firestore.
  - Navbar com Glassmorphism.
  - Bottom Bar para Mobile.
  - Timer de rodada com notificações.
  - Submissão de Commander e Decklist URL.
  - Regras de Segurança do Firestore para perfis públicos.

---
*Para ver as regras vigentes do projeto, consulte o [GUIA_PROJETO.md](./GUIA_PROJETO.md).*
