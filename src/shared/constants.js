(() => {
  const STORAGE_KEY = "focusConfig";

  const MESSAGE_TYPES = {
    GET_CONFIG: "GET_CONFIG",
    SET_ENABLED: "SET_ENABLED",
    SET_PRESET: "SET_PRESET",
    SET_RULES: "SET_RULES",
    SNOOZE: "SNOOZE",
    CLEAR_SNOOZE: "CLEAR_SNOOZE",
    SET_DEBUG: "SET_DEBUG"
  };

  const DEFAULT_CONFIG = {
    enabled: false,
    preset: "work",
    debug: false,
    snoozeUntil: null,
    rules: {
      hideShorts: true,
      hideHomeFeed: true,
      hideRelated: true,
      disableAutoplay: true
    }
  };

  const PRESET_LABELS = {
    work: "Trabalho/Estudo",
    moderate: "Moderado",
    leisure: "Lazer",
    custom: "Custom"
  };

  const PRESET_RULES = {
    work: {
      hideShorts: true,
      hideHomeFeed: true,
      hideRelated: true,
      disableAutoplay: true
    },
    moderate: {
      hideShorts: true,
      hideHomeFeed: false,
      hideRelated: true,
      disableAutoplay: true
    },
    leisure: {
      hideShorts: true,
      hideHomeFeed: false,
      hideRelated: false,
      disableAutoplay: false
    },
    custom: null
  };

  const SNOOZE_MINUTES_DEFAULT = 10;
  const MIN_SNOOZE_MINUTES = 1;
  const MAX_SNOOZE_MINUTES = 120;
  const OVERLAY_SUPPRESS_MS = 10000;
  const ROUTE_CHECK_INTERVAL_MS = 1000;
  const LOG_PREFIX = "[YTFocus]";

  globalThis.YT_FOCUS = {
    STORAGE_KEY,
    MESSAGE_TYPES,
    DEFAULT_CONFIG,
    PRESET_LABELS,
    PRESET_RULES,
    SNOOZE_MINUTES_DEFAULT,
    MIN_SNOOZE_MINUTES,
    MAX_SNOOZE_MINUTES,
    OVERLAY_SUPPRESS_MS,
    ROUTE_CHECK_INTERVAL_MS,
    LOG_PREFIX
  };
})();
