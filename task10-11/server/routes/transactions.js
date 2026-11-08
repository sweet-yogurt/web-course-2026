const express = require("express");
const db = require("../db");
const { sendError } = require("../lib/http");
const {
  NotFoundError,
  ValidationError,
  isValidDate,
  parsePositiveId,
  validateTransactionPayload,
} = require("../lib/validation");
const {
  SELECT_TRANSACTION,
  getTransactionById,
  categoryExists,
} = require("../lib/transactions");

const router = express.Router();

router.get("/", (req, res) => {
  try {
    const conditions = [];
    const params = {};
    const { category_id, type, from, to } = req.query;

    if (category_id !== undefined) {
      const categoryId = parsePositiveId(category_id);
      if (!categoryId) {
        throw new ValidationError("Некорректный category_id");
      }
      conditions.push("t.category_id = @categoryId");
      params.categoryId = categoryId;
    }

    if (type !== undefined) {
      if (type !== "income" && type !== "expense") {
        throw new ValidationError("type должен быть income или expense");
      }
      conditions.push("c.type = @type");
      params.type = type;
    }

    if (from !== undefined) {
      if (!isValidDate(from)) {
        throw new ValidationError("from должен быть в формате YYYY-MM-DD");
      }
      conditions.push("t.date >= @from");
      params.from = from;
    }

    if (to !== undefined) {
      if (!isValidDate(to)) {
        throw new ValidationError("to должен быть в формате YYYY-MM-DD");
      }
      conditions.push("t.date <= @to");
      params.to = to;
    }

    const where = conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "";
    const sql = `${SELECT_TRANSACTION}${where} ORDER BY t.date DESC, t.id DESC`;

    const transactions = conditions.length
      ? db.prepare(sql).all(params)
      : db.prepare(sql).all();

    res.json(transactions);
  } catch (error) {
    sendError(res, error);
  }
});

router.post("/", (req, res) => {
  try {
    const { amount, categoryId, date, comment } = validateTransactionPayload(
      req.body
    );

    if (!categoryExists(categoryId)) {
      throw new ValidationError("Категория не найдена");
    }

    const result = db
      .prepare(
        `INSERT INTO transactions (amount, category_id, date, comment)
         VALUES (?, ?, ?, ?)`
      )
      .run(amount, categoryId, date, comment);

    res.status(201).json(getTransactionById(result.lastInsertRowid));
  } catch (error) {
    sendError(res, error);
  }
});

router.put("/:id", (req, res) => {
  try {
    const id = parsePositiveId(req.params.id);
    if (!id || !getTransactionById(id)) {
      throw new NotFoundError("Операция не найдена");
    }

    const { amount, categoryId, date, comment } = validateTransactionPayload(
      req.body
    );

    if (!categoryExists(categoryId)) {
      throw new ValidationError("Категория не найдена");
    }

    db.prepare(
      `UPDATE transactions
       SET amount = ?, category_id = ?, date = ?, comment = ?
       WHERE id = ?`
    ).run(amount, categoryId, date, comment, id);

    res.json(getTransactionById(id));
  } catch (error) {
    sendError(res, error);
  }
});

router.delete("/:id", (req, res) => {
  try {
    const id = parsePositiveId(req.params.id);
    if (!id || !getTransactionById(id)) {
      throw new NotFoundError("Операция не найдена");
    }

    db.prepare("DELETE FROM transactions WHERE id = ?").run(id);
    res.status(204).end();
  } catch (error) {
    sendError(res, error);
  }
});

module.exports = router;
