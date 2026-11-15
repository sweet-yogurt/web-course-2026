import { getDb as db } from "@/lib/db";
import {
  ValidationError,
  isValidDate,
  parsePositiveId,
} from "@/lib/validation";

const SELECT_TRANSACTION = `
  SELECT
    t.id,
    t.amount,
    t.category_id AS categoryId,
    c.name AS categoryName,
    c.type AS type,
    t.date,
    t.comment
  FROM transactions t
  JOIN categories c ON c.id = t.category_id
`;

export async function listCategories() {
  return db()
    .prepare("SELECT id, name, type FROM categories ORDER BY id")
    .all();
}

export async function createCategory({ name, type }) {
  const connection = db();
  const result = connection
    .prepare("INSERT INTO categories (name, type) VALUES (?, ?)")
    .run(name, type);

  return connection
    .prepare("SELECT id, name, type FROM categories WHERE id = ?")
    .get(result.lastInsertRowid);
}

function categoryExists(connection, id) {
  return Boolean(
    connection.prepare("SELECT id FROM categories WHERE id = ?").get(id)
  );
}

export async function listTransactions(filters = {}) {
  const conditions = [];
  const params = {};

  if (filters.categoryId !== undefined) {
    const categoryId = parsePositiveId(filters.categoryId);
    if (!categoryId) {
      throw new ValidationError("Некорректный category_id");
    }
    conditions.push("t.category_id = @categoryId");
    params.categoryId = categoryId;
  }

  if (filters.type !== undefined) {
    if (filters.type !== "income" && filters.type !== "expense") {
      throw new ValidationError("type должен быть income или expense");
    }
    conditions.push("c.type = @type");
    params.type = filters.type;
  }

  if (filters.from !== undefined) {
    if (!isValidDate(filters.from)) {
      throw new ValidationError("from должен быть в формате YYYY-MM-DD");
    }
    conditions.push("t.date >= @from");
    params.from = filters.from;
  }

  if (filters.to !== undefined) {
    if (!isValidDate(filters.to)) {
      throw new ValidationError("to должен быть в формате YYYY-MM-DD");
    }
    conditions.push("t.date <= @to");
    params.to = filters.to;
  }

  const where = conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "";
  const sql = `${SELECT_TRANSACTION}${where} ORDER BY t.date DESC, t.id DESC`;
  const connection = db();

  return conditions.length
    ? connection.prepare(sql).all(params)
    : connection.prepare(sql).all();
}

export async function getTransactionById(id) {
  return db()
    .prepare(`${SELECT_TRANSACTION} WHERE t.id = ?`)
    .get(id);
}

export async function createTransaction({ amount, categoryId, date, comment }) {
  const connection = db();

  if (!categoryExists(connection, categoryId)) {
    throw new ValidationError("Категория не найдена");
  }

  const result = connection
    .prepare(
      `INSERT INTO transactions (amount, category_id, date, comment)
       VALUES (?, ?, ?, ?)`
    )
    .run(amount, categoryId, date, comment);

  return connection
    .prepare(`${SELECT_TRANSACTION} WHERE t.id = ?`)
    .get(result.lastInsertRowid);
}

export async function updateTransaction(id, { amount, categoryId, date, comment }) {
  const connection = db();

  if (!categoryExists(connection, categoryId)) {
    throw new ValidationError("Категория не найдена");
  }

  connection
    .prepare(
      `UPDATE transactions
       SET amount = ?, category_id = ?, date = ?, comment = ?
       WHERE id = ?`
    )
    .run(amount, categoryId, date, comment, id);

  return connection
    .prepare(`${SELECT_TRANSACTION} WHERE t.id = ?`)
    .get(id);
}

export async function deleteTransaction(id) {
  const result = db().prepare("DELETE FROM transactions WHERE id = ?").run(id);
  return result.changes > 0;
}
