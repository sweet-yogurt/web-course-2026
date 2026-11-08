import { formatMoney, formatMoneyCompact } from "../util/format.js";
import { el } from "./dom.js";

export const summaryView = {
  render({ income, expense, balance }) {
    el.totalIncome.textContent  = formatMoneyCompact(income,  { style: "short", maxDigits: 4 });
    el.totalExpense.textContent = formatMoneyCompact(expense, { style: "short", maxDigits: 4 });
    el.totalBalance.textContent = formatMoneyCompact(balance, { style: "short", maxDigits: 4 });

    el.totalIncome.title  = `Доходы: ${formatMoney(income)}`;
    el.totalExpense.title = `Расходы: ${formatMoney(expense)}`;
    el.totalBalance.title = `Баланс: ${formatMoney(balance)}`;
  },
};
