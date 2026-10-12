export const $ = (id) => document.getElementById(id);

export const el = {
  // summary
  totalIncome: $("total-income"),
  totalExpense: $("total-expense"),
  totalBalance: $("total-balance"),

  // form
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

  // errors
  errorAmount: $("error-amount"),
  errorCategory: $("error-category"),
  errorDate: $("error-date"),

  // list
  list: $("transactions-list"),
  empty: $("empty-message"),
};
