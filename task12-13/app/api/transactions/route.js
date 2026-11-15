import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendError, readJson } from "@/lib/http";
import {
  ValidationError,
  isValidDate,
  parsePositiveId,
  validateTransactionPayload,
} from "@/lib/validation";
import {
  SELECT_TRANSACTION,
  getTransactionById,
  categoryExists,
} from "@/lib/transactions";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryIdParam = searchParams.get("category_id");
    const type = searchParams.get("type");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const conditions = [];
    const params = {};

    if (categoryIdParam !== null && categoryIdParam !== "") {
      const categoryId = parsePositiveId(categoryIdParam);
      if (!categoryId) {
        throw new ValidationError("Некорректный category_id");
      }
      conditions.push("t.category_id = @categoryId");
      params.categoryId = categoryId;
    }

    if (type !== null && type !== "") {
      if (type !== "income" && type !== "expense") {
        throw new ValidationError("type должен быть income или expense");
      }
      conditions.push("c.type = @type");
      params.type = type;
    }

    if (from !== null && from !== "") {
      if (!isValidDate(from)) {
        throw new ValidationError("from должен быть в формате YYYY-MM-DD");
      }
      conditions.push("t.date >= @from");
      params.from = from;
    }

    if (to !== null && to !== "") {
      if (!isValidDate(to)) {
        throw new ValidationError("to должен быть в формате YYYY-MM-DD");
      }
      conditions.push("t.date <= @to");
      params.to = to;
    }

    const where = conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "";
    const sql = `${SELECT_TRANSACTION}${where} ORDER BY t.date DESC, t.id DESC`;
    const db = getDb();

    const transactions = conditions.length
      ? db.prepare(sql).all(params)
      : db.prepare(sql).all();

    return NextResponse.json(transactions);
  } catch (error) {
    return sendError(error);
  }
}

export async function POST(request) {
  try {
    const { amount, categoryId, date, comment } = validateTransactionPayload(
      await readJson(request)
    );

    if (!categoryExists(categoryId)) {
      throw new ValidationError("Категория не найдена");
    }

    const result = getDb()
      .prepare(
        `INSERT INTO transactions (amount, category_id, date, comment)
         VALUES (?, ?, ?, ?)`
      )
      .run(amount, categoryId, date, comment);

    return NextResponse.json(getTransactionById(result.lastInsertRowid), {
      status: 201,
    });
  } catch (error) {
    return sendError(error);
  }
}
