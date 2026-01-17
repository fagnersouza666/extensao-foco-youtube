importScripts("src/shared/constants.js");

const FOCUS = globalThis.YT_FOCUS;
if (!FOCUS) {
  throw new Error("YT_FOCUS constants not loaded");
}

const {
  STORAGE_KEY,
  DEFAULT_CONFIG,
  MESSAGE_TYPES,
  SNOOZE_MINUTES_DEFAULT,
  MIN_SNOOZE_MINUTES,
  MAX_SNOOZE_MINUTES
} = FOCUS;

const clampMinutes = (value) =>
  Math.min(
    MAX_SNOOZE_MINUTES,
    Math.max(MIN_SNOOZE_MINUTES, Number(value))
  );

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
      case MESSAGE_TYPES.GET_CONFIG: {
        await normalizeConfig();
        const latest = await getConfig();
        sendResponse({ ok: true, config: latest });
        break;
      }
      case MESSAGE_TYPES.SET_ENABLED: {
        const next = { ...config, enabled: Boolean(message.enabled) };
        if (!next.enabled) next.snoozeUntil = null;
        await setConfig(next);
        await scheduleSnoozeAlarm(next);
        sendResponse({ ok: true, config: next });
        break;
      }
      case MESSAGE_TYPES.SET_PRESET: {
        const next = { ...config, preset: message.preset || "work" };
        await setConfig(next);
        sendResponse({ ok: true, config: next });
        break;
      }
      case MESSAGE_TYPES.SNOOZE: {
        const minutes = clampMinutes(
          message.minutes || SNOOZE_MINUTES_DEFAULT
        );
        const next = {
          ...config,
          snoozeUntil: Date.now() + minutes * 60 * 1000
        };
        await setConfig(next);
        await scheduleSnoozeAlarm(next);
        sendResponse({ ok: true, config: next });
        break;
      }
      case MESSAGE_TYPES.CLEAR_SNOOZE: {
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
