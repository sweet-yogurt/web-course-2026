# Лабораторная работа №12–13. Zen-Money на Next.js

Учёт доходов и расходов: интерфейс из лабораторной №10–11 перенесён на Next.js (App Router), а Express-сервер заменён Route Handlers внутри `app/api/`. Данные хранятся в Vercel Blob Store `web-course-2026-blob` (JSON), а для локального запуска без токена автоматически используется SQLite.

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

Без переменных окружения приложение работает на локальной SQLite: при первом запуске создаётся `data/database.sqlite` с таблицами `categories` и `transactions` и стартовыми категориями «Еда», «Зарплата», «Транспорт». Путь к базе можно переопределить переменной `DATABASE_PATH`. В `data/` база не коммитится.

Чтобы локально работать с тем же Vercel Blob, что и на деплое:

```bash
cp .env.example .env.local
# вписать BLOB_READ_WRITE_TOKEN из Vercel
# или выполнить: npx vercel env pull .env.local
npm run dev
```

Если `BLOB_READ_WRITE_TOKEN` (или `BLOB_STORE_ID` для OIDC) задан, приложение использует Vercel Blob; иначе — SQLite.

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
│   ├── repository.js                  # выбор хранилища: Blob или SQLite
│   ├── storage/
│   │   ├── blob.js                    # Vercel Blob, JSON-файл zen-money/data.json
│   │   └── sqlite.js                  # better-sqlite3, SQL-фильтры
│   ├── db.js                          # ленивое соединение SQLite
│   ├── validation.js                  # серверная валидация
│   ├── api.js                         # клиентские запросы к /api/...
│   └── format.js, settings.js
├── .env.example                       # BLOB_READ_WRITE_TOKEN, BLOB_ACCESS
└── data/                              # SQLite-файл (в git не попадает)
```

## Что реализовано

- два роута через файловый роутинг: `/` и `/add`; навигация через `next/link`;
- динамический роут `/transaction/[id]` с деталями операции;
- те же 6 сценариев API, что были в Express: категории (GET/POST), операции (GET/POST/PUT/DELETE) и дополнительный `GET /api/transactions/:id`;
- серверная фильтрация `?category_id=&type=&from=&to=` (в SQLite — через `WHERE`, в Blob — по загруженному JSON);
- серверная и клиентская валидация, коды `400`, `404`, `500` с телом `{ "error": "..." }`;
- создание категории прямо из интерфейса;
- сводка «Доходы / Расходы / Баланс»;
- тема и последние фильтры сохраняются в `localStorage`, данные — в Blob или SQLite;
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

## Хранилище: SQLite и Vercel Blob

`lib/repository.js` выбирает реализацию один раз при первом запросе:

- если задан `BLOB_READ_WRITE_TOKEN` или `BLOB_STORE_ID` — `lib/storage/blob.js`;
- иначе — `lib/storage/sqlite.js`.

Обе реализации возвращают одинаковые объекты (`category`, `transaction` с `categoryName` и `type`), поэтому Route Handlers не знают, где именно лежат данные.

Vercel Blob Store называется **web-course-2026-blob**. В нём хранится один JSON-файл `zen-money/data.json` со структурой:

```json
{
  "version": 1,
  "nextCategoryId": 4,
  "nextTransactionId": 1,
  "categories": [{ "id": 1, "name": "Еда", "type": "expense" }],
  "transactions": []
}
```

Особенности Blob-реализации:

- каждая запись — read-modify-write всего JSON-файла; от гонок защищает `ifMatch` по ETag и до 5 повторных попыток;
- фильтрация и сортировка выполняются в памяти после чтения файла (Blob — объектное хранилище, а не SQL);
- публичное чтение идёт по URL с параметром версии, чтобы не получить устаревший ответ из CDN;
- режим доступа задаётся `BLOB_ACCESS` (`public` по умолчанию, для private-store — `private`).

В SQLite-режиме фильтрация по-прежнему выполняется запросом `WHERE`, как требовалось в лабораторной №10–11.

## CSR, SSR и SSG в этом проекте

Страница `/` — клиентский компонент (`"use client"`), поэтому список операций загружается через `fetch` уже в браузере: это **CSR**, данные приходят из `/api/transactions` после монтирования. Сам каркас страницы Next.js отдаёт с сервера, но данные в HTML не попадают. **SSR** в чистом виде здесь не используется, хотя API Route Handlers выполняются на сервере при каждом запросе (`dynamic = "force-dynamic"`), потому что читают актуальное хранилище — Vercel Blob или SQLite. **SSG** тоже не подходит для списка операций: он статичен на момент сборки, а данные меняются. Поэтому проект сознательно построен как CSR-приложение с серверным API; при необходимости страницу можно перевести на серверный компонент с `fetch` и получить SSR.

## API Routes и Express

Сходство: и там, и там обработчик получает HTTP-запрос, читает тело/query-параметры и возвращает статус и JSON — валидация и контракты API перенесены из Express-версии. Отличие: Express-сервер — отдельный процесс на отдельном порту, а Route Handlers — часть того же Next.js-приложения; маршрут задаётся файловой структурой `app/api/...`, а не `app.use()`. Поэтому на Vercel нет отдельного бэкенда и CORS: клиент и API деплоятся и работают как одно целое, относительные пути `/api/...` попадают в тот же проект.

## Деплой на Vercel

Деплой: **https://web-course-2026-chi.vercel.app**

Проект задеплоен на Vercel. `next.config.mjs` выносит `better-sqlite3` в `serverExternalPackages`, но на деплое используется Vercel Blob: проект подключён к store `web-course-2026-blob`, а `BLOB_READ_WRITE_TOKEN` добавляется Vercel в окружение автоматически. Поэтому данные сохраняются между запросами и холодными стартами — в отличие от SQLite в `/tmp`.

После подключения store к проекту нужно передеплоить приложение (`Deployments → Redeploy` или новый push), чтобы функция получила переменную окружения. На задеплоенной версии проверяются те же сценарии: `GET /api/categories`, `POST /api/transactions`, `GET /api/transactions` с фильтрами, `GET/PUT/DELETE /api/transactions/:id`, а также ответы `404` и `400`.

## Ограничения

- Vercel Blob — не реляционная БД: весь JSON перезаписывается целиком, поэтому при большом количестве операций запись станет неэффективной;
- нет тестов — они появятся в лабораторной №14;
- аутентификации и разделения пользователей нет.
