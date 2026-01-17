const FOCUS = globalThis.YT_FOCUS;
if (!FOCUS) {
  throw new Error("YT_FOCUS constants not loaded");
}

const {
  STORAGE_KEY,
  DEFAULT_CONFIG,
  PRESET_LABELS,
  MESSAGE_TYPES,
  SNOOZE_MINUTES_DEFAULT,
  OVERLAY_SUPPRESS_MS,
  ROUTE_CHECK_INTERVAL_MS
} = FOCUS;

let config = { ...DEFAULT_CONFIG };
let lastUrl = location.href;
let applyTimer = null;
let styleEl = null;
let overlayEl = null;
let observer = null;
let overlaySuppressedUntil = 0;

const withDefaults = (stored) => ({
  ...DEFAULT_CONFIG,
  ...(stored || {}),
  rules: {
    ...DEFAULT_CONFIG.rules,
    ...((stored || {}).rules || {})
  }
});

const sendMessage = (payload) =>
  new Promise((resolve) => chrome.runtime.sendMessage(payload, resolve));

const isSnoozed = () =>
  Boolean(config.snoozeUntil && Date.now() < config.snoozeUntil);

const isFocusActive = () => Boolean(config.enabled && !isSnoozed());

const isSearchFocused = () => {
  const active = document.activeElement;
  if (!active || !active.matches) return false;
  return active.matches(
    "input#search, input.ytd-searchbox, input[name='search_query']"
  );
};

const isOverlaySuppressed = () =>
  Date.now() < overlaySuppressedUntil || isSearchFocused();

const SHORTS_CSS = `
  ytd-guide-entry-renderer a[href^="/shorts"],
  ytd-guide-entry-renderer a[title*="Shorts"],
  ytd-mini-guide-entry-renderer a[href^="/shorts"],
  ytd-mini-guide-entry-renderer a[title*="Shorts"],
  ytd-reel-shelf-renderer,
  ytd-reel-shelf-renderer *,
  ytd-reel-item-renderer,
  ytd-shorts-shelf-renderer,
  ytd-rich-grid-shelf-renderer[is-shorts],
  ytd-rich-grid-shelf-renderer[is-shorts] *,
  ytd-rich-shelf-renderer[is-shorts],
  ytd-rich-shelf-renderer[is-shorts] *,
  ytd-rich-item-renderer ytm-shorts-lockup-view-model-v2,
  ytd-rich-item-renderer ytm-shorts-lockup-view-model,
  a.reel-item-endpoint[href^="/shorts/"],
  ytd-browse[page-subtype="home"] #contents > ytd-rich-section-renderer:nth-child(12),
  #items > ytd-guide-entry-renderer:nth-child(2),
  ytd-rich-section-renderer ytd-rich-shelf-renderer[is-shorts],
  ytd-rich-section-renderer ytd-rich-shelf-renderer[is-shorts] * {
    display: none !important;
  }
`;

const HOME_CSS = `
  ytd-browse[page-subtype="home"] #contents,
  ytd-browse[page-subtype="home"] ytd-rich-grid-renderer,
  ytd-two-column-browse-results-renderer[page-subtype="home"] #contents,
  ytd-rich-grid-renderer,
  ytd-rich-grid-renderer #contents,
  ytd-browse[page-subtype="home"] ytd-rich-grid-renderer #contents {
    display: none !important;
  }
`;

const WATCH_CSS = `
  #related,
  #secondary,
  ytd-watch-next-secondary-results-renderer,
  ytd-secondary-results-renderer {
    display: none !important;
  }
`;

const getRoute = () => {
  const path = location.pathname || "/";
  if (path.startsWith("/shorts")) return "shorts";
  if (path.startsWith("/watch")) return "watch";
  if (path === "/") return "home";
  return "other";
};

const buildCss = (route) => {
  let css = "";
  if (config.rules.hideShorts) css += SHORTS_CSS;
  if (route === "home" && config.rules.hideHomeFeed) css += HOME_CSS;
  if (route === "watch" && config.rules.hideRelated) css += WATCH_CSS;
  return css;
};

const ensureStyle = (css) => {
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "yt-focus-style";
    document.documentElement.appendChild(styleEl);
  }
  styleEl.textContent = css;
};

const removeStyle = () => {
  if (styleEl) styleEl.remove();
  styleEl = null;
};

const createOverlay = () => {
  const el = document.createElement("div");
  el.id = "yt-focus-overlay";
  el.setAttribute("role", "dialog");
  el.style.cssText =
    "position: fixed; inset: 0; z-index: 999999;" +
    "display: flex; align-items: center; justify-content: center;" +
    "background: radial-gradient(circle at 20% 20%, rgba(255, 214, 102, 0.15), transparent 45%)," +
    "radial-gradient(circle at 80% 20%, rgba(80, 200, 190, 0.15), transparent 45%)," +
    "rgba(10, 12, 16, 0.92);" +
    "color: #f5f3ef;" +
    "font-family: Trebuchet MS, Verdana, sans-serif;";

  el.innerHTML = `
    <style>
      #yt-focus-overlay * { box-sizing: border-box; }
      #yt-focus-overlay .ytf-card {
        max-width: 560px;
        padding: 28px;
        background: linear-gradient(160deg, #14161a 0%, #0f1114 100%);
        border: 1px solid #2a2f35;
        border-radius: 16px;
        text-align: center;
        box-shadow: 0 18px 60px rgba(0, 0, 0, 0.35);
      }
      #yt-focus-overlay .ytf-tag {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 999px;
        background: #222831;
        color: #f7d774;
        font-size: 12px;
        letter-spacing: 0.4px;
        text-transform: uppercase;
        margin-bottom: 10px;
      }
      #yt-focus-overlay .ytf-title {
        margin: 0 0 8px;
        font-size: 22px;
      }
      #yt-focus-overlay .ytf-subtitle {
        margin: 0 0 18px;
        color: #c9c4bb;
        font-size: 14px;
      }
      #yt-focus-overlay .ytf-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        justify-content: center;
      }
      #yt-focus-overlay .ytf-btn {
        padding: 8px 12px;
        border: 1px solid #2a2f35;
        border-radius: 10px;
        background: #1a1f25;
        color: #f5f3ef;
        cursor: pointer;
      }
      #yt-focus-overlay .ytf-btn.primary {
        background: #f7d774;
        color: #1b1b1b;
        border-color: #f7d774;
      }
      #yt-focus-overlay .ytf-btn.danger {
        background: #3a1a1a;
        color: #f2b9b9;
        border-color: #5a2626;
      }
      #yt-focus-overlay .ytf-note {
        margin: 16px 0 0;
        font-size: 12px;
        color: #9da1a8;
      }
    </style>
    <div class="ytf-card">
      <div class="ytf-tag" data-role="preset">Trabalho/Estudo</div>
      <h2 class="ytf-title">Modo Foco Ativo</h2>
      <p class="ytf-subtitle">Escolha uma acao intencional para continuar.</p>
      <div class="ytf-actions">
        <button class="ytf-btn primary" data-action="search">Buscar</button>
        <button class="ytf-btn" data-action="subs">Inscricoes</button>
        <button class="ytf-btn" data-action="history">Historico</button>
        <button class="ytf-btn danger" data-action="snooze">Sonecar 10 min</button>
      </div>
      <p class="ytf-note">O modo foco volta automaticamente apos a soneca.</p>
    </div>
  `;

  el.addEventListener("click", (event) => {
    const action = event.target?.getAttribute?.("data-action");
    if (!action) return;
    if (action === "search") {
      overlaySuppressedUntil = Date.now() + OVERLAY_SUPPRESS_MS;
      removeOverlay();
      setTimeout(focusSearch, 0);
    }
    if (action === "subs") location.href = "/feed/subscriptions";
    if (action === "history") location.href = "/feed/history";
    if (action === "snooze") {
      sendMessage({
        type: MESSAGE_TYPES.SNOOZE,
        minutes: SNOOZE_MINUTES_DEFAULT
      });
    }
  });

  return el;
};

const updateOverlayPreset = () => {
  if (!overlayEl) return;
  const tag = overlayEl.querySelector("[data-role='preset']");
  if (!tag) return;
  tag.textContent = PRESET_LABELS[config.preset] || "Foco";
};

const ensureOverlay = () => {
  if (!overlayEl) overlayEl = createOverlay();
  if (!overlayEl.isConnected) document.body.appendChild(overlayEl);
  updateOverlayPreset();
};

const removeOverlay = () => {
  if (overlayEl) overlayEl.remove();
  overlayEl = null;
};

const focusSearch = () => {
  const input =
    document.querySelector("input#search") ||
    document.querySelector("input.ytd-searchbox") ||
    document.querySelector("input[name='search_query']");
  if (input) {
    input.focus();
    input.select?.();
  }
};

const disableAutoplay = () => {
  if (!config.rules.disableAutoplay) return;
  const toggle =
    document.querySelector(".ytp-autonav-toggle-button") ||
    document.querySelector("button[aria-label*='Autoplay']") ||
    document.querySelector("button[aria-label*='Reproducao automatica']");
  if (!toggle) return;
  const isOn = () => {
    const checked = toggle.getAttribute("aria-checked");
    if (checked === "true") return true;
    const pressed = toggle.getAttribute("aria-pressed");
    return pressed === "true";
  };
  if (isOn()) toggle.click();
};

const redirectShorts = () => {
  const match = location.pathname.match(/^\/shorts\/([^/?]+)/);
  if (match?.[1]) {
    location.replace(`/watch?v=${match[1]}`);
  } else {
    location.replace("/");
  }
};

const applyFocus = () => {
  const route = getRoute();

  if (!isFocusActive()) {
    removeStyle();
    removeOverlay();
    return;
  }

  if (route === "shorts") {
    redirectShorts();
    return;
  }

  ensureStyle(buildCss(route));

  if (route === "home") {
    if (isOverlaySuppressed()) removeOverlay();
    else ensureOverlay();
  } else {
    removeOverlay();
  }

  if (route === "watch") disableAutoplay();
};

const scheduleApply = () => {
  if (!isFocusActive()) return;
  if (applyTimer) return;
  applyTimer = setTimeout(() => {
    applyTimer = null;
    applyFocus();
  }, 250);
};

const handleUrlChange = () => {
  if (location.href === lastUrl) return;
  lastUrl = location.href;
  applyFocus();
};

const installNavigationListeners = () => {
  window.addEventListener("popstate", handleUrlChange);
  window.addEventListener("yt-navigate-finish", handleUrlChange);
  window.addEventListener("yt-page-data-updated", handleUrlChange);

  if (!history.__ytFocusPatched) {
    history.__ytFocusPatched = true;
    const wrap = (fn) =>
      function (...args) {
        const result = fn.apply(this, args);
        handleUrlChange();
        return result;
      };
    history.pushState = wrap(history.pushState);
    history.replaceState = wrap(history.replaceState);
  }

  setInterval(handleUrlChange, ROUTE_CHECK_INTERVAL_MS);
};

const startObserver = () => {
  if (observer) return;
  observer = new MutationObserver(() => scheduleApply());
  observer.observe(document.body, { childList: true, subtree: true });
};

const stopObserver = () => {
  if (!observer) return;
  observer.disconnect();
  observer = null;
};

const loadConfig = async () => {
  const response = await sendMessage({ type: MESSAGE_TYPES.GET_CONFIG });
  if (response?.ok) config = withDefaults(response.config);
};

const onConfigChange = async () => {
  await loadConfig();
  if (isFocusActive()) startObserver();
  else stopObserver();
  applyFocus();
};

const init = async () => {
  await loadConfig();
  if (isFocusActive()) startObserver();

  installNavigationListeners();
  document.addEventListener("focusin", scheduleApply, true);
  document.addEventListener("focusout", scheduleApply, true);

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if (changes[STORAGE_KEY]) onConfigChange();
  });

  applyFocus();
};

init();
