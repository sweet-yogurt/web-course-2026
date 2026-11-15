# Лабораторная работа №12–13. Zen-Money на Next.js

Учёт доходов и расходов: интерфейс из лабораторной №10–11 перенесён на Next.js (App Router), а Express-сервер заменён Route Handlers внутри `app/api/`. Фильтрация по-прежнему выполняется в SQL, а не в браузере.

## Запуск

```bash
cd task12-13
npm install
npm run dev
```

Открыть `http://localhost:3000`.

Продакшен-сборка:

```bash
npm run build
npm start
```

При первом запуске создаётся `data/database.sqlite` с таблицами `categories` и `transactions` и стартовыми категориями «Еда», «Зарплата», «Транспорт». Путь к базе можно переопределить переменной `DATABASE_PATH`. В `data/` база не коммитится.

## Структура

```text
task12-13/
├── app/
│   ├── page.js                        # список операций + сводка + фильтры
│   ├── add/page.js                    # добавление и редактирование (?id=)
│   ├── transaction/[id]/page.js       # динамический роут с деталями
│   └── api/
│       ├── categories/route.js        # GET, POST
│       └── transactions/
│           ├── route.js               # GET с фильтрами, POST
│           └── [id]/route.js          # GET, PUT, DELETE
├── components/                        # Summary, Filters, TransactionList, формы
├── lib/
│   ├── db.js                          # одно соединение better-sqlite3
│   ├── validation.js                  # серверная валидация
│   ├── transactions.js                # общие SQL-запросы
│   ├── api.js                         # клиентские запросы к /api/...
│   └── format.js, settings.js
└── data/                              # SQLite-файл (в git не попадает)
```

## Что реализовано

- два роута через файловый роутинг: `/` и `/add`; навигация через `next/link`;
- динамический роут `/transaction/[id]` с деталями операции;
- те же 6 сценариев API, что были в Express: категории (GET/POST), операции (GET/POST/PUT/DELETE) и дополнительный `GET /api/transactions/:id`;
- серверная фильтрация `?category_id=&type=&from=&to=` через `WHERE` в SQL;
- серверная и клиентская валидация, коды `400`, `404`, `500` с телом `{ "error": "..." }`;
- создание категории прямо из интерфейса;
- сводка «Доходы / Расходы / Баланс»;
- тема и последние фильтры сохраняются в `localStorage`, данные — только в SQLite;
- удаление, редактирование и просмотр операции.

## API

| Метод | Роут | Назначение |
|---|---|---|
| GET | `/api/categories` | все категории |
| POST | `/api/categories` | создать категорию |
| GET | `/api/transactions` | операции, фильтры `?category_id=&type=&from=&to=` |
| POST | `/api/transactions` | создать операцию |
| GET | `/api/transactions/:id` | одна операция |
| PUT | `/api/transactions/:id` | обновить операцию |
| DELETE | `/api/transactions/:id` | удалить операцию |

Тип операции хранится в категории, поэтому в ответах есть `categoryId`, `categoryName` и `type`.

### Проверка через curl

```text
GET /api/categories
[{"id":1,"name":"Еда","type":"expense"},{"id":2,"name":"Зарплата","type":"income"},{"id":3,"name":"Транспорт","type":"expense"}]
[200]

POST /api/categories  {"name":"Книги","type":"expense"}
{"id":4,"name":"Книги","type":"expense"}
[201]

POST /api/transactions  {"amount":42.5,"category_id":1,"date":"2026-11-08","comment":"Продукты"}
{"id":1,"amount":42.5,"categoryId":1,"categoryName":"Еда","type":"expense","date":"2026-11-08","comment":"Продукты"}
[201]

GET /api/transactions?type=expense&from=2026-11-01&to=2026-11-30
[{"id":1,"amount":42.5,"categoryId":1,"categoryName":"Еда","type":"expense","date":"2026-11-08","comment":"Продукты"}]
[200]

GET /api/transactions/1
{"id":1,"amount":42.5,"categoryId":1,"categoryName":"Еда","type":"expense","date":"2026-11-08","comment":"Продукты"}
[200]

PUT /api/transactions/1  {"amount":50,"category_id":1,"date":"2026-11-08","comment":"Обновлено"}
{"id":1,"amount":50,"categoryId":1,"categoryName":"Еда","type":"expense","date":"2026-11-08","comment":"Обновлено"}
[200]

DELETE /api/transactions/1
[204]

DELETE /api/transactions/999
{"error":"Операция не найдена"}
[404]

POST /api/transactions  {"amount":-1,...}
{"error":"Сумма должна быть положительным числом"}
[400]
```

## CSR, SSR и SSG в этом проекте

Страница `/` — клиентский компонент (`"use client"`), поэтому список операций загружается через `fetch` уже в браузере: это **CSR**, данные приходят из `/api/transactions` после монтирования. Сам каркас страницы Next.js отдаёт с сервера, но данные в HTML не попадают. **SSR** в чистом виде здесь не используется, хотя API Route Handlers выполняются на сервере при каждом запросе (`dynamic = "force-dynamic"`), потому что читают актуальную SQLite-базу. **SSG** тоже не подходит для списка операций: он статичен на момент сборки, а данные меняются. Поэтому проект сознательно построен как CSR-приложение с серверным API; при необходимости страницу можно перевести на серверный компонент с `fetch` и получить SSR.

## API Routes и Express

Сходство: и там, и там обработчик получает HTTP-запрос, читает тело/query-параметры и возвращает статус и JSON — логика валидации и SQL почти дословно перенесена из Express-версии. Отличие: Express-сервер — отдельный процесс на отдельном порту, а Route Handlers — часть того же Next.js-приложения; маршрут задаётся файловой структурой `app/api/...`, а не `app.use()`. Поэтому на Vercel нет отдельного бэкенда и CORS: клиент и API деплоятся и работают как одно целое, относительные пути `/api/...` попадают в тот же проект.

## Деплой на Vercel

Проект подготовлен к деплою: `next.config.mjs` выносит `better-sqlite3` в `serverExternalPackages`, а `lib/db.js` на Vercel использует `/tmp/zen-money.sqlite`, потому что остальная файловая система serverless-окружения доступна только на чтение.

```bash
npx vercel
```

В этом окружении Vercel CLI не авторизован, поэтому фактический деплой нужно выполнить из аккаунта владельца репозитория и добавить ссылку сюда.

Важное ограничение SQLite на Vercel: `/tmp` может пересоздаваться при холодном старте или переключении инстанса, поэтому данные не гарантированно сохраняются между запросами. Для учебной демонстрации этого достаточно; для реального приложения нужна внешняя БД (Postgres, Turso и т. п.). Эту особенность стоит проверить на деплое и отметить в отчёте.

## Ограничения

- SQLite-файл на Vercel не является постоянным хранилищем (см. выше);
- нет тестов — они появятся в лабораторной №14;
- аутентификации и разделения пользователей нет.
