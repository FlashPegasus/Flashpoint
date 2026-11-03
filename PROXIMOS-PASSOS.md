# FlashPoint — Onde paramos e para onde vamos

> Arquivo para qualquer IA (ou pessoa) retomar o trabalho de onde parou.
> Última atualização: 03/11/2026.

## Pastas — qual é qual

| Pasta | Papel |
|---|---|
| `C:\Users\gabri\FlashPoint-work` | **CÓDIGO-FOONTE OFICIAL.** Base boa (branch `feature/phase28-refactor`) + Estante de Decks + filtros da Minha Área. É desta pasta que se faz deploy. Branch de trabalho: `feature/estante-de-decks`. |
| `C:\Users\gabri\OneDrive\Área de Trabalho\gabri\Antig\FlashPoint` | Origem da base boa. Tem mudanças não commitadas que foram preservadas no checkpoint `9dfa4d6`. Não editar mais. |
| `C:\Users\gabri\FlashPoint-backup-0211` | Cópia de segurança da pasta Antig. Não editar. |
| `C:\Users\gabri\OneDrive\Documentos\Projetos\FlashPoint` | **NÃO USAR.** Código antigo sem Tracker/animacoes, causou incidente. Só tem histórico desta conversa. |

## Git — onde está o quê (pasta FlashPoint-work)

- Tag `checkpoint-producao-1f53f6` → commit `9dfa4d6`: estado exato que estava em produção em 29/08/2026 (deploy `1f53f6`), incluindo as mudanças não commitadas da pasta Antig.
- `b50e0a1` → Estante de Decks (rota `/estante`, popup de boas-vindas, seletor de deck na inscrição, visão Lista/Capas nos participantes).
- `feature/estante-de-decks` → branch atual, com a Estante + filtros da Minha Área + botões na página do evento (não commitado ainda, ver abaixo).
- Nada foi enviado ao GitHub (`git push` ainda não feito).

## O que já está pronto (novembro/2026)

1. **Estante de Decks** — rota `/estante` (só logados), 32 slots de Commander, IndexedDB local, popup de boas-vindas no 1º acesso, selo "NOVO" no menu, backup/share. Arquivos: `src/pages/CommanderVault.tsx`, `src/components/vault/`, `src/services/vault/`, `src/constants/vault/`, `src/styles/vault.css`, `src/types/vault.ts`.
2. **Escolher deck da Estante na inscrição** — em `JoinTournament.tsx`, seletor "Escolher da Estante de Decks" preenche comandante/imagem/decklist/apelido. `deckName` aceito em `tournamentService.ts` e no tipo `Participant`.
3. **Participantes: Lista | Capas** — em `TournamentDashboard.tsx`, toggle na aba de participantes. Padrão: Lista.
4. **Filtros na Minha Área** — `src/pages/MyArea.tsx`: chips (Ativos, Abertos, Em andamento, Concluídos, Cancelados, Ocultos, Todos), status `cancelled` com rótulo próprio, ordenação por STATUS_ORDER + data desc, filtro memorizado por modo em `localStorage` (`myarea.filter.organizer` / `myarea.filter.player`).
5. **Sair do torneio / ocultar da lista**:
   - `MyArea.tsx`: botões "Cancelar inscrição" (status registration) e "Desistir" (status ongoing) nos cards do jogador; ícone de olho cortado para ocultar/restaurar.
   - `TournamentPublic.tsx`: mesmos botões na sidebar da página do evento + "Remover da minha lista".
   - Ocultar grava `hiddenTournaments: string[]` no perfil do usuário no Firestore (`types/index.ts`), não apaga o torneio.
   - Cuidado: `aMyArea.tsx` é versão antiga/paralela, não está em uso no menu.

## Estado da produção

- Site: https://flashpoint-anti.web.app (também play.flash.dev.br), Firebase Hosting, projeto `flashpoint-anti`.
- **Publicado nesta data:** tudo listado em "O que já está pronto" (commit pendente de publicação: verificar último deploy).
- **Rollback:** console Firebase → Hosting → Release history → Rollback. Tags git: `checkpoint-producao-1f53f6` e anteriores (`v1.2.1` etc.).
- Regras do Firestore (`firestore.rules`) NÃO são publicadas junto com `--only hosting`.

## Próximos passos sugeridos

1. **Commitar** o que ficou de fora: `MyArea.tsx` (filtros) e `TournamentPublic.tsx` (botões sair/ocultar). Mensagem sugerida: `feat: filtros e acoes de jogador na Minha Area e pagina do evento`.
2. **`git push`** do branch `feature/estante-de-decks` + tag `checkpoint-producao-1f53f6` para o GitHub (hoje só existe local).
3. Considerar merge em `main` quando estável.
4. **Migrar Estante para Firestore** (hoje é IndexedDB do navegador, não sincroniza entre aparelhos).
5. **Selo NOVO do topo é fixo** (não some após welcome). Alinhar comportamento com o do menu mobile (some após popup).
6. Ideias fora do escopo (só se pedido): seções colapsáveis de histórico, busca por nome, cards de resumo clicáveis, destaque de ações pendentes.

## Armadilhas conhecidas

- **NUNCA deployar da pasta `Documentos\Projetos\FlashPoint`** — é código antigo, já sobrescreveu produção uma vez (rollback feito via console).
- `.env` não vai para o git (já está no `.gitignore` da FlashPoint-work).
- Site é PWA: depois de deploy, pode precisar fechar/reabrir ou Ctrl+F5.
- Menu inferior (BottomNav) só existe em telas pequenas; no desktop a navegação é a Navbar do topo (`src/components/layout/index.tsx`).
- tsc correto: `npx tsc --noEmit -p tsconfig.app.json` (o `tsconfig.json` raiz não checa nada).
- Verificação visual não substitui tsc: abrir o site/dev server e conferir a tela.
