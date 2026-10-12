import { el } from "./dom.js";

export const categorySelectView = {
  render(categories) {
    const current = el.category.value;
    el.category.innerHTML = `<option value="">— выберите —</option>`;

    for (const c of categories) {
      const opt = document.createElement("option");
      opt.value = String(c.id);
      opt.textContent = `${c.name} (${c.type === "income" ? "доход" : "расход"})`;
      el.category.appendChild(opt);
    }

    el.category.value = current;
  },
};
