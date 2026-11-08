# Лабораторная работа №8–9. Todo-list на React

Todo-list на Vite + React: добавление, выполнение, редактирование и удаление задач, фильтры, сортировка, счётчики и сохранение в `localStorage`.

## Запуск

```bash
npm install
npm run dev
```

## Структура

- `src/App.jsx` — состояние задач, обработчики и мемоизированные фильтр/сортировка/статистика;
- `src/components/` — `TodoForm`, `Filters`, `SortControls`, `Stats`, `TodoList`, `TodoItem`;
- `src/utils/todos.js` — конфигурация фильтров и сортировок, чистые функции;
- `src/utils/storage.js` — загрузка и сохранение задач в `localStorage`.

Опциональные части (json-server и загрузка с jsonplaceholder) не реализованы: данные хранятся в `localStorage`.
