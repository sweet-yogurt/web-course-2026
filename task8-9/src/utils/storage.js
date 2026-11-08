const STORAGE_KEY = "todo-react-items";

export function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item) => item && typeof item.text === "string")
      .map((item) => ({
        id:
          typeof item.id === "string" && item.id
            ? item.id
            : crypto.randomUUID(),
        text: item.text.trim(),
        completed: Boolean(item.completed),
        createdAt: Number.isFinite(item.createdAt)
          ? item.createdAt
          : Date.now(),
      }))
      .filter((item) => item.text.length > 0);
  } catch {
    return [];
  }
}

export function saveTodos(todos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    // localStorage может быть недоступен (приватный режим или лимит хранилища)
  }
}
