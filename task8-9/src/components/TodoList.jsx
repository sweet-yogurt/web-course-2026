import { memo, useLayoutEffect, useRef, useState } from "react";
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
  const contentRef = useRef(null);
  const [listHeight, setListHeight] = useState(null);

  useLayoutEffect(() => {
    const node = contentRef.current;
    if (!node) return undefined;

    const updateHeight = () => setListHeight(node.scrollHeight);
    updateHeight();

    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [todos]);

  return (
    <div
      className="list-viewport"
      style={{ height: listHeight === null ? "auto" : `${listHeight}px` }}
    >
      <div className="list-inner" ref={contentRef}>
        {todos.length === 0 ? (
          <p className="empty-state">По выбранному фильтру задач нет.</p>
        ) : (
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
        )}
      </div>
    </div>
  );
}

export default memo(TodoList);
