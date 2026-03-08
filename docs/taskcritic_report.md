# 🛡️ PLAN REVIEW (TaskCritic)

O plano do Arquiteto foca na organização dos arquivos e na divisão de responsabilidades. Ele aponta corretamente que o Dashboard está se tornando um "monolito" dentro da interface, mas precisamos ser críticos em outros pontos.

---

# ⚠️ POTENTIAL PROBLEMS

1.  **Gerenciamento de Cache**: O sistema usa RTDB para sinais de sincronia e Firestore para os dados. O Arquiteto não mencionou o risco de "delay" visual se a conexão do usuário for instável.
2.  **Complexidade de Subcoleções**: Ao mover dados para subcoleções (Membros, Log, Temporadas), ganhamos escalabilidade mas aumentamos a quantidade de "pedidos" (requests) para o Firebase. Isso precisa ser monitorado para não estourar a cota gratuita.
3.  **Acoplamento em `JoinLeague`**: O fluxo de entrada por código está muito dependente de um único componente. Se precisarmos de entrada por QR Code nativo no mobile futuramente, essa lógica precisará ser duplicada ou extraída.

---

# 📋 MISSING CONSIDERATIONS

- **Performance Mobile (Capacitor)**: O impacto de renderizar listas grandes de membros em dispositivos limitados não foi analisado.
- **Hierarquia de Permissões**: Atualmente a distinção entre Master/Admin/Moderator está no código, mas as regras de segurança do Firestore (firestore.rules) precisam garantir que um Moderador não apague a liga.

---

# 🚀 SUGGESTED IMPROVEMENTS

1.  **Firestore Rules Audit**: Validar se as regras de segurança bloqueiam edições da subcoleção de auditLog (que deve ser apenas escrita pelo sistema ou admin master).
2.  **Virtualization**: Implementar "Virtual Lists" se a lista de membros ou temporadas crescer para centenas de itens, para manter o app fluido.
3.  **Business logic split**: Garantir que o cálculo de Streaks permaneça 100% no Service, pois a UI não deve saber como as vitórias são contadas cronologicamente.

---

# ⚖️ FINAL VERDICT
**APPROVED (WITH CAUTIONS)** - A arquitetura está no caminho certo para a Phase 27, mas a "faxina" recomendada pelo arquiteto deve ser prioritária antes da Phase 28 para evitar débito técnico acumulado.
