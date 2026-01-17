# Matriz de Testes Manuais (v0.1)

Este documento valida o comportamento atual da extensao no YouTube.

## Preparacao
- Carregar a extensao via "Load unpacked" apontando para a raiz do projeto.
- Abrir o YouTube logado.
- Garantir que o Modo Foco esteja desligado antes de iniciar.

## Rotas
- Home: https://www.youtube.com/
- Watch: https://www.youtube.com/watch?v=VIDEO_ID
- Shorts: https://www.youtube.com/shorts/VIDEO_ID

## Casos Principais
1) Toggle ON/OFF
- Ativar o Modo Foco no popup.
- Confirmar que o feed principal some na Home.
- Desativar e confirmar que tudo volta.

2) Home bloqueada
- Com Modo Foco ON, acessar Home.
- Ver overlay com CTAs (Buscar, Inscricoes, Historico, Sonecar).
- Clicar em Buscar e confirmar foco no campo de busca.

3) Shorts na Home
- Confirmar que o shelf de Shorts nao aparece.
- Seletores alvo:
  - #contents > ytd-rich-section-renderer:nth-child(12)
  - ytd-rich-shelf-renderer[is-shorts]
  - a.reel-item-endpoint[href^="/shorts/"]

4) Menu lateral
- Confirmar que o item Shorts nao aparece.
- Seletor alvo: #items > ytd-guide-entry-renderer:nth-child(2)

5) Watch (Related)
- Acessar um video com Modo Foco ON.
- Confirmar que a coluna de recomendados some.
- Seletor alvo: #secondary

6) Autoplay
- Acessar Watch com Modo Foco ON.
- Confirmar que o autoplay fica desativado.
- Seletor alvo: .ytp-autonav-toggle-button
