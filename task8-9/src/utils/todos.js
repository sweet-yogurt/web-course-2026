export const FILTERS = [
  { id: "all", label: "Все" },
  { id: "active", label: "Активные" },
  { id: "completed", label: "Завершённые" },
];

const filterPredicates = {
  all: () => true,
  active: (todo) => !todo.completed,
  completed: (todo) => todo.completed,
};

export const SORT_OPTIONS = [
  { id: "date-desc", label: "Сначала новые" },
  { id: "date-asc", label: "Сначала старые" },
  { id: "alpha-asc", label: "По алфавиту: А → Я" },
  { id: "alpha-desc", label: "По алфавиту: Я → А" },
];

const comparators = {
  "date-desc": (a, b) => b.createdAt - a.createdAt,
  "date-asc": (a, b) => a.createdAt - b.createdAt,
  "alpha-asc": (a, b) =>
    a.text.localeCompare(b.text, "ru", { sensitivity: "base" }),
  "alpha-desc": (a, b) =>
    b.text.localeCompare(a.text, "ru", { sensitivity: "base" }),
};

export function filterTodos(todos, filterId) {
  const predicate = filterPredicates[filterId] ?? filterPredicates.all;
  return todos.filter(predicate);
}

export function sortTodos(todos, sortId) {
  const comparator = comparators[sortId] ?? comparators["date-desc"];
  return [...todos].sort(comparator);
}

export function createTodo(text, completed = false) {
  return {
    id: crypto.randomUUID(),
    text: text.trim(),
    completed,
    createdAt: Date.now(),
  };
}

export function getStats(todos) {
  const completed = todos.filter((todo) => todo.completed).length;

  return {
    total: todos.length,
    completed,
    remaining: todos.length - completed,
  };
}
