import { api } from "../api.js";

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
    this.transactionsRequestId = 0;
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
    const [categories, transactions] = await Promise.all([
      api.getCategories(),
      api.getTransactions(this.state.filters),
    ]);

    this.setState({ categories, transactions });
  }

  async loadTransactions() {
    const requestId = ++this.transactionsRequestId;
    const transactions = await api.getTransactions(this.state.filters);

    if (requestId !== this.transactionsRequestId) return;

    this.setState({ transactions });
  }

  async createTransaction(payload) {
    const created = await api.addTransaction(payload);
    await this.loadTransactions();
    return created;
  }

  async updateTransaction(id, payload) {
    const updated = await api.updateTransaction(id, payload);
    await this.loadTransactions();
    return updated;
  }

  async deleteTransaction(id) {
    await api.deleteTransaction(id);
    await this.loadTransactions();
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

  getTransactionById(id) {
    return this.state.transactions.find((t) => String(t.id) === String(id));
  }

  getSummary() {
    const income = this.state.transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expense = this.state.transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return { income, expense, balance: income - expense };
  }
}

export const store = new Store();
