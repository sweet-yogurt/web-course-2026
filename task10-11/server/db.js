const path = require("node:path");
const Database = require("better-sqlite3");

const databasePath =
  process.env.DATABASE_PATH || path.join(__dirname, "database.sqlite");

const db = new Database(databasePath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense'))
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL,
    category_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    comment TEXT,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );
`);

const categoriesCount = db
  .prepare("SELECT COUNT(*) AS count FROM categories")
  .get().count;

if (categoriesCount === 0) {
  const insertCategory = db.prepare(
    "INSERT INTO categories (name, type) VALUES (?, ?)"
  );

  const seedCategories = db.transaction((categories) => {
    for (const [name, type] of categories) {
      insertCategory.run(name, type);
    }
  });

  seedCategories([
    ["Еда", "expense"],
    ["Зарплата", "income"],
    ["Транспорт", "expense"],
  ]);
}

module.exports = db;
