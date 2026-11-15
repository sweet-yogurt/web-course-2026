const KEY = "zen-money-settings";

export const DEFAULT_FILTERS = {
  type: "all",
  categoryId: "",
  dateFrom: "",
  dateTo: "",
};

const DEFAULTS = {
  theme: "light",
  filters: DEFAULT_FILTERS,
};

export function loadSettings() {
  if (typeof window === "undefined") {
    return { theme: DEFAULTS.theme, filters: { ...DEFAULT_FILTERS } };
  }

  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      return { theme: DEFAULTS.theme, filters: { ...DEFAULT_FILTERS } };
    }

    const parsed = JSON.parse(raw);
    return {
      theme: parsed.theme === "dark" ? "dark" : "light",
      filters: {
        ...DEFAULT_FILTERS,
        ...(parsed.filters || {}),
      },
    };
  } catch {
    return { theme: DEFAULTS.theme, filters: { ...DEFAULT_FILTERS } };
  }
}

export function saveSettings(patch) {
  if (typeof window === "undefined") return;

  try {
    const current = loadSettings();
    const next = {
      ...current,
      ...patch,
      filters: { ...current.filters, ...(patch.filters || {}) },
    };
    window.localStorage.setItem(KEY, JSON.stringify(next));
    return next;
  } catch {
    return null;
  }
}
