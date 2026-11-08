import {
  formatMoney, formatMoneyCompact, formatDate, escapeHtml,
} from "../util/format.js";
import { el } from "./dom.js";

const ICONS = {
  edit: `
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        d="M12 20h9"/>
      <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
    </svg>`,
  trash: `
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        d="M3 6h18"/>
      <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/>
      <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        d="M10 11v6M14 11v6"/>
    </svg>`,
};

export const transactionListView = {
  render(transactions, categories) {
    el.list.innerHTML = "";

    if (!transactions.length) {
      el.empty.hidden = false;
      return;
    }
    el.empty.hidden = true;

    const catMap = new Map(categories.map((c) => [String(c.id), c.name]));

    const sorted = [...transactions].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    for (const t of sorted) {
      el.list.appendChild(this._renderItem(t, catMap));
    }
  },

  _renderItem(t, catMap) {
    const item = document.createElement("div");
    item.className = `transaction-item ${t.type}`;
    item.dataset.id = String(t.id);

    const compact = formatMoneyCompact(t.amount, {
      style: "long",
      maxDigits: 5,
      withCurrency: true,
    });

    item.innerHTML = `
      <span class="transaction-date">${formatDate(t.date)}</span>
      <div class="transaction-info">
        <span class="transaction-category">${catMap.get(String(t.categoryId)) || "—"}</span>
        ${t.comment ? `<span class="transaction-comment">${escapeHtml(t.comment)}</span>` : ""}
      </div>
      <span class="transaction-amount ${t.type}" title="${formatMoney(t.amount)}">
        ${t.type === "income" ? "+" : "−"}${compact}
      </span>
      <div class="transaction-actions">
        <button class="icon-btn edit-btn" data-id="${t.id}" title="Редактировать" aria-label="Редактировать">
          ${ICONS.edit}
        </button>
        <button class="icon-btn delete-btn" data-id="${t.id}" title="Удалить" aria-label="Удалить">
          ${ICONS.trash}
        </button>
      </div>
    `;
    return item;
  },
};
