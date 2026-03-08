# 🛠️ Guia do Projeto FlashPoint

Este guia contém as regras fundamentais e comandos essenciais para o desenvolvimento do FlashPoint.

## 🚩 Regras de Ouro (Firebase Free Tier)

O projeto deve sempre priorizar o **Plano Gratuito (Spark)** do Firebase.

1.  **Sincronização**: Usar RTDB para sinais de atualização para evitar leituras excessivas no Firestore.
2.  **Imagens**: Nunca hospedar imagens no Firebase Storage. Usar links externos (Scryfall, etc).
3.  **Segurança**: Consultas devem sempre ter `limit` e regras de segurança rígidas.
4.  **Cloud Functions**: Evitar o uso, pois tornam-se pagas rapidamente.

## 🚀 Comandos Essenciais

### Versionamento e Fluxo de Trabalho
- **Trabalho Ativo**: Sempre no branch `develop`.
- **Produção/Estável**: Branch `main`.
- **Checkpoint de Milestone (Tag)**: `git tag -a v1.X.X -m "Descrição"` (ex: `v1.0.1-faxina-stable`).
- **Rollback (Viagem no Tempo)**:
  - Para ver uma versão específica: `git checkout vX.Y.Z`
  - Para voltar a desenvolver de um ponto anterior: `git checkout -b novo-galho vX.Y.Z`

### Deploy
- **Ambiente de Testes (Firebase Hosting)**: `npm run build; firebase deploy --only hosting`

## 🏗️ Arquitetura
- **Stack**: React + TypeScript + Vite.
- **Estilização**: CSS Vanilla (priorizando performance e customização).
- **Mobile**: Capacitor para build Android/iOS.

---
*Para ver o que já foi feito, consulte o [HISTORICO.md](./HISTORICO.md).*
