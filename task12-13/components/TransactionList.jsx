import { memo } from "react";
import Link from "next/link";
import { formatDate, formatMoney, formatMoneyCompact } from "@/lib/format";
import { EditIcon, TrashIcon } from "./Icons";

function TransactionList({ transactions, categories, onDelete, deletingId }) {
  if (!transactions.length) {
    return (
      <p className="empty-message">Нет операций по выбранным фильтрам.</p>
    );
  }

  const categoryNames = new Map(
    categories.map((category) => [String(category.id), category.name])
  );

  return (
    <div className="transactions-list">
      {transactions.map((transaction) => {
        const compact = formatMoneyCompact(transaction.amount, {
          style: "long",
          maxDigits: 5,
          withCurrency: true,
        });

        return (
          <article
            key={transaction.id}
            className={`transaction-item ${transaction.type}`}
          >
            <span className="transaction-date">
              {formatDate(transaction.date)}
            </span>

            <Link
              href={`/transaction/${transaction.id}`}
              className="transaction-info transaction-info-link"
            >
              <span className="transaction-category">
                {categoryNames.get(String(transaction.categoryId)) || "—"}
              </span>
              {transaction.comment ? (
                <span className="transaction-comment">
                  {transaction.comment}
                </span>
              ) : null}
            </Link>

            <span
              className={`transaction-amount ${transaction.type}`}
              title={formatMoney(transaction.amount)}
            >
              {transaction.type === "income" ? "+" : "−"}
              {compact}
            </span>

            <div className="transaction-actions">
              <Link
                href={`/add?id=${transaction.id}`}
                className="icon-btn edit-btn"
                title="Редактировать"
                aria-label="Редактировать"
              >
                <EditIcon />
              </Link>
              <button
                type="button"
                className="icon-btn delete-btn"
                title="Удалить"
                aria-label="Удалить"
                onClick={() => onDelete(transaction.id)}
                disabled={deletingId === transaction.id}
              >
                <TrashIcon />
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default memo(TransactionList);
