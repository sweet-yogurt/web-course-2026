import { NextResponse } from "next/server";
import { getRepository } from "@/lib/repository";
import { sendError, readJson } from "@/lib/http";
import {
  NotFoundError,
  parsePositiveId,
  validateTransactionPayload,
} from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const { id: rawId } = await params;
    const id = parsePositiveId(rawId);
    const repository = await getRepository();
    const transaction = id ? await repository.getTransactionById(id) : null;

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

    if (!id) {
      throw new NotFoundError("Операция не найдена");
    }

    const payload = validateTransactionPayload(await readJson(request));
    const repository = await getRepository();
    const transaction = await repository.updateTransaction(id, payload);

    if (!transaction) {
      throw new NotFoundError("Операция не найдена");
    }

    return NextResponse.json(transaction);
  } catch (error) {
    return sendError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id: rawId } = await params;
    const id = parsePositiveId(rawId);

    if (!id) {
      throw new NotFoundError("Операция не найдена");
    }

    const repository = await getRepository();
    const deleted = await repository.deleteTransaction(id);

    if (!deleted) {
      throw new NotFoundError("Операция не найдена");
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return sendError(error);
  }
}
