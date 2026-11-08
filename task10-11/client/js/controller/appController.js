import { store } from "../model/store.js";
import { settings } from "../model/settings.js";

import {
  el,
  summaryView,
  transactionListView,
  transactionFormView,
  categorySelectView,
  filterView,
  categoryFormView,
  themeView,
} from "../ui.js";

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
      alert(
        `Не удалось загрузить данные: ${err.message}. ` +
          "Убедитесь, что сервер запущен на порту 3001."
      );
    }
  },

  render(state) {
    summaryView.render(store.getSummary());
    categorySelectView.render(
      state.categories,
      el.type.value,
      el.category.value
    );
    filterView.render(state.filters);
    transactionListView.render(state.transactions, state.categories);
  },

  bindEvents() {
    el.typeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        transactionFormView.setActiveType(btn.dataset.type);
        categorySelectView.render(
          store.getState().categories,
          btn.dataset.type,
          ""
        );
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
      this.resetTransactionForm();
    });

    el.list.addEventListener("click", (e) => {
      const editBtn = e.target.closest(".edit-btn");
      const deleteBtn = e.target.closest(".delete-btn");

      if (editBtn) this.handleEdit(editBtn.dataset.id);
      if (deleteBtn) this.handleDelete(deleteBtn.dataset.id);
    });

    const reloadTransactions = async () => {
      try {
        await store.loadTransactions();
      } catch (err) {
        alert(`Не удалось загрузить операции: ${err.message}`);
      }
    };

    const onFilterChange = () => {
      const values = filterView.getValues();
      store.setFilters(values);
      settings.saveFilters(values);
      reloadTransactions();
    };

    el.filterType.addEventListener("change", onFilterChange);
    el.filterCategory.addEventListener("change", onFilterChange);
    el.filterDateFrom.addEventListener("change", onFilterChange);
    el.filterDateTo.addEventListener("change", onFilterChange);

    el.filterReset.addEventListener("click", () => {
      store.resetFilters();
      settings.clearFilters();
      reloadTransactions();
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

  resetTransactionForm() {
    transactionFormView.resetForm();
    categorySelectView.render(store.getState().categories, "expense", "");
  },

  validateTransaction(data) {
    transactionFormView.clearAllErrors();
    let valid = true;

    if (!data.amount) {
      transactionFormView.showError("amount", "Введите сумму");
      valid = false;
    } else if (isNaN(data.amount) || Number(data.amount) <= 0) {
      transactionFormView.showError(
        "amount",
        "Сумма должна быть положительным числом"
      );
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
      this.resetTransactionForm();
    } catch (err) {
      console.error("Ошибка при сохранении:", err);
      alert(`Ошибка при сохранении операции: ${err.message}`);
    }
  },

  handleEdit(id) {
    const transaction = store.getTransactionById(id);
    if (!transaction) return;

    transactionFormView.fillForm(transaction);
    categorySelectView.render(
      store.getState().categories,
      transaction.type,
      transaction.categoryId
    );
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
      alert(`Не удалось удалить операцию: ${err.message}`);
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
      alert(`Не удалось создать категорию: ${err.message}`);
    }
  },
};
