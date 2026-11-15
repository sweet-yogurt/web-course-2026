import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendError, readJson } from "@/lib/http";
import { validateCategoryPayload } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();
    const categories = db
      .prepare("SELECT id, name, type FROM categories ORDER BY id")
      .all();

    return NextResponse.json(categories);
  } catch (error) {
    return sendError(error);
  }
}

export async function POST(request) {
  try {
    const { name, type } = validateCategoryPayload(await readJson(request));
    const db = getDb();

    const result = db
      .prepare("INSERT INTO categories (name, type) VALUES (?, ?)")
      .run(name, type);

    const category = db
      .prepare("SELECT id, name, type FROM categories WHERE id = ?")
      .get(result.lastInsertRowid);

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return sendError(error);
  }
}
