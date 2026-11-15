"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

function todayIso() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

const EMPTY_FORM = {
  amount: "",
  type: "expense",
  categoryId: "",
  date: "",
  comment: "",
};

export default function TransactionForm({
  categories,
  initial = null,
  onSubmit,
  submitLabel = "Добавить",
  title = "Добавить операцию",
  busy = false,
}) {
  const [form, setForm] = useState(() =>
    initial
      ? {
          amount: String(initial.amount),
          type: initial.type,
          categoryId: String(initial.categoryId),
          date: initial.date,
          comment: initial.comment || "",
        }
      : { ...EMPTY_FORM, date: todayIso() }
  );
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (!initial) return;
    setForm({
      amount: String(initial.amount),
      type: initial.type,
      categoryId: String(initial.categoryId),
      date: initial.date,
      comment: initial.comment || "",
    });
  }, [initial]);

  const availableCategories = useMemo(
    () => categories.filter((category) => category.type === form.type),
    [categories, form.type]
  );

  function update(patch) {
    setForm((current) => ({ ...current, ...patch }));
    setErrors((current) => {
      const next = { ...current };
      for (const field of Object.keys(patch)) {
        delete next[field];
      }
      return next;
    });
  }

  function changeType(type) {
    const categoryStillValid = categories.some(
      (category) =>
        category.type === type && String(category.id) === form.categoryId
    );

    update({
      type,
      categoryId: categoryStillValid ? form.categoryId : "",
    });
  }

  function validate() {
    const nextErrors = {};

    if (!form.amount.trim()) {
      nextErrors.amount = "Введите сумму";
    } else if (!Number.isFinite(Number(form.amount)) || Number(form.amount) <= 0) {
      nextErrors.amount = "Сумма должна быть положительным числом";
    }

    if (!form.categoryId) {
      nextErrors.categoryId = "Выберите категорию";
    }

    if (!form.date) {
      nextErrors.date = "Укажите дату";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setServerError("");

    if (!validate()) return;

    try {
      await onSubmit({
        amount: Number(form.amount),
        categoryId: Number(form.categoryId),
        date: form.date,
        comment: form.comment.trim(),
      });
    } catch (error) {
      setServerError(error.message);
    }
  }

  return (
    <section className="form-section">
      <h2>{title}</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-row">
          <label>
            Сумма *
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={(event) => update({ amount: event.target.value })}
              className={errors.amount ? "invalid" : ""}
              aria-invalid={Boolean(errors.amount)}
            />
            <span className="error">{errors.amount || ""}</span>
          </label>

          <label>
            Тип
            <div className="type-switch">
              <button
                type="button"
                className={`type-btn ${form.type === "expense" ? "active" : ""}`}
                onClick={() => changeType("expense")}
              >
                Расход
              </button>
              <button
                type="button"
                className={`type-btn ${form.type === "income" ? "active" : ""}`}
                onClick={() => changeType("income")}
              >
                Доход
              </button>
            </div>
          </label>
        </div>

        <div className="form-row">
          <label>
            Категория *
            <select
              value={form.categoryId}
              onChange={(event) => update({ categoryId: event.target.value })}
              className={errors.categoryId ? "invalid" : ""}
              aria-invalid={Boolean(errors.categoryId)}
            >
              <option value="">— выберите —</option>
              {availableCategories.map((category) => (
                <option key={category.id} value={String(category.id)}>
                  {category.name}
                </option>
              ))}
            </select>
            <span className="error">{errors.categoryId || ""}</span>
          </label>

          <label>
            Дата *
            <input
              type="date"
              value={form.date}
              onChange={(event) => update({ date: event.target.value })}
              className={errors.date ? "invalid" : ""}
              aria-invalid={Boolean(errors.date)}
            />
            <span className="error">{errors.date || ""}</span>
          </label>
        </div>

        <label>
          Комментарий
          <input
            type="text"
            placeholder="Необязательно"
            value={form.comment}
            onChange={(event) => update({ comment: event.target.value })}
          />
        </label>

        {serverError ? <p className="form-error">{serverError}</p> : null}

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? "Сохранение…" : submitLabel}
          </button>
          <Link href="/" className="btn-secondary btn-link">
            Отмена
          </Link>
        </div>
      </form>
    </section>
  );
}
