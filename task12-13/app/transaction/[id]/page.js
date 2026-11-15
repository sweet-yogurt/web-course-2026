"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/format";
import { EditIcon, TrashIcon } from "@/components/Icons";

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const data = await api.getTransaction(id);
        if (!ignore) setTransaction(data);
      } catch (requestError) {
        if (!ignore) setError(requestError.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [id]);

  const handleDelete = useCallback(async () => {
    if (!window.confirm("Удалить операцию?")) return;

    setDeleting(true);
    setError("");

    try {
      await api.deleteTransaction(id);
      router.push("/");
      router.refresh();
    } catch (requestError) {
      setError(requestError.message);
      setDeleting(false);
    }
  }, [id, router]);

  if (loading) {
    return <p className="empty-message">Загрузка…</p>;
  }

  if (error && !transaction) {
    return (
      <section className="form-section">
        <h2>Операция</h2>
        <p className="form-error">{error}</p>
        <Link href="/" className="btn-secondary btn-link">
          Назад к списку
        </Link>
      </section>
    );
  }

  if (!transaction) return null;

  return (
    <section className="form-section detail-card">
      <div className="section-heading">
        <h2>Операция #{transaction.id}</h2>
        <Link href="/" className="btn-secondary btn-link">
          Назад к списку
        </Link>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <dl className="detail-list">
        <div>
          <dt>Сумма</dt>
          <dd className={`transaction-amount ${transaction.type}`}>
            {transaction.type === "income" ? "+" : "−"}
            {formatMoney(transaction.amount)}
          </dd>
        </div>
        <div>
          <dt>Тип</dt>
          <dd>{transaction.type === "income" ? "Доход" : "Расход"}</dd>
        </div>
        <div>
          <dt>Категория</dt>
          <dd>{transaction.categoryName}</dd>
        </div>
        <div>
          <dt>Дата</dt>
          <dd>{formatDate(transaction.date)}</dd>
        </div>
        <div>
          <dt>Комментарий</dt>
          <dd>{transaction.comment || "—"}</dd>
        </div>
      </dl>

      <div className="form-actions">
        <Link href={`/add?id=${transaction.id}`} className="btn-primary btn-link">
          <EditIcon />
          Редактировать
        </Link>
        <button
          type="button"
          className="btn-secondary"
          onClick={handleDelete}
          disabled={deleting}
        >
          <TrashIcon />
          {deleting ? "Удаление…" : "Удалить"}
        </button>
      </div>
    </section>
  );
}
