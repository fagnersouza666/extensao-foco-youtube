const FOCUS = globalThis.YT_FOCUS;
if (!FOCUS) {
  throw new Error("YT_FOCUS constants not loaded");
}

const { STORAGE_KEY, MESSAGE_TYPES, SNOOZE_MINUTES_DEFAULT, LOG_PREFIX } = FOCUS;

const sendMessage = (payload) =>
  new Promise((resolve) => chrome.runtime.sendMessage(payload, resolve));

const toggle = document.getElementById("toggle");
const statusEl = document.getElementById("status");
const preset = document.getElementById("preset");
const snoozeBtn = document.getElementById("snooze");
const snoozeStatus = document.getElementById("snoozeStatus");

let currentConfig = null;

const debugLog = (...args) => {
  if (currentConfig?.debug) console.debug(LOG_PREFIX, ...args);
};

const formatTime = (ts) =>
  new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

const updateUI = (config) => {
  currentConfig = config;
  toggle.checked = Boolean(config.enabled);
  statusEl.textContent = config.enabled ? "Ligado" : "Desligado";
  preset.value = config.preset || "work";

  if (config.snoozeUntil && Date.now() < config.snoozeUntil) {
    snoozeStatus.textContent = `Soneca ate ${formatTime(config.snoozeUntil)}`;
  } else {
    snoozeStatus.textContent = "";
  }
};

const refresh = async () => {
  const response = await sendMessage({ type: MESSAGE_TYPES.GET_CONFIG });
  if (response?.ok) {
    updateUI(response.config);
    debugLog("Popup atualizado");
  }
};

toggle.addEventListener("change", async () => {
  await sendMessage({
    type: MESSAGE_TYPES.SET_ENABLED,
    enabled: toggle.checked
  });
  await refresh();
});

preset.addEventListener("change", async () => {
  await sendMessage({ type: MESSAGE_TYPES.SET_PRESET, preset: preset.value });
  await refresh();
});

snoozeBtn.addEventListener("click", async () => {
  await sendMessage({
    type: MESSAGE_TYPES.SNOOZE,
    minutes: SNOOZE_MINUTES_DEFAULT
  });
  await refresh();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  if (changes[STORAGE_KEY]) refresh();
});

refresh();
