# 🛠️ Guia do Projeto FlashPoint

Este guia contém as regras fundamentais e comandos essenciais para o desenvolvimento do FlashPoint.

## 🚩 Regras de Ouro (Firebase Free Tier)

O projeto deve sempre priorizar o **Plano Gratuito (Spark)** do Firebase.

1.  **Sincronização**: Usar RTDB para sinais de atualização para evitar leituras excessivas no Firestore.
2.  **Imagens**: Nunca hospedar imagens no Firebase Storage. Usar links externos (Scryfall, etc).
3.  **Segurança**: Consultas devem sempre ter `limit` e regras de segurança rígidas.
4.  **Cloud Functions**: Evitar o uso, pois tornam-se pagas rapidamente.

## 🚀 Comandos Essenciais

### Versionamento e Segurança
- **Criar Ponto de Segurança (Tag)**: `git tag -a v1.X.X -m "Mensagem"`
- **Rollback (Voltar para Main)**: `git checkout main`
- **Voltar para Tag específica**: `git checkout v1.0.0-stable`

### Deploy
- **Ambiente de Testes (Firebase Hosting)**: `npm run build; firebase deploy --only hosting`

## 🏗️ Arquitetura
- **Stack**: React + TypeScript + Vite.
- **Estilização**: CSS Vanilla (priorizando performance e customização).
- **Mobile**: Capacitor para build Android/iOS.

---
*Para ver o que já foi feito, consulte o [HISTORICO.md](./HISTORICO.md).*
