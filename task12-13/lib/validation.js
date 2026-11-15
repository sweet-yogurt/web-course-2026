export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.status = 400;
  }
}

export class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.status = 404;
  }
}

export function isValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

export function parsePositiveId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function validateCategoryPayload(body = {}) {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const type = body.type;

  if (!name) {
    throw new ValidationError("Название категории обязательно");
  }

  if (type !== "income" && type !== "expense") {
    throw new ValidationError("Тип категории должен быть income или expense");
  }

  return { name, type };
}

export function validateTransactionPayload(body = {}) {
  const amount = Number(body.amount);
  const categoryId = parsePositiveId(body.category_id ?? body.categoryId);
  const date = typeof body.date === "string" ? body.date.trim() : "";
  const comment = body.comment == null ? "" : String(body.comment).trim();

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new ValidationError("Сумма должна быть положительным числом");
  }

  if (!categoryId) {
    throw new ValidationError("Некорректная категория");
  }

  if (!isValidDate(date)) {
    throw new ValidationError("Дата должна быть в формате YYYY-MM-DD");
  }

  return { amount, categoryId, date, comment };
}
