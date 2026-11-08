import { memo, useState } from "react";

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * Одна задача в списке.
 * @param {{
 *   todo: { id: string, text: string, completed: boolean, createdAt: number },
 *   onToggle: (id: string) => void,
 *   onDelete: (id: string) => void,
 *   onEdit: (id: string, text: string) => void
 * }} props
 */
function TodoItem({ todo, onToggle, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(todo.text);
  const [error, setError] = useState("");

  function startEditing() {
    setDraft(todo.text);
    setError("");
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setError("");
  }

  function handleSave(event) {
    event.preventDefault();
    const value = draft.trim();

    if (!value) {
      setError("Текст не может быть пустым");
      return;
    }

    onEdit(todo.id, value);
    setIsEditing(false);
    setError("");
  }

  if (isEditing) {
    return (
      <li className="todo-item">
        <form className="todo-edit" onSubmit={handleSave}>
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            aria-label="Новый текст задачи"
            maxLength={120}
            autoFocus
          />
          <button className="edit-btn" type="submit">
            Сохранить
          </button>
          <button className="edit-btn" type="button" onClick={cancelEditing}>
            Отмена
          </button>
          <span className="warning-message" role="alert">
            {error}
          </span>
        </form>
      </li>
    );
  }

  return (
    <li className={todo.completed ? "todo-item completed" : "todo-item"}>
      <label className="todo-check">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          aria-label={
            todo.completed
              ? `Отметить задачу «${todo.text}» невыполненной`
              : `Отметить задачу «${todo.text}» выполненной`
          }
        />
        <span className="todo-text">{todo.text}</span>
      </label>

      <time
        className="todo-date"
        dateTime={new Date(todo.createdAt).toISOString()}
      >
        {dateFormatter.format(todo.createdAt)}
      </time>

      <div className="todo-actions">
        <button className="edit-btn" type="button" onClick={startEditing}>
          Изменить
        </button>
        <button
          className="delete-btn"
          type="button"
          onClick={() => onDelete(todo.id)}
        >
          Удалить
        </button>
      </div>
    </li>
  );
}

export default memo(TodoItem);
