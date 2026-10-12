const fmtFull = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "BYN",
  maximumFractionDigits: 2,
});

const fmtNum = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 2,
});


const SHORT_SUFFIXES = [
  "",   // 10^0
  "K", "M", "B", "T", "Q",
  "Qi", "Sx", "Sp", "Oc", "No",
  "Dc", "Ud", "Dd", "Td", "Qd",
  "Qq", "Sd", "St", "Od", "Nd",
  "Vg", "Uv", "Dv", "Tv", "Qv",
  "Qq", "Sq", "St", "Ot", "Nt",
  "Tg", "Ut", "Dt", "Tt", "Qt",
];

const LONG_SUFFIXES = [
  "",        // 10^0
  "тыс.", "млн", "млрд", "трлн", "квдрлн",
  "квнтлн", "скстлн", "сптлн", "октлн", "нонлн",
  "децлн", "ундцлн", "дудцлн", "трдцлн", "квтдцлн",
  "квндцлн", "сксдцлн", "сптдцлн", "октдцлн", "нвмдцлн",
  "вгнтлн", "увгнтлн", "двгнтлн", "трвгнтлн", "квдвгнтлн",
  "квнгнтлн", "сксвгнтлн", "сптвгнтлн", "октвгнтлн", "нвмвгнтлн",
  "тригнтлн", "утригнтлн", "дтригнтлн", "ттригнтлн", "квдтригнтлн",
];


const UNITS = (() => {
  const units = [];
  for (let exp = 3; exp <= 306; exp += 3) {
    const idx = exp / 3;             // 1 → 10^3, 2 → 10^6, ...
    const shortPre = SHORT_SUFFIXES[idx];
    const longPre  = LONG_SUFFIXES[idx];

    units.push({
      value: Math.pow(10, exp),
      short: shortPre || `e${exp}`,
      long:  longPre  || `×10^${exp}`,
    });
  }
  return units.reverse(); // от большего к меньшему
})();

export function formatMoney(value) {
  return fmtFull.format(value);
}


export function formatMoneyCompact(value, opts = {}) {
  const {
    style = "long",
    maxDigits = 4,
    withCurrency = true,
    sign = false,
  } = opts;

  const n = Number(value);
  if (!isFinite(n)) return "—";

  const abs = Math.abs(n);
  const signStr = sign
    ? (n > 0 ? "+" : n < 0 ? "−" : "")
    : (n < 0 ? "−" : "");

  if (abs < 1000) {
    const rounded = roundToSignificant(abs, maxDigits);
    return `${signStr}${fmtNum.format(rounded)}${withCurrency ? " Br" : ""}`;
  }

  // Ищем подходящий разряд
  for (const unit of UNITS) {
    if (abs >= unit.value) {
      const scaled = abs / unit.value;
      const rounded = roundToSignificant(scaled, maxDigits);
      const suffix = style === "short" ? unit.short : unit.long;
      const sep = style === "short" ? "" : " ";
      return `${signStr}${fmtNum.format(rounded)}${sep}${suffix}${withCurrency ? " Br" : ""}`;
    }
  }

  return `${signStr}${n.toExponential(2).replace("e+", "e")}${withCurrency ? " Br" : ""}`;
}

function roundToSignificant(num, digits) {
  if (num === 0) return 0;
  const abs = Math.abs(num);
  const magnitude = Math.floor(Math.log10(abs));
  const factor = Math.pow(10, digits - 1 - magnitude);
  return Math.round(num * factor) / factor;
}

export function renderSummary(transactions) {
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0);
  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);
  const balance = income - expense;

  const incomeEl = document.getElementById("total-income");
  const expenseEl = document.getElementById("total-expense");
  const balanceEl = document.getElementById("total-balance");

  incomeEl.textContent  = formatMoneyCompact(income,  { style: "short", maxDigits: 4 });
  expenseEl.textContent = formatMoneyCompact(expense, { style: "short", maxDigits: 4 });
  balanceEl.textContent = formatMoneyCompact(balance, { style: "short", maxDigits: 4 });

  incomeEl.title  = `Доходы: ${formatMoney(income)}`;
  expenseEl.title = `Расходы: ${formatMoney(expense)}`;
  balanceEl.title = `Баланс: ${formatMoney(balance)}`;
}


export function renderTransactions(transactions, categories) {
  const list = document.getElementById("transactions-list");
  const empty = document.getElementById("empty-message");
  list.innerHTML = "";

  if (!transactions.length) {
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  const catMap = new Map(categories.map((c) => [String(c.id), c.name]));

  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  sorted.forEach((t) => {
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
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              d="M12 20h9"/>
            <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
          </svg>
        </button>
        <button class="icon-btn delete-btn" data-id="${t.id}" title="Удалить" aria-label="Удалить">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              d="M3 6h18"/>
            <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/>
            <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              d="M10 11v6M14 11v6"/>
          </svg>
        </button>
      </div>
    `;
    list.appendChild(item);
  });
}

export function renderCategoryOptions(selectEl, categories) {
  const current = selectEl.value;
  selectEl.innerHTML = `<option value="">— выберите —</option>`;
  categories.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = String(c.id);
    opt.textContent = `${c.name} (${c.type === "income" ? "доход" : "расход"})`;
    selectEl.appendChild(opt);
  });
  selectEl.value = current;
}


export function fillForm(transaction) {
  document.getElementById("transaction-id").value = String(transaction.id);
  document.getElementById("amount").value = transaction.amount;
  document.getElementById("type").value = transaction.type;
  document.getElementById("category").value = String(transaction.categoryId);
  document.getElementById("date").value = transaction.date;
  document.getElementById("comment").value = transaction.comment || "";

  document.querySelectorAll(".type-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.type === transaction.type);
  });

  document.getElementById("form-title").textContent = "Редактировать операцию";
  document.getElementById("submit-btn").textContent = "Сохранить";
  document.getElementById("cancel-edit").hidden = false;
}

export function resetForm() {
  document.getElementById("transaction-form").reset();
  document.getElementById("transaction-id").value = "";
  document.getElementById("type").value = "expense";
  document.querySelectorAll(".type-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.type === "expense");
  });
  document.getElementById("form-title").textContent = "Добавить операцию";
  document.getElementById("submit-btn").textContent = "Добавить";
  document.getElementById("cancel-edit").hidden = true;
  clearAllErrors(["amount", "category", "date"]);
}

export function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(`error-${fieldId}`);
  if (field) field.classList.add("invalid");
  if (error) error.textContent = message;
}

export function clearFieldError(fieldId) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(`error-${fieldId}`);
  if (field) field.classList.remove("invalid");
  if (error) error.textContent = "";
}

export function clearAllErrors(fieldIds) {
  fieldIds.forEach(clearFieldError);
}


export function formatDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}
