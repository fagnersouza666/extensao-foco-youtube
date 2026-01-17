# Extensão Modo Foco para YouTube

Extensão MV3 que reduz distrações no YouTube com modo foco, presets e soneca.
Sem coleta de dados, sem servidor.

## Funcionalidades (v0.1)
- Toggle Modo Foco ON/OFF no popup
- Preset Trabalho/Estudo (fixo por enquanto)
- Oculta Shorts (menu e shelves)
- Oculta feed principal da Home e mostra overlay com CTAs
- Oculta recomendados no Watch
- Desativa autoplay
- Soneca de 10 minutos com religamento automático
- Redireciona /shorts para /watch quando possível

## Estrutura do projeto
- manifest.json
- src/background/service_worker.js
- src/content/content_script.js
- src/shared/constants.js
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
5. Para atualizar o código, clique em Reload em chrome://extensions.

## Configuração e comportamento
- Preset atual: work (fixo por enquanto).
- Regras de foco ficam em `src/content/content_script.js` (SHORTS_CSS, HOME_CSS, WATCH_CSS).
- O overlay da Home aparece quando o modo foco está ativo na Home.
- O overlay é suprimido ao clicar no campo de busca (por alguns segundos ou enquanto estiver focado).
- Autoplay é desativado via seletor `.ytp-autonav-toggle-button`.
- Snooze salva `snoozeUntil` em `chrome.storage.local` e reativa via alarm.

## Privacidade e permissões
- Nenhum dado sai do navegador.
- Permissões usadas: `storage`, `alarms` e acesso a `https://www.youtube.com/*`.

### Política de privacidade (produto)
* "Não coletamos dados, não usamos analytics, não enviamos nada para servidores."

## Roadmap
- Preset personalizável e whitelist de canais.
- Atalhos de teclado e regras por horário.

## Contribuindo e manutenção
- Atualize este README quando mudar estrutura, seletores ou comportamento.
