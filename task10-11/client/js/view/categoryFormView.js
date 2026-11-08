import { el } from "./dom.js";

export const categoryFormView = {
  getValues() {
    return {
      name: el.categoryName.value.trim(),
      type: el.categoryType.value,
    };
  },

  reset() {
    el.categoryForm.reset();
    this.clearError();
  },

  showError(message) {
    el.categoryName.classList.add("invalid");
    el.errorCategoryName.textContent = message;
  },

  clearError() {
    el.categoryName.classList.remove("invalid");
    el.errorCategoryName.textContent = "";
  },
};
