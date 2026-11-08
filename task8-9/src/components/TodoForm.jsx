import { useState } from "react";

/**
 * Форма добавления задачи.
 * @param {{ onAdd: (text: string, completed: boolean) => void }} props
 */
export default function TodoForm({ onAdd }) {
  const [text, setText] = useState("");
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const value = text.trim();

    if (!value) {
      setError("Введите текст задачи");
      return;
    }

    onAdd(value, completed);
    setText("");
    setCompleted(false);
    setError("");
  }

  function handleTextChange(event) {
    setText(event.target.value);
    if (error) setError("");
  }

  return (
    <form className="input-section" onSubmit={handleSubmit} noValidate>
      <div className="input-row">
        <input
          type="text"
          value={text}
          onChange={handleTextChange}
          placeholder="Буханка молока, литр хлеба..."
          aria-label="Текст новой задачи"
          maxLength={120}
          autoComplete="off"
        />

        <select
          className="status-select"
          value={completed ? "done" : "active"}
          onChange={(event) => setCompleted(event.target.value === "done")}
          aria-label="Статус новой задачи"
        >
          <option value="active">Невыполненная</option>
          <option value="done">Выполненная</option>
        </select>

        <button type="submit">Добавить</button>
      </div>

      <p className="warning-message" role="alert">
        {error}
      </p>
    </form>
  );
}
