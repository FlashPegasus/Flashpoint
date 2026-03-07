# 🚩 Regras de Desenvolvimento: Firebase Free Tier (Spark Plan)

Este projeto deve sempre Priorizar o Plano Gratuito do Firebase. Para garantir que o FlashPoint permaneça sustentável e sem custos financeiros para o usuário, as seguintes regras devem ser seguidas em todas as implementações:

## 1. Sincronização em Tempo Real
- **Evitar `onSnapshot` no Firestore** para dados que mudam com frequência ou para muitos usuários ao mesmo tempo, pois cada mudança conta como uma leitura paga.
- **Usar RTDB (Realtime Database) para Sinais**: Use o RTDB para armazenar apenas um timestamp de "última atualização" (`lastUpdated`). Os clientes ouvem este pequeno nó (custo de banda ínfimo) e fazem uma leitura única no Firestore apenas quando necessário.
- **Prefira Pull a Push**: Se o tempo real não for crítico, use botões de "Atualizar" ou timers de polling longos.

## 2. Armazenamento de Arquivos (Storage)
- **Não hospedar imagens pesadas**: Não use o Firebase Storage para imagens de cartas, comandantes ou capas de deck.
- **Links Externos**: Sempre exiba imagens a partir de URLs de provedores externos (ex: Scryfall API, Gatherer, links de redes sociais).

## 3. Consultas e Indexação
- **Minimize Leituras**: Agrupe dados quando possível, mas evite documentos gigantescos que excedam 1MB.
- **Segurança**: Mantenha regras de segurança que impeçam consultas excessivas (cláusulas `limit`).

## 4. Cloud Functions
- **Evite se possível**: Cloud Functions são pagas após um limite baixo. Prefira lógica no cliente ou Firebase Data Connect se disponível e gratuito.

---
*Esta regra foi estabelecida na Fase 24 do desenvolvimento.*
