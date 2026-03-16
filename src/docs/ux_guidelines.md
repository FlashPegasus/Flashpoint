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
- [ ] O card tem um gradiente sutil de fundo? sim
- [ ] Existe uma borda fina (stroke) para destacar o card do fundo preto?
- [ ] As cores seguem a paleta oficial?
- [ ] O feedback visual ao clicar é imediato?
- [ ] O conteúdo está legível em telas pequenas?


7 minhas  observacoes

quando nos vemos a rodada final de um torneio, os jogadores que estão em primeiro lugar deveriam ter uma coroa, os que estão em segundo lugar deveriam ter uma medalha de prata e os que estão em terceiro lugar deveriam ter uma medalha de bronze.
alem disso a mesa concluida com um  jogador vitorioso , poderia ter um  trofeu  nela
  na classificacao em tempo real,  vamos garantir que os resultados que foram informados , ja estao disponiveis  pra visualizacao ( checar os impactos na peerformance e custos)

  vamos garantir que os convidados nao gerem excesso de dados inuteis no backend  , possivelmente vamos programar uma rotina para limpar os dados dos convidados apos um certo tempo , ou quando o torneio for encerrado

  durante nossa fase de desenvolvimento vamos manter os dados atuais , mas  gere um lembrete para nossa primeira fase publica real para limpar a base de toorneios e ligas

  nossas ligas devem ter um, sistema de seguranca para impedir que qualquer pessoa possa criar uma liga com o nome de outra liga existente , alem disso popssa gerar torneios  falsos com intuito de modificar dados da liga
  algo interessante eh que ao selecionar a liga que vai ser vinculado o torneio  solicite uma confirmacao do usuario para vincular o torneio a liga e uma confirmacao de um master da liga, adm ou outra pessoa com permissao para isso

  alem disso no momento que existirem diversas ligas criadas, nao faz sentido mostrar todas as ligas para o usuario , vamos mostrar apenas as ligas que ele participa e mais algumas ligas em destaque
  
 no perdil do jogador nao faz sentido termos a opcao de visualizar novamente  jogador/ organizador, visto que essa opcao de intercambio ja esta na barra superiora

 da mesma forma no perfil de organizador nao faz sentido termos a opcao de visualizar novamente  jogador/ organizador, visto que essa opcao de intercambio ja esta na barra superiora

 em nossos alertas, quando o usuario for convidado para um torneio , o alerta deve ter um botao para aceitar e um botao para recusar 
 alem disso  precisamos incluir a opcao de vuscar jogador por nome ou por codigo 
 na visualizacao do torneio  como organizador nao vejo opcao de  entrar tambem ( algo comotambem vou jogar! )

na pagina punblica do torneio temos alguns ajustes tambem
vemos um map do site que mostra  o caminho home/descobrir/nome do toeneio, contud isso quebra um pouco a imersao visto que nao temos ussa opcao no site inteiro, faz mais sentido tirar e manter a navegacao como esta no resto da interface.

na  pagina do toeneio tambem  notei que as cores nao estao 100% de acordo com o que foi definido no style guide  e em um evento teste que criei vejo que  o estatus esta ao vivo, ha uma mensagem  de entrda tardia, mas tambem aparaece  o botao de encerrado, nao ficou clarto o que deveria aparecer ou significar aqui. segue o caminho do  toeneio criado paraverificar http://localhost:5173/tournament/a8224e5f-cb28-438b-b279-0e6b4e52fbb9/public

em nossa proxima fase de ajustes vamos ver  como melhorar os algoritimos de criacao de torneio e pareamento de competidores, irei preparar um handoff para isso, deixe em nossso roadmap


voltando na aba de rodadas, dentro do torneio, verifiquei algo estranho, trenho a opcao de regerar as rodadas, certo? mas quando faco isso  estou gerando novas rodadas. o correto seria refazer o sorteio da rodada atual concorda?
