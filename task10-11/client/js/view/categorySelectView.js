import { el } from "./dom.js";

export const categorySelectView = {
  render(
    categories,
    activeType = el.type.value,
    selectedCategoryId = el.category.value
  ) {
    const type = activeType === "income" ? "income" : "expense";
    const categoriesForForm = categories.filter((c) => c.type === type);

    this._renderInto(el.category, categoriesForForm, false, selectedCategoryId);
    this._renderInto(
      el.filterCategory,
      categories,
      true,
      el.filterCategory.value
    );
  },

  _renderInto(selectEl, categories, includeAll, selectedValue) {
    selectEl.innerHTML = includeAll
      ? `<option value="">Все категории</option>`
      : `<option value="">— выберите —</option>`;

    for (const category of categories) {
      const option = document.createElement("option");
      option.value = String(category.id);
      option.textContent = `${category.name} (${
        category.type === "income" ? "доход" : "расход"
      })`;
      selectEl.appendChild(option);
    }

    const value = selectedValue == null ? "" : String(selectedValue);
    const hasSelected = categories.some(
      (category) => String(category.id) === value
    );
    selectEl.value = hasSelected ? value : "";
  },
};
