const STORAGE_KEY = "focusConfig";

const DEFAULT_CONFIG = {
  enabled: false,
  preset: "work",
  snoozeUntil: null,
  rules: {
    hideShorts: true,
    hideHomeFeed: true,
    hideRelated: true,
    disableAutoplay: true
  }
};

let config = { ...DEFAULT_CONFIG };
let lastUrl = location.href;
let applyTimer = null;
let styleEl = null;
let overlayEl = null;
let observer = null;

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

const SHORTS_CSS = `
  ytd-guide-entry-renderer a[href^="/shorts"],
  ytd-mini-guide-entry-renderer a[href^="/shorts"],
  ytd-reel-shelf-renderer,
  ytd-reel-shelf-renderer *,
  ytd-rich-section-renderer ytd-rich-shelf-renderer[is-shorts],
  ytd-rich-section-renderer ytd-rich-shelf-renderer[is-shorts] * {
    display: none !important;
  }
`;

const HOME_CSS = `
  ytd-browse[page-subtype="home"] #contents,
  ytd-browse[page-subtype="home"] ytd-rich-grid-renderer {
    display: none !important;
  }
`;

const WATCH_CSS = `
  #related,
  ytd-watch-next-secondary-results-renderer {
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
    "background: rgba(10, 10, 10, 0.85); color: #fff;" +
    "font-family: Arial, sans-serif;";

  el.innerHTML = `
    <div style="max-width: 520px; padding: 24px; background: #111; border: 1px solid #333; border-radius: 12px; text-align: center;">
      <h2 style="margin: 0 0 8px; font-size: 22px;">Modo Foco Ativo</h2>
      <p style="margin: 0 0 16px; color: #bbb;">Use a busca ou va para Inscricoes.</p>
      <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;">
        <button data-action="search" style="padding: 8px 12px;">Buscar</button>
        <button data-action="subs" style="padding: 8px 12px;">Inscricoes</button>
        <button data-action="history" style="padding: 8px 12px;">Historico</button>
        <button data-action="snooze" style="padding: 8px 12px;">Sonecar 10 min</button>
      </div>
    </div>
  `;

  el.addEventListener("click", (event) => {
    const action = event.target?.getAttribute?.("data-action");
    if (!action) return;
    if (action === "search") focusSearch();
    if (action === "subs") location.href = "/feed/subscriptions";
    if (action === "history") location.href = "/feed/history";
    if (action === "snooze") sendMessage({ type: "SNOOZE", minutes: 10 });
  });

  return el;
};

const ensureOverlay = () => {
  if (!overlayEl) overlayEl = createOverlay();
  if (!overlayEl.isConnected) document.body.appendChild(overlayEl);
};

const removeOverlay = () => {
  if (overlayEl) overlayEl.remove();
  overlayEl = null;
};

const focusSearch = () => {
  const input =
    document.querySelector("input#search") ||
    document.querySelector("input.ytd-searchbox");
  if (input) {
    input.focus();
    input.select?.();
  }
};

const disableAutoplay = () => {
  if (!config.rules.disableAutoplay) return;
  const toggle =
    document.querySelector("button.ytp-autonav-toggle-button") ||
    document.querySelector("button[aria-label*='Autoplay']");
  if (!toggle) return;
  const pressed = toggle.getAttribute("aria-checked");
  if (pressed === "true") toggle.click();
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

  if (route === "home") ensureOverlay();
  else removeOverlay();

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
  const response = await sendMessage({ type: "GET_CONFIG" });
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

  window.addEventListener("popstate", handleUrlChange);
  setInterval(handleUrlChange, 500);

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if (changes[STORAGE_KEY]) onConfigChange();
  });

  applyFocus();
};

init();
