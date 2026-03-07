# 📜 Histórico do Projeto FlashPoint

Este arquivo serve como um diário de bordo da evolução do projeto. Cada "Fase" concluída deve ser registrada aqui para manter a continuidade do desenvolvimento.

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
