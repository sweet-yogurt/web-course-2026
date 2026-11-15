import { NextResponse } from "next/server";
import { ValidationError } from "./validation";

export function sendError(error) {
  const status = Number.isInteger(error.status) ? error.status : 500;
  const message =
    status === 500 ? "Внутренняя ошибка сервера" : error.message;

  if (status === 500) {
    console.error(error);
  }

  return NextResponse.json({ error: message }, { status });
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    throw new ValidationError("Некорректный JSON в теле запроса");
  }
}
