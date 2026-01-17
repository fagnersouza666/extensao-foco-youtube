# Extensao Modo Foco para YouTube

Extensao MV3 que reduz distracoes no YouTube com modo foco, presets e soneca.
Sem coleta de dados, sem servidor.

## Funcionalidades (v0.1)
- Toggle Modo Foco ON/OFF no popup
- Preset Trabalho/Estudo (fixo por enquanto)
- Oculta Shorts (menu e shelves)
- Oculta feed principal da Home e mostra overlay com CTAs
- Oculta recomendados no Watch
- Desativa autoplay
- Soneca de 10 minutos com religamento automatico
- Redireciona /shorts para /watch quando possivel

## Estrutura do projeto
- manifest.json
- src/background/service_worker.js
- src/content/content_script.js
- src/ui/popup/popup.html
- src/ui/popup/popup.js
- src/ui/popup/popup.css
- docs/prd.md
- docs/matriz-testes-manuais.md

## Como usar (Chrome)
1. Acesse chrome://extensions
2. Ative "Developer mode"
3. Clique em "Load unpacked" e selecione a raiz do repo
