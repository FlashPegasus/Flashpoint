# FlashPoint - Documentação para TestSprite

Este documento resume o projeto FlashPoint para orientar a geração de planos de teste e execução no TestSprite.

## 1. Visão Geral do Projeto
O **FlashPoint** é uma plataforma de gestão de torneios e ligas para Trading Card Games (TCG), desenvolvida com foco em performance e experiência mobile (via Capacitor).

**Principais Funcionalidades:**
- **Descoberta:** Visualização de torneios e ligas públicos.
- **Gestão de Torneios:** Criação, pareamento (Swiss/Single Elimination), reporte de resultados e ranking.
- **Gestão de Ligas:** Agrupamento de torneios em uma estrutura de liga com ranking acumulado.
- **Área do Jogador/Organizador:** Dashboard unificado (NewArea) para gerenciar participações e eventos organizados.
- **QR Code:** Integração para entrada rápida em torneios.
- **Reporte Local:** Jogadores podem reportar resultados de suas próprias mesas.

## 2. Stack Tecnológica
- **Frontend:** React 19 + TypeScript + Vite.
- **Estilização:** CSS Vanilla (com Tailwind configurado no ambiente, mas uso predominante de Vanilla para performance).
- **Backend/Storage:** Firebase (Firestore, Realtime Database para atualizações em tempo real, Hosting).
- **Mobile:** Capacitor (configurado para Android).
- **Gerenciamento de Estado:** Zustand.
- **Roteamento:** React Router DOM v7.

## 3. Arquitetura e Fluxos Principais

### Fluxos Chave para Testes
1. **Autenticação:** Login via Firebase Auth e proteção de rotas privadas.
2. **Ciclo de Torneio:**
   - Criação (`TournamentCreate.tsx`).
   - Inscrição via link ou busca (`JoinTournament.tsx`).
   - Gestão de rodadas e reporte de resultados pelo organizador (`TournamentDashboard.tsx`).
   - Reporte de resultado local pelo jogador (`NewArea.tsx`).
3. **Gestão de Ligas:** Criação de ligas e inclusão de torneios existentes para gerar rankings acumulados.

## 4. Diretrizes para Testes (TestSprite)

### Cenários de Alta Prioridade
- **Inscrição em Torneio:** Testar o fluxo de "Join" via código de acesso.
- **Reporte de Resultado:** Verificar se o resultado enviado pelo jogador reflete no dashboard do organizador.
- **Sorteio de Rodadas:** Testar o algoritmo de pareamento ao avançar para a próxima rodada.
- **Menu Mobile:** Verificar se os itens do menu "hambúrguer" estão clicáveis e funcionais.
- **Filtros:** Busca e filtragem de torneios por status (Ativos/Concluídos).

### Informações de Execução
- **Porta Local:** 5173 (Vite).
- **URL Base:** `http://localhost:5173/`.
- **Modo de Servidor:** Desenvolvimento (está rodando via `npm run dev`).

## 5. Estrutura de Código (Referência)
- `/src/pages`: Implementação das telas principais.
- `/src/components`: Componentes de UI (Modais, Cards, Navbars).
- `/src/lib/firebase.ts`: Configuração central do Firebase.
- `/src/utils`: Helpers de lógica de pareamento (Suíço, etc.).
