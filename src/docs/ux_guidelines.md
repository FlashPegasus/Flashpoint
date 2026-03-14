# 🎨 FlashPoint UI/UX Style Guide v1.0
*Codename: MicroManaging*

Este documento serve como a "Bússola de Qualidade" para a Fase 31. Todas as novas implementações e refatorações devem seguir estas diretrizes para garantir uma experiência premium e consistente.

## 1. Cores e Branding
- **Primária**: `#c0392b` (Rubro FlashPoint) - Usada para ações principais e estados ativos.
- **Acento**: `#e67e22` (Abóbora/Energia) - Usada para destaques, avisos e gradientes secundários.
- **Dourado**: `#d4ac0d` (Vitória) - Reservado para troféus, rankings #1 e coroas.
- **Fundo**: `#0a0505` (Deep Black) com gradientes radiais sutis.
- **Bordas**: `rgba(255, 255, 255, 0.08)` para glassmorphism sutil.

## 2. Tipografia
- **Display (Títulos)**: `Cinzel Decorative` ou `Cinzel`. Letras maiúsculas, tracking largo (`tracking-widest`).
- **Corpo**: `Inter` ou `Roboto`. Foco em legibilidade e contraste.
- **Hierarquia**: Nunca use o mesmo peso de fonte para label e valor. Use `font-black` para números e `text-muted` para labels.

## 3. Espaçamento (The 4px Grid)
- **Interno (Padding)**: `p-4` (16px) ou `p-6` (24px) para cards.
- **Entre Seções**: `gap-8` (32px) ou `gap-12` (48px).
- **Cards**: Devem ter `rounded-2xl` (1rem) ou `rounded-3xl` dependendo do tamanho.

## 4. Efeitos e Feedback (Micro-Interactions)
- **Sombra**: Use `shadow-glow-primary` (sombra rubra suave) em botões e estados ativos.
- **Hover**: Todos os elementos clicáveis devem ter um `hover:scale-[1.02]` ou `hover:opacity-80` e `transition-all`.
- **Animações**: Use `animate-fade-in` em novas seções. Evite animações que bloqueiem o fluxo do usuário.

## 5. Mobile-First
- A **Bottom Bar** é sagrada. Itens críticos (Home, Torneios, Perfil) devem estar lá.
- Toques (Touch Targets) devem ter no mínimo `44x44px`.
- Use `container` e `px-4` para garantir que o conteúdo não encoste nas bordas.

## 6. checklist de "Qualidade Premium"
- [ ] O card tem um gradiente sutil de fundo?
- [ ] Existe uma borda fina (stroke) para destacar o card do fundo preto?
- [ ] As cores seguem a paleta oficial?
- [ ] O feedback visual ao clicar é imediato?
- [ ] O conteúdo está legível em telas pequenas?
