import { el } from "./dom.js";

export const transactionFormView = {
  getFormData() {
    return {
      id: el.transactionId.value,
      amount: el.amount.value.trim(),
      type: el.type.value,
      categoryId: el.category.value,
      date: el.date.value,
      comment: el.comment.value.trim(),
    };
  },

  fillForm(transaction) {
    el.transactionId.value = String(transaction.id);
    el.amount.value = transaction.amount;
    el.type.value = transaction.type;
    el.category.value = String(transaction.categoryId);
    el.date.value = transaction.date;
    el.comment.value = transaction.comment || "";

    el.typeButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.type === transaction.type);
    });

    el.formTitle.textContent = "Редактировать операцию";
    el.submitBtn.textContent = "Сохранить";
    el.cancelEdit.hidden = false;
  },

  resetForm() {
    el.form.reset();
    el.transactionId.value = "";
    el.type.value = "expense";
    el.typeButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.type === "expense");
    });
    el.formTitle.textContent = "Добавить операцию";
    el.submitBtn.textContent = "Добавить";
    el.cancelEdit.hidden = true;
    this.clearAllErrors();
  },

  setActiveType(type) {
    el.typeButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.type === type);
    });
    el.type.value = type;
  },

  /* ---------- Ошибки ---------- */

  showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(`error-${fieldId}`);
    if (field) field.classList.add("invalid");
    if (error) error.textContent = message;
  },

  clearError(fieldId) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(`error-${fieldId}`);
    if (field) field.classList.remove("invalid");
    if (error) error.textContent = "";
  },

  clearAllErrors() {
    ["amount", "category", "date"].forEach((f) => this.clearError(f));
  },

  scrollIntoView() {
    window.scrollTo({
      top: el.form.offsetTop - 20,
      behavior: "smooth",
    });
  },
};
