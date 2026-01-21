# YouTube Foco

Extensão de navegador que reduz distrações no YouTube com modo foco e soneca.
Não coleta dados e não usa servidor.

## O que faz hoje
- Toggle de Modo Foco no popup.
- Perfis: Trabalho/Estudo, Moderado, Lazer e Personalizado.
- Oculta Shorts (menu, shelves e cards detectados).
- Oculta o feed da Home e mostra um overlay com ações intencionais.
- Oculta recomendados na página de vídeo (Watch).
- Desativa autoplay (best effort).
- Soneca de 10 minutos com religamento automático.
- Redireciona /shorts para /watch quando possível (ou para Home).

## Como instalar (Chrome/Edge)
1. Acesse chrome://extensions.
2. Ative "Developer mode".
3. Clique em "Load unpacked" e selecione a raiz deste repositório.
4. Abra https://www.youtube.com e use o popup para ativar/desativar.
5. Para atualizar o código, clique em "Reload" na página de extensões.

## Como usar
- Ligue o Modo Foco no popup.
- Escolha um perfil (Trabalho/Estudo, Moderado, Lazer ou Personalizado).
- No perfil Personalizado, você pode ajustar as regras (Shorts, Home, Related, autoplay).
- Se precisar pausar, clique em "Sonecar 10 min" no popup ou no overlay da Home.

## Diferenças entre perfis
- **Trabalho/Estudo**: oculta Shorts, oculta o feed da Home, oculta recomendados (Related) e desativa autoplay.
- **Moderado**: oculta Shorts, mantém o feed da Home, oculta recomendados e desativa autoplay.
- **Lazer**: oculta Shorts, mantém o feed da Home, mantém recomendados e não desativa autoplay.
- **Personalizado**: aplica as regras que você marcar no popup (Shorts, Home, Related, autoplay).

## Estrutura do projeto
```
├── src/
│   ├── assets/
│   │   ├── icons/          # Ícones da extensão
│   │   └── screenshots/    # Capturas para Chrome Web Store
│   ├── background/         # Service worker
│   ├── content/            # Content scripts
│   ├── css/                # Estilos
│   ├── html/               # Templates HTML
│   ├── js/                 # Lógica JavaScript
│   │   ├── services/       # Serviços (LLM, etc.)
│   │   └── utils/          # Helpers e utilidades
│   ├── shared/             # Código compartilhado
│   └── manifest.json      # Configuração MV3
├── dist/                  # Build minificado (gerado)
├── scripts/               # Scripts de build/utilidades
├── .context/              # Contexto AI
├── README.md
└── CHANGELOG.md
```

### Build

Para gerar a versão minificada:

```bash
npm install
npm run build
```

Ou diretamente:

```bash
./scripts/build.sh
```

O build gera a pasta `dist/` com JS/CSS minificados, pronto para produção.

## Configuração e comportamento
- Config salva em `chrome.storage.local` com a chave `focusConfig`.
- Regras de foco ficam em `src/content/content_script.js`.
- O overlay da Home aparece somente quando o modo foco está ativo e não está suprimido.
- O overlay é suprimido temporariamente ao focar a busca.
- Autoplay é desativado via seletor `.ytp-autonav-toggle-button` (best effort).
- Soneca usa `chrome.alarms` para religar automaticamente ao expirar.

### Debug
Para habilitar logs no console, defina `debug: true` no objeto `focusConfig` em `chrome.storage.local`.

## Privacidade e permissões
- Nenhum dado sai do navegador.
- Permissões usadas: `storage`, `alarms` e acesso a `https://www.youtube.com/*`.

## Limitações conhecidas
- O DOM do YouTube muda com frequência; seletores podem precisar de ajustes.
- Autoplay é desativado por seletor e pode falhar em mudanças futuras.

## Roadmap
- Refinos dos perfis e melhorias da configuração personalizada.
- Agenda por horário/dia.
- Whitelist de canais.

## Contato
- Nome: Fagner Sá de Souza
- Email: fagnersouza@gmail.com
- Twitter/X: @Fagner_Souza
