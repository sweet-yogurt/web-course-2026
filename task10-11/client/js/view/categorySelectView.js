import { el } from "./dom.js";

export const categorySelectView = {
  render(categories) {
    this._renderInto(el.category, categories, false);
    this._renderInto(el.filterCategory, categories, true);
  },

  _renderInto(selectEl, categories, includeAll) {
    const current = selectEl.value;
    selectEl.innerHTML = includeAll
      ? `<option value="">Все категории</option>`
      : `<option value="">— выберите —</option>`;

    for (const c of categories) {
      const opt = document.createElement("option");
      opt.value = String(c.id);
      opt.textContent = `${c.name} (${c.type === "income" ? "доход" : "расход"})`;
      selectEl.appendChild(opt);
    }

    selectEl.value = current;
  },
};
