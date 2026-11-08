const BASE_URL = "http://localhost:3001";

async function request(path, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });

    if (response.status === 204) return null;

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const message =
        data && typeof data === "object" && data.error
          ? data.error
          : `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(message);
    }

    return data;
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
}

function toTransactionPayload(transaction) {
  return {
    amount: Number(transaction.amount),
    category_id: Number(transaction.categoryId ?? transaction.category_id),
    date: transaction.date,
    comment: transaction.comment || "",
  };
}

export const api = {
  getCategories: () => request("/categories"),

  addCategory: (category) =>
    request("/categories", {
      method: "POST",
      body: JSON.stringify(category),
    }),

  getTransactions(filters = {}) {
    const query = new URLSearchParams();

    if (filters.type && filters.type !== "all") {
      query.set("type", filters.type);
    }
    if (filters.categoryId) {
      query.set("category_id", filters.categoryId);
    }
    if (filters.dateFrom) {
      query.set("from", filters.dateFrom);
    }
    if (filters.dateTo) {
      query.set("to", filters.dateTo);
    }

    const search = query.toString();
    return request(`/transactions${search ? `?${search}` : ""}`);
  },

  addTransaction: (transaction) =>
    request("/transactions", {
      method: "POST",
      body: JSON.stringify(toTransactionPayload(transaction)),
    }),

  updateTransaction: (id, transaction) =>
    request(`/transactions/${id}`, {
      method: "PUT",
      body: JSON.stringify(toTransactionPayload(transaction)),
    }),

  deleteTransaction: (id) =>
    request(`/transactions/${id}`, { method: "DELETE" }),
};
