import {
  getTransactions, addTransaction, updateTransaction, deleteTransaction,
  getCategories,
} from "./api.js";

import {
  renderSummary, renderTransactions, renderCategoryOptions,
  fillForm, resetForm,
  showFieldError, clearAllErrors,
} from "./ui.js";


let transactions = [];
let categories = [];


function refreshList() {
  renderTransactions(transactions, categories);
  renderSummary(transactions);
}


async function loadData() {
  try {
    [transactions, categories] = await Promise.all([
      getTransactions(),
      getCategories(),
    ]);
    renderCategoryOptions(document.getElementById("category"), categories);
    refreshList();
  } catch (err) {
    alert("Не удалось загрузить данные. Убедитесь, что json-server запущен на порту 3001.");
  }
}


function validateForm() {
  clearAllErrors(["amount", "category", "date"]);
  let valid = true;

  const amountEl = document.getElementById("amount");
  const categoryEl = document.getElementById("category");
  const dateEl = document.getElementById("date");

  const amount = amountEl.value.trim();
  const category = categoryEl.value;
  const date = dateEl.value;

  if (!amount) {
    showFieldError("amount", "Введите сумму");
    valid = false;
  } else if (isNaN(amount) || Number(amount) <= 0) {
    showFieldError("amount", "Сумма должна быть положительным числом");
    valid = false;
  }

  if (!category) {
    showFieldError("category", "Выберите категорию");
    valid = false;
  }

  if (!date) {
    showFieldError("date", "Укажите дату");
    valid = false;
  } else if (isNaN(new Date(date).getTime())) {
    showFieldError("date", "Некорректная дата");
    valid = false;
  }

  return valid;
}


function bindEvents() {
  document.querySelectorAll(".type-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".type-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("type").value = btn.dataset.type;
    });
  });

  document.getElementById("transaction-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const id = document.getElementById("transaction-id").value;
    const payload = {
      amount: Number(document.getElementById("amount").value),
      type: document.getElementById("type").value,
      categoryId: Number(document.getElementById("category").value),
      date: document.getElementById("date").value,
      comment: document.getElementById("comment").value.trim(),
    };

    try {
      if (id) {
        const updated = await updateTransaction(id, { ...payload, id });
        const idx = transactions.findIndex((t) => String(t.id) === String(id));
        if (idx !== -1) transactions[idx] = updated;
      } else {
        const created = await addTransaction(payload);
        transactions.push(created);
      }
      resetForm();
      refreshList();
    } catch (err) {
      console.error("Ошибка при сохранении:", err);
      alert("Ошибка при сохранении операции");
    }
  });

  ["amount", "category", "date"].forEach((fieldId) => {
    const el = document.getElementById(fieldId);
    const handler = () => {
      el.classList.remove("invalid");
      const err = document.getElementById(`error-${fieldId}`);
      if (err) err.textContent = "";
    };
    el.addEventListener("input", handler);
    el.addEventListener("change", handler);
  });

  document.getElementById("cancel-edit").addEventListener("click", resetForm);

  document.getElementById("transactions-list").addEventListener("click", async (e) => {
    const editBtn = e.target.closest(".edit-btn");
    const deleteBtn = e.target.closest(".delete-btn");

    if (editBtn) {
      const id = editBtn.dataset.id;
      const t = transactions.find((x) => String(x.id) === id);
      if (t) fillForm(t);
      window.scrollTo({
        top: document.getElementById("transaction-form").offsetTop - 20,
        behavior: "smooth",
      });
    }

    if (deleteBtn) {
      const id = deleteBtn.dataset.id;
      if (!id) {
        alert("Не удалось определить ID операции");
        return;
      }
      if (!confirm("Удалить операцию?")) return;

      try {
        await deleteTransaction(id);
        transactions = transactions.filter((t) => String(t.id) !== id);
        refreshList();
      } catch (err) {
        console.error("Ошибка при удалении:", err);
        alert(`Не удалось удалить операцию (id=${id}). Проверьте, что json-server запущен.`);
      }
    }
  });
}


bindEvents();
loadData();
