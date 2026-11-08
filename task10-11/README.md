# Лабораторная работа №10–11. Zen-Money — full-stack приложение

Учёт доходов и расходов: собственный сервер на Express + SQLite и фронтенд на чистом JavaScript с ES-модулями. Фильтрация операций выполняется на сервере через SQL, а не в браузере.

## Структура

```text
task10-11/
├── server/   # Express, better-sqlite3, cors
└── client/   # HTML, CSS и ES-модули
```

## Запуск

Сервер:

```bash
cd server
npm install
npm start
```

Сервер поднимется на `http://localhost:3001`, база `database.sqlite` создастся автоматически при первом запуске.

Клиент — в отдельном терминале:

```bash
cd client
python3 -m http.server 8080
```

Открыть `http://localhost:8080`.

Подробности по API и примеры запросов — в `server/README.md`.

## Что реализовано

- таблицы `categories` и `transactions` со связью по `category_id`;
- стартовые категории при пустой базе: «Еда», «Зарплата», «Транспорт»;
- CRUD операций и создание категорий;
- серверная фильтрация по типу, категории и диапазону дат;
- итоговая сводка «Доходы / Расходы / Баланс» на основе загруженного списка;
- валидация на сервере и клиенте;
- тема и последние фильтры сохраняются в `localStorage`;
- стили оставлены без изменений.

## API

| Метод | Роут | Назначение |
|---|---|---|
| GET | `/categories` | все категории |
| POST | `/categories` | создать категорию |
| GET | `/transactions` | операции с фильтрами `?category_id=&type=&from=&to=` |
| POST | `/transactions` | создать операцию |
| PUT | `/transactions/:id` | обновить операцию |
| DELETE | `/transactions/:id` | удалить операцию |

`GET /transactions` выполняет `JOIN` с `categories`, поэтому в ответе есть и `categoryId`, и `categoryName`, и `type`.
