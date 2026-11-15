"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { DEFAULT_FILTERS, loadSettings, saveSettings } from "@/lib/settings";
import Summary from "@/components/Summary";
import Filters from "@/components/Filters";
import TransactionList from "@/components/TransactionList";

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    setFilters(loadSettings().filters);
    setReady(true);
  }, []);

  useEffect(() => {
    let ignore = false;

    api
      .getCategories()
      .then((data) => {
        if (!ignore) setCategories(data);
      })
      .catch((requestError) => {
        if (!ignore) setError(`Не удалось загрузить категории: ${requestError.message}`);
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return undefined;

    let ignore = false;
    setLoading(true);

    api
      .getTransactions(filters)
      .then((data) => {
        if (!ignore) {
          setTransactions(data);
          setError("");
        }
      })
      .catch((requestError) => {
        if (!ignore) setError(`Не удалось загрузить операции: ${requestError.message}`);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [filters, ready, version]);

  useEffect(() => {
    if (ready) saveSettings({ filters });
  }, [filters, ready]);

  const summary = useMemo(() => {
    const totals = transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === "income") {
          acc.income += Number(transaction.amount);
        } else {
          acc.expense += Number(transaction.amount);
        }
        return acc;
      },
      { income: 0, expense: 0 }
    );

    return { ...totals, balance: totals.income - totals.expense };
  }, [transactions]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("Удалить операцию?")) return;

    setDeletingId(id);
    setError("");

    try {
      await api.deleteTransaction(id);
      setVersion((current) => current + 1);
    } catch (requestError) {
      setError(`Не удалось удалить операцию: ${requestError.message}`);
    } finally {
      setDeletingId(null);
    }
  }, []);

  const handleFiltersChange = useCallback((nextFilters) => {
    setFilters(nextFilters);
  }, []);

  const handleReset = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS });
  }, []);

  return (
    <>
      <Summary {...summary} />

      <Filters
        filters={filters}
        categories={categories}
        onChange={handleFiltersChange}
        onReset={handleReset}
      />

      <section className="transactions">
        <div className="section-heading">
          <h2>Операции</h2>
          <Link href="/add" className="btn-primary btn-link">
            Добавить операцию
          </Link>
        </div>

        {error ? <p className="form-error">{error}</p> : null}
        {loading && !transactions.length ? (
          <p className="empty-message">Загрузка…</p>
        ) : (
          <TransactionList
            transactions={transactions}
            categories={categories}
            onDelete={handleDelete}
            deletingId={deletingId}
          />
        )}
      </section>
    </>
  );
}
