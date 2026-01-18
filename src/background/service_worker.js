importScripts("src/shared/constants.js");

const FOCUS = globalThis.YT_FOCUS;
if (!FOCUS) {
  throw new Error("YT_FOCUS constants not loaded");
}

const {
  STORAGE_KEY,
  DEFAULT_CONFIG,
  MESSAGE_TYPES,
  PRESET_RULES,
  SNOOZE_MINUTES_DEFAULT,
  MIN_SNOOZE_MINUTES,
  MAX_SNOOZE_MINUTES,
  LOG_PREFIX
} = FOCUS;

const resolvePreset = (value) => {
  if (Object.prototype.hasOwnProperty.call(PRESET_RULES, value)) return value;
  return "work";
};

const applyPresetRules = (config, preset) => {
  const rules = PRESET_RULES[preset];
  if (!rules) return config;
  return {
    ...config,
    rules: {
      ...config.rules,
      ...rules
    }
  };
};

const clampMinutes = (value) =>
  Math.min(
    MAX_SNOOZE_MINUTES,
    Math.max(MIN_SNOOZE_MINUTES, Number(value))
  );

const debugLog = (config, ...args) => {
  if (config?.debug) console.debug(LOG_PREFIX, ...args);
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
        debugLog(next, "SET_ENABLED", next.enabled);
        sendResponse({ ok: true, config: next });
        break;
      }
      case MESSAGE_TYPES.SET_PRESET: {
        const preset = resolvePreset(message.preset);
        const next = applyPresetRules({ ...config, preset }, preset);
        await setConfig(next);
        debugLog(next, "SET_PRESET", next.preset);
        sendResponse({ ok: true, config: next });
        break;
      }
      case MESSAGE_TYPES.SET_RULES: {
        const next = {
          ...config,
          rules: {
            ...config.rules,
            ...(message.rules || {})
          }
        };
        await setConfig(next);
        debugLog(next, "SET_RULES", next.rules);
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
        debugLog(next, "SNOOZE", minutes);
        sendResponse({ ok: true, config: next });
        break;
      }
      case MESSAGE_TYPES.CLEAR_SNOOZE: {
        const next = { ...config, snoozeUntil: null };
        await setConfig(next);
        await scheduleSnoozeAlarm(next);
        debugLog(next, "CLEAR_SNOOZE");
        sendResponse({ ok: true, config: next });
        break;
      }
      case MESSAGE_TYPES.SET_DEBUG: {
        const next = { ...config, debug: Boolean(message.debug) };
        await setConfig(next);
        debugLog(next, "SET_DEBUG", next.debug);
        sendResponse({ ok: true, config: next });
        break;
      }
      default:
        sendResponse({ ok: false, error: "unknown_message" });
    }
  })();

  return true;
});
