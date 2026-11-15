import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendError, readJson } from "@/lib/http";
import {
  NotFoundError,
  ValidationError,
  parsePositiveId,
  validateTransactionPayload,
} from "@/lib/validation";
import {
  getTransactionById,
  categoryExists,
} from "@/lib/transactions";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const { id: rawId } = await params;
    const id = parsePositiveId(rawId);
    const transaction = id ? getTransactionById(id) : null;

    if (!transaction) {
      throw new NotFoundError("Операция не найдена");
    }

    return NextResponse.json(transaction);
  } catch (error) {
    return sendError(error);
  }
}

export async function PUT(request, { params }) {
  try {
    const { id: rawId } = await params;
    const id = parsePositiveId(rawId);

    if (!id || !getTransactionById(id)) {
      throw new NotFoundError("Операция не найдена");
    }

    const { amount, categoryId, date, comment } = validateTransactionPayload(
      await readJson(request)
    );

    if (!categoryExists(categoryId)) {
      throw new ValidationError("Категория не найдена");
    }

    getDb()
      .prepare(
        `UPDATE transactions
         SET amount = ?, category_id = ?, date = ?, comment = ?
         WHERE id = ?`
      )
      .run(amount, categoryId, date, comment, id);

    return NextResponse.json(getTransactionById(id));
  } catch (error) {
    return sendError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id: rawId } = await params;
    const id = parsePositiveId(rawId);

    if (!id || !getTransactionById(id)) {
      throw new NotFoundError("Операция не найдена");
    }

    getDb().prepare("DELETE FROM transactions WHERE id = ?").run(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return sendError(error);
  }
}
