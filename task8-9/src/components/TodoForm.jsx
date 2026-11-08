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
    <form className="todo-form" onSubmit={handleSubmit} noValidate>
      <div className="todo-form__row">
        <input
          className="todo-form__input"
          type="text"
          value={text}
          onChange={handleTextChange}
          placeholder="Что нужно сделать?"
          aria-label="Текст новой задачи"
          maxLength={120}
        />

        <select
          className="todo-form__status"
          value={completed ? "done" : "active"}
          onChange={(event) => setCompleted(event.target.value === "done")}
          aria-label="Статус новой задачи"
        >
          <option value="active">Невыполненная</option>
          <option value="done">Выполненная</option>
        </select>

        <button className="button button--primary" type="submit">
          Добавить
        </button>
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
