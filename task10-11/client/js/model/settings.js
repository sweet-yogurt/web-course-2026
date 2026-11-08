const KEY = "zen-money-settings";

const DEFAULTS = {
  theme: "light",
  filters: {
    type: "all",
    categoryId: "",
    dateFrom: "",
    dateTo: "",
  },
};

export const settings = {
  load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return structuredClone(DEFAULTS);
      const parsed = JSON.parse(raw);
      return {
        theme: parsed.theme === "dark" ? "dark" : "light",
        filters: {
          ...DEFAULTS.filters,
          ...(parsed.filters || {}),
        },
      };
    } catch {
      return structuredClone(DEFAULTS);
    }
  },

  save(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {

    }
  },



  saveTheme(theme) {
    const current = this.load();
    current.theme = theme;
    this.save(current);
  },

  saveFilters(filters) {
    const current = this.load();
    current.filters = { ...current.filters, ...filters };
    this.save(current);
  },

  clearFilters() {
    const current = this.load();
    current.filters = { ...DEFAULTS.filters };
    this.save(current);
  },
};
