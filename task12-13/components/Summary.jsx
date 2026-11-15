import { memo } from "react";
import { formatMoney, formatMoneyCompact } from "@/lib/format";

function Summary({ income, expense, balance }) {
  return (
    <section className="summary">
      <div className="summary-card income">
        <span className="label">Доходы</span>
        <span
          className="value"
          title={`Доходы: ${formatMoney(income)}`}
        >
          {formatMoneyCompact(income, { style: "short", maxDigits: 4 })}
        </span>
      </div>
      <div className="summary-card expense">
        <span className="label">Расходы</span>
        <span
          className="value"
          title={`Расходы: ${formatMoney(expense)}`}
        >
          {formatMoneyCompact(expense, { style: "short", maxDigits: 4 })}
        </span>
      </div>
      <div className="summary-card balance">
        <span className="label">Баланс</span>
        <span
          className="value"
          title={`Баланс: ${formatMoney(balance)}`}
        >
          {formatMoneyCompact(balance, { style: "short", maxDigits: 4 })}
        </span>
      </div>
    </section>
  );
}

export default memo(Summary);
