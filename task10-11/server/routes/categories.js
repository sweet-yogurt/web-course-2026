const express = require("express");
const db = require("../db");
const { sendError } = require("../lib/http");
const { validateCategoryPayload } = require("../lib/validation");

const router = express.Router();

router.get("/", (req, res) => {
  try {
    const categories = db
      .prepare("SELECT id, name, type FROM categories ORDER BY id")
      .all();

    res.json(categories);
  } catch (error) {
    sendError(res, error);
  }
});

router.post("/", (req, res) => {
  try {
    const { name, type } = validateCategoryPayload(req.body);

    const result = db
      .prepare("INSERT INTO categories (name, type) VALUES (?, ?)")
      .run(name, type);

    const category = db
      .prepare("SELECT id, name, type FROM categories WHERE id = ?")
      .get(result.lastInsertRowid);

    res.status(201).json(category);
  } catch (error) {
    sendError(res, error);
  }
});

module.exports = router;
