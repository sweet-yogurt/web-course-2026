import { NextResponse } from "next/server";
import { getRepository } from "@/lib/repository";
import { sendError, readJson } from "@/lib/http";
import { validateTransactionPayload } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = {};

    const categoryId = searchParams.get("category_id");
    const type = searchParams.get("type");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (categoryId !== null && categoryId !== "") {
      filters.categoryId = categoryId;
    }
    if (type !== null && type !== "") {
      filters.type = type;
    }
    if (from !== null && from !== "") {
      filters.from = from;
    }
    if (to !== null && to !== "") {
      filters.to = to;
    }

    const repository = await getRepository();
    return NextResponse.json(await repository.listTransactions(filters));
  } catch (error) {
    return sendError(error);
  }
}

export async function POST(request) {
  try {
    const payload = validateTransactionPayload(await readJson(request));
    const repository = await getRepository();
    const transaction = await repository.createTransaction(payload);

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    return sendError(error);
  }
}
