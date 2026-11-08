import { store } from "../model/store.js";
import { settings } from "../model/settings.js";

import { summaryView } from "../view/summaryView.js";
import { transactionListView } from "../view/transactionListView.js";
import { transactionFormView } from "../view/transactionFormView.js";
import { categorySelectView } from "../view/categorySelectView.js";
import { filterView } from "../view/filterView.js";
import { categoryFormView } from "../view/categoryFormView.js";
import { themeView } from "../view/themeView.js";
import { el } from "../view/dom.js";

export const appController = {
  init() {

    const saved = settings.load();
    themeView.apply(saved.theme);
    store.setFilters(saved.filters);


    store.subscribe((state) => this.render(state));


    this.bindEvents();


    this.loadData();
  },

  async loadData() {
    try {
      await store.loadAll();
    } catch (err) {
      alert("Не удалось загрузить данные. Убедитесь, что json-server запущен на порту 3001.");
    }
  },

  render(state) {
    summaryView.render(store.getSummary());
    categorySelectView.render(state.categories);
    filterView.render(state.filters);
    transactionListView.render(
      store.getFilteredTransactions(),
      state.categories
    );
  },

  bindEvents() {


    el.typeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        transactionFormView.setActiveType(btn.dataset.type);
      });
    });

    el.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    ["amount", "category", "date"].forEach((fieldId) => {
      const field = document.getElementById(fieldId);
      const handler = () => transactionFormView.clearError(fieldId);
      field.addEventListener("input", handler);
      field.addEventListener("change", handler);
    });

    el.cancelEdit.addEventListener("click", () => {
      transactionFormView.resetForm();
    });



    el.list.addEventListener("click", (e) => {
      const editBtn = e.target.closest(".edit-btn");
      const deleteBtn = e.target.closest(".delete-btn");

      if (editBtn) this.handleEdit(editBtn.dataset.id);
      if (deleteBtn) this.handleDelete(deleteBtn.dataset.id);
    });



    const onFilterChange = () => {
      const values = filterView.getValues();
      store.setFilters(values);
      settings.saveFilters(values);
    };

    el.filterType.addEventListener("change", onFilterChange);
    el.filterCategory.addEventListener("change", onFilterChange);
    el.filterDateFrom.addEventListener("change", onFilterChange);
    el.filterDateTo.addEventListener("change", onFilterChange);

    el.filterReset.addEventListener("click", () => {
      store.resetFilters();
      settings.clearFilters();
    });



    el.categoryForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleCategorySubmit();
    });

    el.categoryName.addEventListener("input", () => {
      categoryFormView.clearError();
    });



    el.themeToggle.addEventListener("click", () => {
      const isDark = document.body.classList.contains("dark");
      const next = isDark ? "light" : "dark";
      themeView.apply(next);
      settings.saveTheme(next);
    });
  },



  validateTransaction(data) {
    transactionFormView.clearAllErrors();
    let valid = true;

    if (!data.amount) {
      transactionFormView.showError("amount", "Введите сумму");
      valid = false;
    } else if (isNaN(data.amount) || Number(data.amount) <= 0) {
      transactionFormView.showError("amount", "Сумма должна быть положительным числом");
      valid = false;
    }

    if (!data.categoryId) {
      transactionFormView.showError("category", "Выберите категорию");
      valid = false;
    }

    if (!data.date) {
      transactionFormView.showError("date", "Укажите дату");
      valid = false;
    } else if (isNaN(new Date(data.date).getTime())) {
      transactionFormView.showError("date", "Некорректная дата");
      valid = false;
    }

    return valid;
  },



  async handleSubmit() {
    const raw = transactionFormView.getFormData();
    if (!this.validateTransaction(raw)) return;

    const payload = {
      amount: Number(raw.amount),
      type: raw.type,
      categoryId: Number(raw.categoryId),
      date: raw.date,
      comment: raw.comment,
    };

    try {
      if (raw.id) {
        await store.updateTransaction(raw.id, payload);
      } else {
        await store.createTransaction(payload);
      }
      transactionFormView.resetForm();
    } catch (err) {
      console.error("Ошибка при сохранении:", err);
      alert("Ошибка при сохранении операции");
    }
  },

  handleEdit(id) {
    const t = store.getTransactionById(id);
    if (!t) return;
    transactionFormView.fillForm(t);
    transactionFormView.scrollIntoView();
  },

  async handleDelete(id) {
    if (!id) {
      alert("Не удалось определить ID операции");
      return;
    }
    if (!confirm("Удалить операцию?")) return;

    try {
      await store.deleteTransaction(id);
    } catch (err) {
      console.error("Ошибка при удалении:", err);
      alert(`Не удалось удалить операцию (id=${id}). Проверьте, что json-server запущен.`);
    }
  },



  async handleCategorySubmit() {
    const values = categoryFormView.getValues();

    if (!values.name) {
      categoryFormView.showError("Введите название категории");
      return;
    }

    try {
      await store.createCategory({
        name: values.name,
        type: values.type,
      });
      categoryFormView.reset();
    } catch (err) {
      console.error("Ошибка при создании категории:", err);
      alert("Не удалось создать категорию");
    }
  },
};
