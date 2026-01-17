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

const withDefaults = (stored) => ({
  ...DEFAULT_CONFIG,
  ...(stored || {}),
  rules: {
    ...DEFAULT_CONFIG.rules,
    ...((stored || {}).rules || {})
  }
});

const getConfig = async () => {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  return withDefaults(data[STORAGE_KEY]);
};

const setConfig = async (config) => {
  await chrome.storage.local.set({ [STORAGE_KEY]: config });
};

const scheduleSnoozeAlarm = async (config) => {
  if (config.snoozeUntil && config.snoozeUntil > Date.now()) {
    await chrome.alarms.create("snooze", { when: config.snoozeUntil });
  } else {
    await chrome.alarms.clear("snooze");
  }
};

const normalizeConfig = async () => {
  const config = await getConfig();
  if (config.snoozeUntil && Date.now() >= config.snoozeUntil) {
    config.snoozeUntil = null;
    await setConfig(config);
  }
  await scheduleSnoozeAlarm(config);
};

chrome.runtime.onInstalled.addListener(async () => {
  const config = await getConfig();
  await setConfig(config);
  await scheduleSnoozeAlarm(config);
});

chrome.runtime.onStartup.addListener(async () => {
  await normalizeConfig();
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== "snooze") return;
  const config = await getConfig();
  if (config.snoozeUntil && Date.now() >= config.snoozeUntil) {
    config.snoozeUntil = null;
    await setConfig(config);
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  (async () => {
    const config = await getConfig();

    switch (message?.type) {
      case "GET_CONFIG": {
        await normalizeConfig();
        const latest = await getConfig();
        sendResponse({ ok: true, config: latest });
        break;
      }
      case "SET_ENABLED": {
        const next = { ...config, enabled: Boolean(message.enabled) };
        if (!next.enabled) next.snoozeUntil = null;
        await setConfig(next);
        await scheduleSnoozeAlarm(next);
        sendResponse({ ok: true, config: next });
        break;
      }
      case "SET_PRESET": {
        const next = { ...config, preset: message.preset || "work" };
        await setConfig(next);
        sendResponse({ ok: true, config: next });
        break;
      }
      case "SNOOZE": {
        const minutes = Number(message.minutes || 10);
        const next = {
          ...config,
          snoozeUntil: Date.now() + minutes * 60 * 1000
        };
        await setConfig(next);
        await scheduleSnoozeAlarm(next);
        sendResponse({ ok: true, config: next });
        break;
      }
      case "CLEAR_SNOOZE": {
        const next = { ...config, snoozeUntil: null };
        await setConfig(next);
        await scheduleSnoozeAlarm(next);
        sendResponse({ ok: true, config: next });
        break;
      }
      default:
        sendResponse({ ok: false, error: "unknown_message" });
    }
  })();

  return true;
});
