const BASE_URL = "http://localhost:3001";

async function request(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    if (response.status === 204) return null;

    const text = await response.text();
    if (!text) return null;

    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  } catch (err) {
    console.error("API error:", err);
    throw err;
  }
}

export const api = {
  getTransactions: () => request(`${BASE_URL}/transactions`),
  getCategories: () => request(`${BASE_URL}/categories`),

  addTransaction: (transaction) =>
    request(`${BASE_URL}/transactions`, {
      method: "POST",
      body: JSON.stringify(transaction),
    }),

  updateTransaction: (id, transaction) =>
    request(`${BASE_URL}/transactions/${id}`, {
      method: "PUT",
      body: JSON.stringify(transaction),
    }),

  deleteTransaction: (id) =>
    request(`${BASE_URL}/transactions/${id}`, { method: "DELETE" }),
};
