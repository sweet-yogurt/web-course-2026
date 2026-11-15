import { NextResponse } from "next/server";
import { getRepository } from "@/lib/repository";
import { sendError, readJson } from "@/lib/http";
import { validateCategoryPayload } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const repository = await getRepository();
    return NextResponse.json(await repository.listCategories());
  } catch (error) {
    return sendError(error);
  }
}

export async function POST(request) {
  try {
    const payload = validateCategoryPayload(await readJson(request));
    const repository = await getRepository();
    const category = await repository.createCategory(payload);

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return sendError(error);
  }
}
