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
4. Abra https://www.youtube.com e use o popup para ativar/desativar.
5. Para atualizar o codigo, clique em Reload em chrome://extensions.

## Configuracao e comportamento
- Preset atual: work (fixo por enquanto).
- Regras de foco ficam em `src/content/content_script.js` (SHORTS_CSS, HOME_CSS, WATCH_CSS).
- O overlay da Home aparece quando o modo foco esta ativo na Home.
- O overlay e suprimido ao clicar no campo de busca (por alguns segundos ou enquanto estiver focado).
- Autoplay e desativado via seletor `.ytp-autonav-toggle-button`.
- Snooze salva `snoozeUntil` em `chrome.storage.local` e reativa via alarm.

## Testes manuais
- Use a matriz em `docs/matriz-testes-manuais.md`.

## Privacidade e permissoes
- Nenhum dado sai do navegador.
- Permissoes usadas: `storage`, `alarms` e acesso a `https://www.youtube.com/*`.

## Roadmap
- Preset personalizavel e whitelist de canais.
- Atalhos de teclado e regras por horario.

## Contribuindo e manutencao
- Atualize este README quando mudar estrutura, seletores ou comportamento.
