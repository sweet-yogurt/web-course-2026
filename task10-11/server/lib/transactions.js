const db = require("../db");

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

function getTransactionById(id) {
  return db
    .prepare(`${SELECT_TRANSACTION} WHERE t.id = ?`)
    .get(id);
}

function categoryExists(id) {
  return Boolean(db.prepare("SELECT id FROM categories WHERE id = ?").get(id));
}

module.exports = { SELECT_TRANSACTION, getTransactionById, categoryExists };
