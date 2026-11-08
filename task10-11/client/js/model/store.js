import { api } from "./api.js";

class Store {
  constructor() {
    this.state = {
      transactions: [],
      categories: [],
      filters: {
        type: "all",
        categoryId: "",
        dateFrom: "",
        dateTo: "",
      },
    };
    this.listeners = new Set();
  }

  getState() {
    return this.state;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  setState(patch) {
    this.state = { ...this.state, ...patch };
    this.notify();
  }



  async loadAll() {
    const [transactions, categories] = await Promise.all([
      api.getTransactions(),
      api.getCategories(),
    ]);
    this.setState({ transactions, categories });
  }



  async createTransaction(payload) {
    const created = await api.addTransaction(payload);
    this.setState({ transactions: [...this.state.transactions, created] });
    return created;
  }

  async updateTransaction(id, payload) {
    const updated = await api.updateTransaction(id, { ...payload, id });
    const transactions = this.state.transactions.map((t) =>
      String(t.id) === String(id) ? updated : t
    );
    this.setState({ transactions });
    return updated;
  }

  async deleteTransaction(id) {
    await api.deleteTransaction(id);
    const transactions = this.state.transactions.filter(
      (t) => String(t.id) !== String(id)
    );
    this.setState({ transactions });
  }



  async createCategory(payload) {
    const created = await api.addCategory(payload);
    this.setState({ categories: [...this.state.categories, created] });
    return created;
  }



  setFilters(patch) {
    this.setState({ filters: { ...this.state.filters, ...patch } });
  }

  resetFilters() {
    this.setState({
      filters: {
        type: "all",
        categoryId: "",
        dateFrom: "",
        dateTo: "",
      },
    });
  }

  getFilteredTransactions() {
    const { transactions, filters } = this.state;
    const { type, categoryId, dateFrom, dateTo } = filters;

    return transactions.filter((t) => {
      if (type !== "all" && t.type !== type) return false;
      if (categoryId && String(t.categoryId) !== String(categoryId)) return false;
      if (dateFrom && t.date < dateFrom) return false;
      if (dateTo && t.date > dateTo) return false;
      return true;
    });
  }



  getTransactionById(id) {
    return this.state.transactions.find((t) => String(t.id) === String(id));
  }

  getSummary() {
    const income = this.state.transactions
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + Number(t.amount), 0);
    const expense = this.state.transactions
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + Number(t.amount), 0);
    return { income, expense, balance: income - expense };
  }
}

export const store = new Store();
