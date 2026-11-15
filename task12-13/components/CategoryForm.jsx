"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function CategoryForm({ onCreated }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("expense");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Введите название категории");
      return;
    }

    setBusy(true);
    try {
      const created = await api.addCategory({ name: name.trim(), type });
      onCreated(created);
      setName("");
      setType("expense");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="form-section">
      <h2>Новая категория</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-row">
          <label>
            Название *
            <input
              type="text"
              placeholder="Например: Спорт"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError("");
              }}
              className={error ? "invalid" : ""}
            />
            <span className="error">{error}</span>
          </label>

          <label>
            Тип *
            <select value={type} onChange={(event) => setType(event.target.value)}>
              <option value="expense">Расход</option>
              <option value="income">Доход</option>
            </select>
          </label>
        </div>

        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? "Создание…" : "Создать категорию"}
        </button>
      </form>
    </section>
  );
}
