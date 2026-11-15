import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

function resolveDatabasePath() {
  if (process.env.DATABASE_PATH) {
    return process.env.DATABASE_PATH;
  }

  // На Vercel доступна на запись только /tmp, причём она может
  // пересоздаваться между холодными стартами serverless-функций.
  if (process.env.VERCEL) {
    return path.join("/tmp", "zen-money.sqlite");
  }

  return path.join(process.cwd(), "data", "database.sqlite");
}

function createDatabase() {
  const databasePath = resolveDatabasePath();
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });

  const database = new Database(databasePath);

  database.pragma("busy_timeout = 5000");
  database.pragma("journal_mode = WAL");
  database.pragma("foreign_keys = ON");

  database.exec(`
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

  const categoriesCount = database
    .prepare("SELECT COUNT(*) AS count FROM categories")
    .get().count;

  if (categoriesCount === 0) {
    const insertCategory = database.prepare(
      "INSERT INTO categories (name, type) VALUES (?, ?)"
    );

    const seedCategories = database.transaction((categories) => {
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

  return database;
}

// Соединение создаётся лениво, при первом запросе к API. Так `next build`
// не открывает базу и не конфликтует с параллельными воркерами. В dev-режиме
// ссылка живёт в globalThis, чтобы переживать HMR.
const globalForDb = globalThis;

export function getDb() {
  if (!globalForDb.__zenMoneyDb) {
    globalForDb.__zenMoneyDb = createDatabase();
  }

  return globalForDb.__zenMoneyDb;
}
