import { memo } from "react";
import TodoItem from "./TodoItem.jsx";

/**
 * Список задач.
 * @param {{
 *   todos: Array<{ id: string, text: string, completed: boolean, createdAt: number }>,
 *   onToggle: (id: string) => void,
 *   onDelete: (id: string) => void,
 *   onEdit: (id: string, text: string) => void
 * }} props
 */
function TodoList({ todos, onToggle, onDelete, onEdit }) {
  if (todos.length === 0) {
    return <p className="empty-state">По выбранному фильтру задач нет.</p>;
  }

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </ul>
  );
}

export default memo(TodoList);
