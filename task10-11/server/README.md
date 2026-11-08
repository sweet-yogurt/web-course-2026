# Zen-Money API

Сервер на Express + better-sqlite3 + cors. Порт по умолчанию — `3001`.

## Установка и запуск

```bash
npm install
npm start
```

При первом запуске создаётся `database.sqlite` с таблицами `categories` и `transactions`. Если категорий нет, добавляются «Еда» (expense), «Зарплата» (income) и «Транспорт» (expense). Файл базы в git не коммитится.

## Роуты

| Метод | Роут | Тело/параметры |
|---|---|---|
| GET | `/categories` | — |
| POST | `/categories` | `{ "name": "Книги", "type": "expense" }` |
| GET | `/transactions` | `?category_id=1&type=expense&from=2026-01-01&to=2026-12-31` |
| POST | `/transactions` | `{ "amount": 42.5, "category_id": 1, "date": "2026-11-08", "comment": "Продукты" }` |
| PUT | `/transactions/:id` | те же поля, что и у POST |
| DELETE | `/transactions/:id` | — |

Тип операции не хранится в `transactions`: он берётся из связанной категории через `JOIN`. Поэтому в ответах есть `type`, `categoryId` и `categoryName`.

## Валидация

- `amount` — число больше 0;
- `category_id` — существующая категория;
- `date` — реальная дата в формате `YYYY-MM-DD`;
- `name` категории — непустая строка;
- `type` категории — только `income` или `expense`;
- несуществующий id операции → `404`;
- ошибки валидации → `400` с телом `{ "error": "..." }`;
- непредвиденные ошибки → `500`.

## Проверка через curl

```text
GET /categories
[{"id":1,"name":"Еда","type":"expense"},{"id":2,"name":"Зарплата","type":"income"},{"id":3,"name":"Транспорт","type":"expense"}]
[200]

POST /categories
{"id":4,"name":"Книги","type":"expense"}
[201]

POST /transactions
{"id":1,"amount":42.5,"categoryId":1,"categoryName":"Еда","type":"expense","date":"2026-11-08","comment":"Продукты"}
[201]

GET /transactions?type=expense&from=2026-11-01&to=2026-11-30
[{"id":1,"amount":42.5,"categoryId":1,"categoryName":"Еда","type":"expense","date":"2026-11-08","comment":"Продукты"}]
[200]

PUT /transactions/1
{"id":1,"amount":50,"categoryId":1,"categoryName":"Еда","type":"expense","date":"2026-11-08","comment":"Обновлено"}
[200]

DELETE /transactions/1
[204]

GET /transactions/999
{"error":"Операция не найдена"}
[404]

POST /transactions (invalid)
{"error":"Сумма должна быть положительным числом"}
[400]
```
