import { api } from "./api.js";

/**
 * Простая реализация Observer-паттерна:
 *   store.subscribe(fn)  → fn(state) при каждом изменении
 *   store.getState()     → { transactions, categories }
 */
class Store {
  constructor() {
    this.state = {
      transactions: [],
      categories: [],
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

  /* ---------- Загрузка ---------- */

  async loadAll() {
    const [transactions, categories] = await Promise.all([
      api.getTransactions(),
      api.getCategories(),
    ]);
    this.setState({ transactions, categories });
  }

  /* ---------- CRUD ---------- */

  async createTransaction(payload) {
    const created = await api.addTransaction(payload);
    this.setState({
      transactions: [...this.state.transactions, created],
    });
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

  /* ---------- Производные данные ---------- */

  getTransactionById(id) {
    return this.state.transactions.find((t) => String(t.id) === String(id));
  }

  getCategoryById(id) {
    return this.state.categories.find((c) => String(c.id) === String(id));
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
