# PRD — Extensão “Modo Foco” para YouTube (MV3, open-source, 100% grátis)

## 1) Visão do produto

**Uma extensão de navegador Chrome que transforma o YouTube em ferramenta**, reduzindo gatilhos de distração (Shorts, feed infinito, recomendações agressivas) por meio de **presets de foco**, **toggle rápido**, e um **botão de pânico (soneca de 10 min)**.
Funciona de forma robusta em um site **SPA** (YouTube) usando **CSS + MutationObserver + detecção de rota**.

**Proposta de valor (1 frase):**

> “Assista ao que você escolheu — sem o YouTube te puxar para o que você não escolheu.”

---

## 2) Objetivos e métricas de sucesso

### Objetivos (v0.1)

* Entregar um **Modo Foco confiável** (não “anti-Shorts frágil”) para rotas principais: Home, Watch, Shorts.
* Permitir **ligar/desligar** e **sonecar por 10 minutos** sem precisar recarregar a página.
* Preset “**Trabalho/Estudo**” pronto e eficaz.

### Métricas de sucesso (indicativas, sem tracking obrigatório)

* **Taxa de retenção** (usuário mantém instalado e usando após 7/30 dias) — observável via feedback/estrelas/issues.
* **Estabilidade**: número de bugs críticos abertos relacionados a elementos voltando após navegação.
* **Adoção de soneca**: relatos/feedback de utilidade (“panic button”).
* **Tempo até correção** quando o YouTube muda o DOM (SLA comunitário via releases rápidas).

> Nota: como a política é “zero coleta”, métricas dependem de sinais públicos (issues, reviews, estrelas, forks).

---

## 3) Público-alvo e problema

### Usuários primários

* Pessoas que usam YouTube para **trabalho/estudo** (tutoriais, palestras, aulas) e perdem foco com feed/recomendações/Shorts.
* Pessoas que querem consumo **moderado**, sem bloqueios extremos, mas com redução de “armadilhas”.

### Dor atual

* YouTube é desenhado para **retenção**: feed infinito, recomendações, autoplay e Shorts criam ciclos de distração.
* Soluções “só CSS” quebram com mudanças do YouTube (SPA e DOM dinâmico).

---

## 4) Escopo do produto

### O que está IN (v0.1 — lançável)

* **Toggle Modo Foco ON/OFF** (no popup).
* **Preset “Trabalho/Estudo”**:

  * Remover **Shorts** (menu, prateleiras/shelves, busca, canais).
  * Remover/neutralizar **Home feed** (feed infinito).
  * Remover **Recomendados/Related** na página de vídeo.
  * **Desativar Autoplay**.
* **Panic button / Soneca 10 min**:

  * Desliga o Modo Foco por 10 minutos e **religa automaticamente**.
* **Bloqueio de rota Shorts**:

  * Ao entrar em `/shorts/...`, **bloquear** e redirecionar (para Home “bloqueada” ou converter para `/watch` quando possível).

### O que está IN (v0.2 — diferencial forte)

* **Agenda** (ex.: seg–sex 9h–18h) para ligar/desligar automaticamente ou aplicar preset específico.
* **Whitelist por canal** (permitir recomendações/Shorts apenas de canais escolhidos).

### O que está IN (v1.0 — maturidade)

* Preset **Custom** (regras granulares) + **export/import** de configuração.

### Fora de escopo (para evitar “bomba”)

* Promessa de “bloqueio 100% infalível”.
* Dezenas de opções na v1 (UI inchada / manutenção infernal).
* Coleta de dados/analytics/servidor.
* Permissões além do necessário (ex.: `tabs`, `webRequest`) sem justificativa forte.

---

## 5) Presets (definição)

### Preset: Trabalho/Estudo (v0.1)

**Filosofia:** permitir apenas ações intencionais: buscar, abrir inscrições, assistir um vídeo escolhido.

Regras:

* **Home (`youtube.com/`)**: interceptar e exibir estado “Modo Foco ligado” com CTAs:

  * **Buscar** (focar a barra de busca)
  * **Inscrições**
  * **Histórico** (opcional)
  * **Desligar 10 min**
* **Watch (`/watch?v=...`)**:

  * Remover **sidebar “Próximos/Related”**
  * Desativar **autoplay**
  * (Opcional se viável) reduzir **end screens** / overlays intrusivos
* **Shorts (`/shorts/...`)**:

  * Bloquear e redirecionar (Home bloqueada ou tentar conversão para watch)

### Preset: Moderado (planejado)

* Remove Shorts e recomendações agressivas, mantém Inscrições, e não bloqueia Home (ou “home mais limpo”).

### Preset: Lazer (planejado)

* Próximo do padrão, com opção de remover Shorts.

> Decisão de “rigidez” (Hard vs Soft): o PRD suporta ambos como presets. Para posicionamento “Modo Foco”, recomenda-se **Hard Focus como padrão** (menor ambiguidade, maior entrega de valor). Soft Focus pode ser alternativa.

---

## 6) Experiência do usuário (UX)

### Superfícies

1. **Popup**

   * Toggle ON/OFF
   * Selector de preset (Work/Moderate/Lazer/Custom quando existir)
   * Botão **Sonecar 10 min**
   * Status (ex.: “Ligado — Trabalho/Estudo”, “Soneca até 14:32”)

2. **Tela/Estado na Home (quando bloqueada)**

   * Mensagem: “Modo Foco ligado. Use a busca ou vá para Inscrições.”
   * Botões: Buscar | Inscrições | (Histórico) | Desligar 10 min

3. **Options Page (v0.2+)**

   * Agenda (dias/horários)
   * Whitelist de canais
   * Regras avançadas (v1.0)

### Fluxos principais

**Fluxo A — Ligar modo foco**

1. Usuário abre popup → ativa toggle ON → escolhe “Trabalho/Estudo”.
2. Content script aplica regras imediatamente na aba atual e em navegações futuras.

**Fluxo B — Entrar na Home**

1. Usuário navega para `youtube.com/`
2. Extensão intercepta e substitui a experiência por um “painel foco” com CTAs.

**Fluxo C — Assistir vídeo**

1. Usuário abre `/watch?v=...`
2. Vídeo toca normalmente, porém sem related/autoplay.

**Fluxo D — Cair em Shorts**

1. Usuário abre `/shorts/...`
2. Extensão bloqueia e redireciona.

**Fluxo E — Panic button**

1. Usuário clica “Desligar 10 min” (popup ou Home bloqueada)
2. Modo Foco desativa até `snoozeUntil` e religa automaticamente.

---

## 7) Requisitos funcionais

### RF-01 — Toggle global

* Usuário consegue ligar/desligar o Modo Foco.
* Deve refletir imediatamente na UI e na página (sem reload sempre que possível).

### RF-02 — Presets

* Sistema de presets com conjunto fixo de regras por preset.
* Preset ativo persistido em `storage`.

### RF-03 — Bloqueio/Intercepção de rotas (SPA)

* Detectar mudança de rota sem reload (YouTube SPA).
* Ao detectar rota, aplicar regras correspondentes.

### RF-04 — Remoção/ocultação de elementos

* Shorts: ocultar entradas em menu/shelves/resultados/canais (dentro do viável).
* Home feed: ocultar feed infinito ou substituir por tela foco.
* Related: ocultar sidebar “Próximos/Related” no watch.

### RF-05 — Autoplay off

* Garantir autoplay desativado no watch (preferência + fallback por DOM).

### RF-06 — Soneca 10 minutos

* Botão que desativa temporariamente, grava `snoozeUntil`, e reativa quando expirar.
* Deve sobreviver a refresh/restart do navegador.

### RF-07 — Redirecionamento de Shorts

* Ao entrar em `/shorts/`, redirecionar para uma rota segura (Home bloqueada ou watch quando conversível).

---

## 8) Requisitos não funcionais

### RNF-01 — Robustez em DOM dinâmico

* Não depender apenas de seletor estático.
* Reaplicar regras quando elementos “voltam” (MutationObserver).

### RNF-02 — Performance

* Observers com escopo controlado (evitar observar a página inteira sem filtro).
* Debounce/throttle nas reaplicações.

### RNF-03 — Privacidade

* **Zero coleta**. Sem analytics. Sem requests externos.
* Dados apenas em `chrome.storage` (sync/local).

### RNF-04 — Permissões mínimas

* `storage`
* acesso a `https://www.youtube.com/*`

### RNF-05 — Reversibilidade

* Cada regra precisa ser **reversível** (toggle e soneca não devem exigir reload).

---

## 9) Arquitetura técnica (MV3)

### Componentes

* **Content script** (`https://www.youtube.com/*`) — “cérebro”:

  * Detecta rota
  * Aplica regras
  * Observa mutações do DOM
* **Service worker (background)**:

  * Persistência de config
  * Comandos do popup (toggle/preset/soneca)
  * (v0.2) agenda: decide estado e notifica content scripts
* **Popup UI**
* **Options page** (v0.2+)

### Estratégia em 3 camadas

1. **CSS injection**: ocultação rápida e barata
2. **MutationObserver**: reoculta quando o YouTube recria nós
3. **Route watcher**: SPA — reaplica em mudança de `location.href`/history

### “Rules engine” (conceito)

* Cada regra:

  * `id`
  * `description`
  * `appliesToRoutes` (home/watch/shorts/search/channel)
  * `apply()`
  * `remove()`

Isso habilita:

* Toggle imediato
* Soneca
* Evolução para custom rules

---

## 10) Modelo de dados (config)

Estrutura conceitual:

* `enabled: boolean`
* `preset: "work" | "moderate" | "leisure" | "custom"`
* `rules: { hideShorts, hideHomeFeed, hideRelated, disableAutoplay, ... }` (especialmente para custom)
* `schedule: [{ days:[1..5], start:"09:00", end:"18:00", preset:"work" }]` (v0.2)
* `whitelistChannels: [channelId...]` (v0.3)
* `snoozeUntil: timestamp | null`

**Nota whitelist:** identificar canal no `/watch` pode exigir ler metadados do DOM ou JSON embutido (`ytInitialPlayerResponse`). No MVP, **não obrigatório**.

---

## 11) Conteúdo open-source e governança

### Licença (recomendação)

* **MIT** para máxima adoção e baixo atrito.

### Repositório (estrutura sugerida)

```

  manifest.json
  /src
    content/
    background/
    ui/popup/
    ui/options/
    shared/
  /assets
  /locales
/docs
  architecture.md
  privacy.md
  troubleshooting.md
  release.md
CONTRIBUTING.md
CODE_OF_CONDUCT.md
SECURITY.md
LICENSE
README.md
```

### Política de privacidade (produto)

* “Não coletamos dados, não usamos analytics, não enviamos nada para servidores.”

---

## 12) Riscos e mitigação

### Risco 1 — YouTube muda DOM/rotas

* Mitigação: camadas (CSS + observer + route watcher), rules engine, releases rápidas.

### Risco 2 — Performance (observer pesado)

* Mitigação: observar container específico, debounce, early-exit por rota, desligar observer quando modo foco OFF.

### Risco 3 — Expectativa de “bloqueio perfeito”

* Mitigação: comunicação clara (“modo foco consistente”), troubleshooting e issues template.

### Risco 4 — Quebra de autoplay e overlays

* Mitigação: abordagem “best effort” no MVP; documentar limitações.

---

## 13) Checklist de testes (mínimo para lançar v0.1)

### Rotas

* Home (`/`)
* Watch (`/watch?v=...`)
* Shorts (`/shorts/...`)
* Search (`/results?search_query=...`)
* Channel (`/@...`, `/channel/...`)
* Subscriptions (`/feed/subscriptions`)

### Casos

* Toggle ON/OFF sem reload (quando possível)
* Soneca 10 min:

  * ativa, desativa, persiste, reativa ao expirar
* Navegação SPA:

  * clicar em vídeos sem recarregar e garantir regras reaplicadas
* Shorts:

  * abrir link direto, clicar em card, garantir redirecionamento
* Autoplay:

  * confirmar que não continua tocando “próximo” automaticamente
* Regressão:

  * modo OFF restaura experiência (sem “sumir coisas” permanentemente)

---

## 14) Plano de releases

* **v0.1**: Toggle + preset Trabalho/Estudo + Home bloqueada + related removido + autoplay off + shorts bloqueado + soneca 10 min
* **v0.2**: Agenda
* **v0.3**: Whitelist por canal
* **v1.0**: Custom + export/import + refinamentos de UI/estabilidade

---

## 15) Critérios de aceite (v0.1)

* Em Home, com modo ON + preset Work:

  * feed infinito não aparece; usuário vê tela de foco com CTAs funcionais.
* Em Watch:

  * sidebar de recomendados não aparece; autoplay está desativado.
* Em Shorts:

  * usuário não consegue consumir Shorts (redireciona).
* Panic button:

  * desativa por 10 minutos e religa automaticamente, sem comportamento inconsistente.
* Sem permissões extras além de `storage` e `youtube.com/*`.
* Sem qualquer coleta de dados.

