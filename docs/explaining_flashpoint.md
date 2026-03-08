# 📖 FlashPoint: Como o seu projeto funciona (Por dentro do capô)

## Resumo Inicial
O **FlashPoint** não é apenas um site; é uma ferramenta pensada para crescer. Organizamos os arquivos de forma que cada função (como Torneios ou Ligas) seja independente, facilitando correções sem "quebrar o resto". Usamos o **Firebase** como memória principal por ser gratuito e extremamente seguro para os dados dos seus jogadores.

---

## Detalhamento: O que fizemos e como funciona

### 1. A Estrutura de Pastas (O "Quadro de Ferramentas")
Pense no projeto como uma oficina organizada. Em vez de jogar todas as chaves em uma gaveta só:
- **Features (Capacidades)**: Aqui guardamos o "conhecimento". Por exemplo, a pasta `leagues` sabe como contar pontos de liga, enquanto a pasta `tournaments` sabe como criar rodadas de jogo.
- **Pages (Telas)**: São as vitrines. Elas pegam esse "conhecimento" e mostram de forma bonita para o usuário final.
- **Components (Peças)**: São botões, modais e campos que desenhamos uma vez e usamos em todo lugar para que o app tenha um visual profissional.

### 2. A Memória e Sincronia (Firebase)
Usamos dois tipos de armazenamento:
- **Firestore (A Memória Permanente)**: Onde os pontos, nomes e regras ficam guardados para sempre. Lá criamos as "Subcoleções" (gavetas dentro de gavetas) para os Membros e Temporadas, para que carregar uma liga não trave o app.
- **Realtime Database (O Mensageiro)**: É como um "pager" ultra veloz. Quando um torneio termina, ele avisa todos os celulares dos jogadores na hora, sem gastar nada.

### 3. As Fases Recentes (26 e 27)
Fizemos o "coração" da liga bater:
- **Vinculação**: Os torneios agora conversam com as ligas.
- **Streaks (🔥)**: O sistema analisa o histórico e vê quem está "pegando fogo" com vitórias.
- **Gestão de Membros**: Criamos ferramentas para que você, como organizador, tenha o controle (incluindo banir comportamentos inadequados).
- **Salão da Fama**: Um espaço para manter a história dos campeões viva, mesmo quando o ranking é resetado.

---

## Por que fizemos assim?
- **Escalabilidade**: Se você tiver 10 ou 10.000 jogadores, o app se comporta da mesma forma.
- **Custo Zero**: Escolhemos tecnologias que permitem que você rode o app sem mensalidades, aproveitando os limites gratuitos do Google.
- **Segurança**: O sistema de "Audit Log" garante que nada importante aconteça sem deixar rastro, protegendo a integridade da sua liga.

---
*Este artigo resume o nosso progresso técnico até agora. Se desejar detalhes sobre algum desses pontos, é só perguntar!*
