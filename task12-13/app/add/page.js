"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import TransactionForm from "@/components/TransactionForm";
import CategoryForm from "@/components/CategoryForm";

function AddPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [categories, setCategories] = useState([]);
  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const loadedCategories = await api.getCategories();
        if (ignore) return;
        setCategories(loadedCategories);

        if (editId) {
          const transaction = await api.getTransaction(editId);
          if (!ignore) setInitial(transaction);
        }
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
  }, [editId]);

  async function handleSubmit(payload) {
    setBusy(true);
    setError("");

    try {
      if (editId) {
        await api.updateTransaction(editId, payload);
      } else {
        await api.addTransaction(payload);
      }
      router.push("/");
      router.refresh();
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    } finally {
      setBusy(false);
    }
  }

  function handleCategoryCreated(category) {
    setCategories((current) => [...current, category]);
  }

  if (loading) {
    return <p className="empty-message">Загрузка…</p>;
  }

  if (error && !initial && editId) {
    return <p className="form-error">{error}</p>;
  }

  return (
    <>
      {error ? <p className="form-error">{error}</p> : null}

      <TransactionForm
        categories={categories}
        initial={initial}
        onSubmit={handleSubmit}
        busy={busy}
        title={editId ? "Редактировать операцию" : "Добавить операцию"}
        submitLabel={editId ? "Сохранить" : "Добавить"}
      />

      <CategoryForm onCreated={handleCategoryCreated} />
    </>
  );
}

export default function AddPage() {
  return (
    <Suspense fallback={<p className="empty-message">Загрузка…</p>}>
      <AddPageContent />
    </Suspense>
  );
}
