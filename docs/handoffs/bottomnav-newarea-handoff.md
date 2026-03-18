# FlashPoint — BottomNav Simplificado + Botão "New Area"
## Para: Antigravity | Dois entregáveis neste handoff

---

## ENTREGÁVEL 1 — BottomNav simplificado (3 itens)

### Arquivo: `src/components/layout/BottomNav.tsx`

Substitua o conteúdo do componente pelo código abaixo.
**Toda a lógica de autenticação/rota permanece igual** — só o visual e os itens mudam.

```tsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Compass, User } from 'lucide-react';
import { useAuthStore } from '../../features/auth/authStore';

const NAV_ITEMS = [
  { path: '/',         label: 'Home',       icon: Home    },
  { path: '/my-area',  label: 'Minha Área', icon: User    },
  { path: '/discover', label: 'Descobrir',  icon: Compass },
] as const;

export const BottomNav: React.FC = () => {
  const { user } = useAuthStore();
  const location = useLocation();

  // Ocultar nav em páginas que não precisam dela
  const hidden = ['/', '/login'].includes(location.pathname);
  if (hidden) return null;

  return (
    <>
      {/* Safe area spacer — empurra conteúdo acima da nav */}
      <div style={{ height: '72px' }} />

      <nav style={{
        position: 'fixed',
        bottom: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        background: '#16161f',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '100px',
        padding: '5px',
        boxShadow: '0 4px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        // Safe area para Android/iOS
        paddingBottom: 'max(5px, env(safe-area-inset-bottom, 5px))',
      }}>
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          // /my-area é protegida — redireciona para login se não autenticado
          const href = path === '/my-area' && !user ? '/login' : path;
          const isActive = location.pathname === path ||
            (path === '/my-area' && location.pathname.startsWith('/my-area'));

          return (
            <NavLink
              key={path}
              to={href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                padding: '8px 20px',
                borderRadius: '100px',
                textDecoration: 'none',
                fontSize: '10px',
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 700,
                letterSpacing: '0.3px',
                transition: 'all 0.25s ease',
                // active state
                background: isActive ? 'rgba(192,57,43,0.18)' : 'transparent',
                border: isActive ? '1px solid rgba(192,57,43,0.4)' : '1px solid transparent',
                color: isActive ? '#e74c3c' : '#7a5c5c',
                boxShadow: isActive ? '0 0 16px rgba(192,57,43,0.2)' : 'none',
              }}
            >
              <Icon
                size={18}
                style={{
                  color: isActive ? '#e74c3c' : '#7a5c5c',
                  transition: 'color 0.25s',
                }}
              />
              {label}
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};

export default BottomNav;
```

### O que muda vs. o atual

| Antes | Depois |
|---|---|
| 4+ itens (variável) | 3 itens fixos: Home · Minha Área · Descobrir |
| Pill de cor púrpura | Pill com acento rubro `#e74c3c` |
| Fundo genérico | `#16161f` — consistente com a nav superior |
| Safe area incerto | `env(safe-area-inset-bottom)` explícito |
| Item "Torneio ativo" | Removido — acesso via My Area |
| `/leagues` como item | Removido — vira drawer inline |

### O que NÃO muda
- Import em `App.tsx` — `<BottomNav />` já está lá, não mexer
- Export em `src/components/layout/index.ts` — já existe
- Lógica de ocultação em páginas específicas

---

## ENTREGÁVEL 2 — Botão "New Area" (modo comparação)

### Contexto
Botão temporário que aparece na topbar para acessar a nova
versão unificada da My Area durante testes. Permite comparar
lado a lado com a versão atual sem remover nada.

### Passo 1 — Criar a rota em `App.tsx`

```tsx
// Adicionar o import no topo (junto com os outros):
import NewArea from './pages/NewArea';   // ← criar este arquivo depois

// Adicionar a rota (dentro de <Routes>, após /my-area):
<Route path="/new-area" element={<ProtectedRoute><NewArea /></ProtectedRoute>} />
```

### Passo 2 — Adicionar o botão na topbar

Localize o componente da nav superior em `src/components/layout/`.
Provavelmente `NavBar.tsx`, `TopNav.tsx` ou similar.

Adicione este botão como **primeiro filho** do nav, posicionado à esquerda:

```tsx
import { useLocation, useNavigate } from 'react-router-dom';

// Dentro do componente, antes do return:
const location  = useLocation();
const navigate  = useNavigate();
const showBeta  = ['/my-area', '/new-area'].includes(location.pathname);
const isNewArea = location.pathname === '/new-area';

// No JSX da nav, antes de qualquer outro item:
{showBeta && (
  <button
    onClick={() => navigate(isNewArea ? '/my-area' : '/new-area')}
    style={{
      position: 'absolute',
      left: '12px',
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

O botão aparece **somente** nas páginas `/my-area` e `/new-area`.
Alterna entre as duas versões ao clicar.

### Passo 3 — Criar `src/pages/NewArea.tsx`

Por enquanto, um placeholder até a nova versão estar pronta:

```tsx
import React from 'react';
import PageShell from '../components/layout';

const NewArea: React.FC = () => {
  return (
    <PageShell>
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', gap: '12px', textAlign: 'center',
      }}>
        <div style={{
          padding: '8px 16px', borderRadius: '100px',
          background: 'rgba(212,172,13,0.1)',
          border: '1px solid rgba(212,172,13,0.3)',
          color: '#d4ac0d', fontSize: '11px', fontWeight: 700,
          letterSpacing: '2px', textTransform: 'uppercase',
        }}>
          ✦ New Area — Em Desenvolvimento
        </div>
        <p style={{ color: '#7a5c5c', fontSize: '13px', maxWidth: '300px', lineHeight: 1.6 }}>
          A nova Minha Área unificada será implementada aqui.
          Use o botão na topbar para voltar à versão atual.
        </p>
      </div>
    </PageShell>
  );
};

export default NewArea;
```

---

## COMO REMOVER O BOTÃO (quando chegar a hora)

Quando a New Area estiver aprovada e pronta para substituir a atual:

**1. Em `App.tsx`:**
```tsx
// REMOVER esta linha:
import NewArea from './pages/NewArea';

// REMOVER esta rota:
<Route path="/new-area" element={<ProtectedRoute><NewArea /></ProtectedRoute>} />

// TROCAR a rota da my-area para apontar para o novo componente:
import MyAreaNew from './pages/MyAreaNew'; // ou renomear o arquivo
<Route path="/my-area" element={<ProtectedRoute><MyAreaNew /></ProtectedRoute>} />
```

**2. Na topbar (NavBar/TopNav):**
```tsx
// REMOVER o bloco inteiro:
{showBeta && (
  <button onClick={...}>
    ...
  </button>
)}

// REMOVER as variáveis auxiliares:
const showBeta  = ...
const isNewArea = ...
```

**3. Deletar arquivos:**
```bash
rm src/pages/NewArea.tsx      # placeholder
rm src/pages/MyArea.tsx       # versão antiga (fazer backup antes)
# renomear MyAreaNew.tsx → MyArea.tsx
```

**4. Rota `/my-area` continua igual** — nenhuma mudança no `BottomNav` necessária.

---

## CHECKLIST DE APLICAÇÃO

- [ ] `BottomNav.tsx` substituído — 3 itens, pill rubro
- [ ] Nav visualmente oculta em `/` e `/login`
- [ ] Safe area do Android funcionando (testar no Capacitor)
- [ ] Rota `/new-area` adicionada no `App.tsx`
- [ ] Import `NewArea` adicionado no `App.tsx`
- [ ] `NewArea.tsx` criado como placeholder
- [ ] Botão "New Area / ← Área Atual" visível ao acessar `/my-area`
- [ ] Botão some em outras páginas
- [ ] Botão alterna corretamente entre `/my-area` e `/new-area`
