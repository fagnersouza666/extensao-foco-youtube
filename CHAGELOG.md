# Changelog — YouTube Foco

Este arquivo registra mudanças e planos por versão.

## [1.1.0] — Planejado

### P0 — Obrigatório
- Página de opções (Configurações) para ajustes avançados sem lotar o popup.
  - Definir perfil padrão (ao instalar / ao abrir o YouTube).
  - Editar regras do perfil Personalizado com melhor UX (descrições + resets).
  - Toggle de debug (logs) diretamente na UI.
- Atalhos de teclado (commands):
  - Alternar Modo Foco.
  - Ativar Soneca 10 min.
- Robustez no YouTube (SPA):
  - Melhorar detecção de rota e evitar “piscar” (aplicar regras cedo e re-aplicar em navegação interna).
  - Consolidar seletores e reduzir falsos positivos.

### P1 — Importante
- Whitelist (exceções):
  - Exceções por canal (ex.: permitir Home/Related para canais específicos).
  - Exceções por rota (ex.: permitir Shorts somente quando o usuário abrir por link direto).
- Soneca configurável:
  - Permitir 5/10/15/30 min (mantendo 10 min como padrão).
  - Exibir contagem regressiva no popup/overlay.
- Aprimorar o overlay da Home:
  - Ações rápidas: abrir Inscrições, Histórico, Assistir mais tarde e Buscar.
  - Ajustes de acessibilidade (foco/teclado e contraste).

### P2 — Desejável
- Importar/exportar configurações (JSON local) para backup e troca de máquina.
- Mensagens mais claras quando uma regra não puder ser aplicada (ex.: autoplay “best effort”).
- Refino visual do popup (espaçamento e hierarquia, mantendo leve).

### Itens técnicos (chore)
- Atualizar documentação:
  - Explicar opções/atalhos novos no README.
  - Anotar mudanças no changelog do release 1.1.0.
- Empacotamento/release:
  - Padronizar nome do zip (youtube-foco-chrome-package-<versao>.zip).

### Fora de escopo (para depois)
- Sincronização em nuvem/conta.
- Coleta de métricas/telemetria.
- Suporte a múltiplos sites além do YouTube.
