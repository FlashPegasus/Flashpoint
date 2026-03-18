# FlashPoint — NewArea Handoff
## Para: Antigravity / IDE | Página unificada Jogador↔Organizador

---

## Contexto

Esta é a nova versão unificada da `MyArea`, acessível via `/new-area` durante o período de testes.
Ela substitui funcionalmente:
- `src/pages/MyArea.tsx` — dashboard do jogador/organizador
- `src/pages/Profile.tsx` — stats e histórico (parcialmente)
- `src/pages/Leagues.tsx` — lista de ligas (virou drawer inline)

A versão atual (`/my-area`) **permanece intacta** até aprovação final.

---

## Arquivos a criar / modificar

```
CRIAR:   src/pages/NewArea.tsx          ← arquivo entregue neste handoff
MODIFICAR: src/App.tsx                  ← adicionar rota + import
MODIFICAR: src/components/layout/NavBar (ou TopNav)  ← botão de comparação
```

---

## Passo 1 — Instalar `NewArea.tsx`

Copie o arquivo `NewArea.tsx` entregue para:
```
src/pages/NewArea.tsx
```

Nenhuma dependência nova — usa apenas stores e serviços já existentes:
- `useAuthStore` — user, updateProfile
- `useTournamentStore` — tournaments, loadTournaments
- `useLeagueStore` — myLeagues, loadMyLeagues, joinLeagueByCode
- `tournamentService` — getUserStats, deleteTournament, removeParticipant, withdrawParticipant

---

## Passo 2 — Registrar rota em `App.tsx`

### 2a. Adicionar o import (junto com os outros imports de páginas):

```tsx
import NewArea from './pages/NewArea';
```

### 2b. Adicionar a rota (após a rota `/my-area`):

```tsx
<Route path="/new-area" element={<ProtectedRoute><NewArea /></ProtectedRoute>} />
```

### Resultado esperado em App.tsx:

```tsx
import NewArea from './pages/NewArea';   // ← ADICIONAR

// dentro de <Routes>:
<Route path="/my-area"   element={<ProtectedRoute><MyArea /></ProtectedRoute>} />
<Route path="/new-area"  element={<ProtectedRoute><NewArea /></ProtectedRoute>} />  // ← ADICIONAR
```

---

## Passo 3 — Botão de comparação na Topbar

Localizar o componente da nav superior em `src/components/layout/`.
Provável nome: `NavBar.tsx`, `TopNav.tsx` ou `Header.tsx`.

### 3a. Adicionar imports necessários:

```tsx
import { useLocation, useNavigate } from 'react-router-dom';
```

(Se já existirem, não duplicar.)

### 3b. Adicionar variáveis auxiliares dentro do componente:

```tsx
const location  = useLocation();
const navigate  = useNavigate();
const showBeta  = ['/my-area', '/new-area'].includes(location.pathname);
const isNewArea = location.pathname === '/new-area';
```

### 3c. Adicionar o botão no JSX da nav:

Colocar como **primeiro filho** do elemento raiz da nav, antes de qualquer outro item.
O elemento raiz da nav precisa ter `position: relative` (provavelmente já tem).

```tsx
{showBeta && (
  <button
    onClick={() => navigate(isNewArea ? '/my-area' : '/new-area')}
    style={{
      position: 'absolute',
      left: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      padding: '4px 10px',
      borderRadius: '100px',
      border: '1px solid rgba(212,172,13,0.4)',
      background: isNewArea ? 'rgba(212,172,13,0.15)' : 'rgba(212,172,13,0.06)',
      color: '#d4ac0d',
      fontSize: '10px',
      fontFamily: "'Outfit', sans-serif",
      fontWeight: 700,
      letterSpacing: '0.5px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      whiteSpace: 'nowrap',
      zIndex: 10,
    }}
  >
    {isNewArea ? '← Área Atual' : '✦ New Area'}
  </button>
)}
```

**Comportamento:**
- Aparece **somente** em `/my-area` e `/new-area`
- Em `/my-area` mostra `✦ New Area` → navega para `/new-area`
- Em `/new-area` mostra `← Área Atual` → navega para `/my-area`
- Em qualquer outra página: invisível

---

## Passo 4 — Verificar export do useLeagueStore

O `NewArea.tsx` usa `loadMyLeagues` e `myLeagues` do `useLeagueStore`.
Verificar se esses campos existem no store:

```ts
// src/features/leagues/leagueStore.ts
// Deve conter:
myLeagues: League[]
loadMyLeagues: (userId: string) => Promise<void>
joinLeagueByCode: (code: string, userId: string, userName: string) => Promise<League>
```

Se `myLeagues` / `loadMyLeagues` não existirem com esses nomes exatos,
ajustar o import no `NewArea.tsx` para usar o nome correto do store.

---

## O que NÃO tocar

```
src/pages/MyArea.tsx          → manter intacto
src/pages/Leagues.tsx         → manter intacto
src/features/               → nenhum store alterado
src/components/ui/          → nenhum componente alterado
firestore.rules             → sem alterações
```

---

## Checklist

- [ ] `src/pages/NewArea.tsx` criado
- [ ] Import `NewArea` adicionado em `App.tsx`
- [ ] Rota `/new-area` adicionada em `App.tsx`
- [ ] Botão `✦ New Area` aparece ao visitar `/my-area`
- [ ] Botão `← Área Atual` aparece ao visitar `/new-area`
- [ ] Botão some em outras páginas
- [ ] Toggle Jogador/Organizador funciona (fade entre os dois lados)
- [ ] Ligas aparecem em scroll horizontal
- [ ] Clicar numa liga abre o drawer com ranking
- [ ] Drawer "Entrar via código" funciona (usa `joinLeagueByCode`)
- [ ] Drawer "Criar Liga" redireciona para `/league/create`
- [ ] Torneios do organizador mostram botão de excluir no hover
- [ ] Torneios do jogador mostram posição e botões de sair/desistir

---

## Como remover o botão (quando a New Area for aprovada)

Quando `/new-area` estiver pronta para substituir `/my-area` definitivamente:

### 1. Em `App.tsx`:
```tsx
// REMOVER:
import NewArea from './pages/NewArea';
<Route path="/new-area" element={<ProtectedRoute><NewArea /></ProtectedRoute>} />

// TROCAR o elemento da rota /my-area:
// DE:   element={<ProtectedRoute><MyArea /></ProtectedRoute>}
// PARA: element={<ProtectedRoute><NewArea /></ProtectedRoute>}
```

### 2. Na Topbar:
```tsx
// REMOVER o bloco inteiro:
{showBeta && ( <button ...> )}

// REMOVER as variáveis auxiliares:
const showBeta  = ...
const isNewArea = ...
```

### 3. Arquivos a deletar:
```bash
src/pages/MyArea.tsx      # fazer backup antes
src/pages/Leagues.tsx     # lista de ligas — substituída pelo drawer
```

### 4. Rotas que podem ser removidas do App.tsx:
```tsx
// REMOVER (funcionalidade absorvida pelo drawer):
<Route path="/leagues" element={<Leagues />} />
```

> Nota: `/league/:id` (LeagueDashboard) e `/league/create` (LeagueCreate) permanecem —
> o drawer da New Area redireciona para essas rotas.
