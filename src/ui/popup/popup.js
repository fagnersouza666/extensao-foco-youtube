const sendMessage = (payload) =>
  new Promise((resolve) => chrome.runtime.sendMessage(payload, resolve));

const toggle = document.getElementById("toggle");
const statusEl = document.getElementById("status");
const preset = document.getElementById("preset");
const snoozeBtn = document.getElementById("snooze");
const snoozeStatus = document.getElementById("snoozeStatus");

const formatTime = (ts) =>
  new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

const updateUI = (config) => {
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
  const response = await sendMessage({ type: "GET_CONFIG" });
  if (response?.ok) updateUI(response.config);
};

toggle.addEventListener("change", async () => {
  await sendMessage({ type: "SET_ENABLED", enabled: toggle.checked });
  await refresh();
});

preset.addEventListener("change", async () => {
  await sendMessage({ type: "SET_PRESET", preset: preset.value });
  await refresh();
});

snoozeBtn.addEventListener("click", async () => {
  await sendMessage({ type: "SNOOZE", minutes: 10 });
  await refresh();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  if (changes.focusConfig) refresh();
});

refresh();
