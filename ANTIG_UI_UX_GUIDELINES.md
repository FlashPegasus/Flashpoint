# 🎨 FlashPoint UI/UX Design System & Guidelines

Este documento serve como a "Fonte da Verdade" para o design do projeto FlashPoint, garantindo consistência visual e experiência fluida entre todos os módulos.

## 🌈 Paleta de Cores (Tokens)

As cores são definidas no `index.css` e utilizam o prefixo `--fp-`.

### Core
- **Primary (Hi/Lo)**: `#e74c3c` / `rgba(192,57,43,0.12)` (Ruby/Vermelho FlashPoint)
- **Secondary**: `#7a5c5c` (Mauve/Muted)
- **Void (Background)**: `#0a0a0a` (Preto absoluto com granulação)
- **Glass (Cards)**: `rgba(255,255,255,0.03)` com `backdrop-filter: blur(20px)`

### Gamification & Status
- **Purple (Energy/Link)**: `#8b5cf6`
- **Emerald (Success/Online)**: `#10b981`
- **Rose (Battle/Alert)**: `#f43f5e`
- **Gold (Winner/Legend)**: `#d4ac0d`
- **Amber (Member/Participating)**: `#f59e0b`

---

## 🏛️ Hierarquia de Componentes

### 1. PageShell
Sempre envolva cada página com `<PageShell>`. Ele garante:
- Padding responsivo.
- Navegação (TopBar e BottomNav) integrada.
- Margem inferior para o menu mobile.
- Fade-in de entrada da página.

### 2. Premium Glass Cards
Utilize a classe `premium-glass` para containers de destaque.
```tsx
<div className="premium-glass p-6 border border-[var(--fp-border-hi)] shadow-[var(--fp-shadow-lg)]">
    {/* Conteúdo */}
</div>
```

### 3. Typography
- **Display**: Roboto / Outfit (Negrito, Uppercase, Tracking apertado).
- **Body**: Inter / Sans-serif (Leitura limpa).
- **Labels**: Uppercase, Tracking expandido (`tracking-widest`), fonte pequena (9-11px).

---

## ✨ Micro-Animações & Feedback

- **Transitions**: Sempre use `duration-300` e `var(--fp-ease)` para interações.
- **Hover States**:
  - Cards: `-translate-y-1` com `shadow-glow`.
  - Botões: `scale-105` no hover, `scale-95` no click.
- **Loading States**:
  - Use `LoadingScreen` para transições de rota pesadas.
  - Para botões, use spinners internos ou mude o texto para "Processando...".
- **Battle Glow**: Para elementos ao vivo ou em batalha, use a animação `animate-pulse` pulsando a cor correspondente.

---

## 📱 Mobile First Principles

1. **Top Nav Bump**: A logo central "Bump" deve ser mantida desimpedida.
2. **Bottom Nav Reach**: Itens críticos (Home, Minha Área, Perfil) devem estar no polegar.
3. **Hamburger Menu**: Use o menu lateral apenas para itens secundários ou de organização (Ligas, Ranking, Config).
4. **Touch Targets**: Botões devem ter no mínimo 44px de altura efetiva.

---

## 📝 Check-list do Desenvolvedor

- [ ] A página usa Semantic HTML (`<main>`, `<h1>`, etc.)?
- [ ] O contraste do texto está legível contra o fundo escuro?
- [ ] O `LoadingScreen` é exibido se os dados demorarem > 200ms?
- [ ] As cores seguem os tokens `--fp-` (não use cores fixas)?
- [ ] O design quebra em telas menores que 360px? (Deve ser responsivo).
