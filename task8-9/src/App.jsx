import { useCallback, useEffect, useMemo, useState } from "react";
import TodoForm from "./components/TodoForm.jsx";
import Filters from "./components/Filters.jsx";
import SortControls from "./components/SortControls.jsx";
import Stats from "./components/Stats.jsx";
import TodoList from "./components/TodoList.jsx";
import {
  createTodo,
  filterTodos,
  getStats,
  sortTodos,
} from "./utils/todos.js";
import { loadTodos, saveTodos } from "./utils/storage.js";

export default function App() {
  const [todos, setTodos] = useState(loadTodos);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("date-desc");

  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  const handleAdd = useCallback((text, completed) => {
    setTodos((previous) => [createTodo(text, completed), ...previous]);
  }, []);

  const handleToggle = useCallback((id) => {
    setTodos((previous) =>
      previous.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }, []);

  const handleDelete = useCallback((id) => {
    setTodos((previous) => previous.filter((todo) => todo.id !== id));
  }, []);

  const handleEdit = useCallback((id, text) => {
    setTodos((previous) =>
      previous.map((todo) => (todo.id === id ? { ...todo, text } : todo))
    );
  }, []);

  const visibleTodos = useMemo(
    () => sortTodos(filterTodos(todos, filter), sort),
    [todos, filter, sort]
  );

  const stats = useMemo(() => getStats(todos), [todos]);

  return (
    <main className="app">
      <header className="app-header">
        <h1 className="app-title">
          <span className="title-bracket">[</span>
          Todo-лист
          <span className="title-bracket">]</span>
        </h1>
        <p className="app-subtitle">Лабораторная №8–9 · react</p>
      </header>

      <TodoForm onAdd={handleAdd} />

      <section className="controls-section">
        <Stats
          total={stats.total}
          remaining={stats.remaining}
          completed={stats.completed}
        />
        <div className="toolbar">
          <Filters value={filter} onChange={setFilter} />
          <SortControls value={sort} onChange={setSort} />
        </div>
      </section>

      <section className="list-section">
        <TodoList
          todos={visibleTodos}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      </section>
    </main>
  );
}
