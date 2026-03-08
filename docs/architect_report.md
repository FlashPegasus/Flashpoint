# 🏛️ PROJECT OVERVIEW (Architect)

O **FlashPoint** é uma plataforma robusta projetada para gerenciar torneios e ligas de jogos de cartas (TCG). Ele foi construído com ferramentas de última geração (**React**, **TypeScript**, **Firebase**) voltadas para escalabilidade e baixo custo de operação.

### Composição do Projeto
- **`src/features/`**: Onde as regras de negócio de **Torneios** e **Ligas** residem. É o cérebro da aplicação.
- **`src/pages/`**: Onde as telas finais são montadas, agrupando interface e lógica.
- **`src/components/`**: Peças de montar (Botões, Modais, Cards) que garantem um visual padrão em todo o app.
- **`src/lib/`**: As portas de saída para o mundo exterior (Conexão direta com Firestore e Realtime DB).

---

# ⚠️ ARCHITECTURE ISSUES

1.  **Dashboard Saturado**: O arquivo `LeagueDashboard.tsx` cresceu significativamente. Ele gerencia muitas responsabilidades (Membros, Temporadas, Info, Ranking) no mesmo lugar.
2.  **Lógica Fragmentada**: Parte da inteligência de "como os pontos são calculados" está em serviços (`leagueService`), enquanto o controle de "o que mostrar na tela" está no componente principal. Esse limite poderia ser mais claro.
3.  **Complexidade das Abas**: As abas internas (Membros e Temporadas) foram implementadas como blocos de código gigantes dentro da página, em vez de componentes independentes.

---

# 💡 RECOMMENDATIONS

1.  **Fragmentação de UI**: Mover as seções de "Membros" e "Salão da Fama" para componentes próprios em `src/features/leagues/components/`.
2.  **Abstração de Estado**: Centralizar o controle das temporadas e membros em um Custom Hook (`useLeagueData`) para deixar o Dashboard apenas com a tarefa de desenhar.
3.  **Generalização de Audit**: Padronizar como as ações são registradas no `auditLog`, criando um utilitário que possa ser usado por outras partes do app no futuro.
