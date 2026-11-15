import { describe, expect, it } from "vitest";
import {
  createTodo,
  filterTodos,
  getStats,
  sortTodos,
} from "./todos.js";

const todos = [
  { id: "1", text: "Молоко", completed: false, createdAt: 100 },
  { id: "2", text: "Хлеб", completed: true, createdAt: 200 },
  { id: "3", text: "Яблоко", completed: false, createdAt: 300 },
];

describe("filterTodos", () => {
  it("возвращает все задачи для фильтра all", () => {
    expect(filterTodos(todos, "all")).toEqual(todos);
  });

  it("оставляет только активные задачи", () => {
    expect(filterTodos(todos, "active").map((todo) => todo.id)).toEqual([
      "1",
      "3",
    ]);
  });

  it("оставляет только завершённые задачи", () => {
    expect(filterTodos(todos, "completed").map((todo) => todo.id)).toEqual([
      "2",
    ]);
  });

  it("возвращает пустой массив, если подходящих задач нет", () => {
    const activeOnly = todos.filter((todo) => !todo.completed);
    expect(filterTodos(activeOnly, "completed")).toEqual([]);
  });

  it("для неизвестного фильтра ведёт себя как all", () => {
    expect(filterTodos(todos, "unknown-filter")).toEqual(todos);
  });
});

describe("sortTodos", () => {
  it("по умолчанию сортирует сначала новые задачи", () => {
    expect(sortTodos(todos, "unknown-sort").map((todo) => todo.id)).toEqual([
      "3",
      "2",
      "1",
    ]);
  });

  it("сортирует по дате создания от старых к новым", () => {
    expect(sortTodos(todos, "date-asc").map((todo) => todo.id)).toEqual([
      "1",
      "2",
      "3",
    ]);
  });

  it("сортирует по тексту в прямом и обратном порядке", () => {
    expect(sortTodos(todos, "alpha-asc").map((todo) => todo.text)).toEqual([
      "Молоко",
      "Хлеб",
      "Яблоко",
    ]);

    expect(sortTodos(todos, "alpha-desc").map((todo) => todo.text)).toEqual([
      "Яблоко",
      "Хлеб",
      "Молоко",
    ]);
  });

  it("не мутирует исходный массив", () => {
    const original = [...todos];
    sortTodos(todos, "alpha-asc");

    expect(todos).toEqual(original);
  });
});

describe("getStats", () => {
  it("считает общее количество, завершённые и оставшиеся задачи", () => {
    expect(getStats(todos)).toEqual({
      total: 3,
      completed: 1,
      remaining: 2,
    });
  });

  it("корректно работает с пустым списком", () => {
    expect(getStats([])).toEqual({
      total: 0,
      completed: 0,
      remaining: 0,
    });
  });

  it("корректно работает, когда все задачи завершены", () => {
    const completed = todos.map((todo) => ({ ...todo, completed: true }));
    expect(getStats(completed)).toEqual({
      total: 3,
      completed: 3,
      remaining: 0,
    });
  });
});

describe("createTodo", () => {
  it("создаёт задачу с обрезанным текстом и флагом completed", () => {
    const todo = createTodo("  Купить хлеб  ", true);

    expect(todo).toMatchObject({
      text: "Купить хлеб",
      completed: true,
    });
    expect(todo.id).toEqual(expect.any(String));
    expect(todo.id.length).toBeGreaterThan(0);
    expect(todo.createdAt).toEqual(expect.any(Number));
  });

  it("по умолчанию создаёт незавершённую задачу", () => {
    expect(createTodo("Полить цветы").completed).toBe(false);
  });
});
