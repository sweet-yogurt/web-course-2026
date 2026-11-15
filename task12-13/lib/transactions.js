import { getDb } from "./db";

export const SELECT_TRANSACTION = `
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

export function getTransactionById(id) {
  return getDb().prepare(`${SELECT_TRANSACTION} WHERE t.id = ?`).get(id);
}

export function categoryExists(id) {
  return Boolean(
    getDb().prepare("SELECT id FROM categories WHERE id = ?").get(id)
  );
}
