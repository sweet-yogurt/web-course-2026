export const $ = (id) => document.getElementById(id);

export const el = {

  totalIncome: $("total-income"),
  totalExpense: $("total-expense"),
  totalBalance: $("total-balance"),


  themeToggle: $("theme-toggle"),
  themeIconMoon: $("theme-icon-moon"),
  themeIconSun: $("theme-icon-sun"),


  filterType: $("filter-type"),
  filterCategory: $("filter-category"),
  filterDateFrom: $("filter-date-from"),
  filterDateTo: $("filter-date-to"),
  filterReset: $("filter-reset"),


  form: $("transaction-form"),
  formTitle: $("form-title"),
  transactionId: $("transaction-id"),
  amount: $("amount"),
  type: $("type"),
  typeButtons: document.querySelectorAll(".type-btn"),
  category: $("category"),
  date: $("date"),
  comment: $("comment"),
  submitBtn: $("submit-btn"),
  cancelEdit: $("cancel-edit"),


  errorAmount: $("error-amount"),
  errorCategory: $("error-category"),
  errorDate: $("error-date"),


  categoryForm: $("category-form"),
  categoryName: $("category-name"),
  categoryType: $("category-type"),
  errorCategoryName: $("error-category-name"),


  list: $("transactions-list"),
  empty: $("empty-message"),
};
