import {
  BlobNotFoundError,
  BlobPreconditionFailedError,
  get,
  head,
  put,
} from "@vercel/blob";
import { ValidationError, isValidDate, parsePositiveId } from "@/lib/validation";

const PATHNAME = "zen-money/data.json";
const MAX_WRITE_ATTEMPTS = 5;

// BLOB_ACCESS можно задать явно. Если переменной нет, режим определяется
// по URL существующего blob или по ошибке записи в private-store.
const configuredAccess =
  process.env.BLOB_ACCESS === "private"
    ? "private"
    : process.env.BLOB_ACCESS === "public"
      ? "public"
      : null;

let accessMode = configuredAccess;

function resolveAccess(meta) {
  if (accessMode) return accessMode;

  accessMode = meta.url.includes(".private.") ? "private" : "public";
  return accessMode;
}

async function putBlob(pathname, body, options) {
  const access = accessMode ?? "public";

  try {
    const result = await put(pathname, body, { ...options, access });
    accessMode = access;
    return result;
  } catch (error) {
    const canRetryAsPrivate =
      !configuredAccess &&
      access === "public" &&
      /private store/i.test(error.message);

    if (!canRetryAsPrivate) {
      throw error;
    }

    accessMode = "private";
    return put(pathname, body, { ...options, access: "private" });
  }
}

const INITIAL_CATEGORIES = [
  { name: "Еда", type: "expense" },
  { name: "Зарплата", type: "income" },
  { name: "Транспорт", type: "expense" },
];

function createInitialData() {
  const categories = INITIAL_CATEGORIES.map((category, index) => ({
    id: index + 1,
    ...category,
  }));

  return {
    version: 1,
    nextCategoryId: categories.length + 1,
    nextTransactionId: 1,
    categories,
    transactions: [],
  };
}

function normalizeData(raw) {
  const fallback = createInitialData();

  if (!raw || typeof raw !== "object") {
    return fallback;
  }

  const categories = Array.isArray(raw.categories)
    ? raw.categories
        .filter(
          (category) =>
            category &&
            Number.isInteger(category.id) &&
            typeof category.name === "string" &&
            (category.type === "income" || category.type === "expense")
        )
        .map((category) => ({
          id: category.id,
          name: category.name,
          type: category.type,
        }))
    : [];

  const transactions = Array.isArray(raw.transactions)
    ? raw.transactions
        .filter(
          (transaction) =>
            transaction &&
            Number.isInteger(transaction.id) &&
            Number.isFinite(Number(transaction.amount)) &&
            Number.isInteger(transaction.categoryId) &&
            typeof transaction.date === "string"
        )
        .map((transaction) => ({
          id: transaction.id,
          amount: Number(transaction.amount),
          categoryId: transaction.categoryId,
          date: transaction.date,
          comment:
            transaction.comment == null ? "" : String(transaction.comment),
        }))
    : [];

  if (!categories.length) {
    return fallback;
  }

  const maxCategoryId = Math.max(...categories.map((category) => category.id));
  const maxTransactionId = transactions.length
    ? Math.max(...transactions.map((transaction) => transaction.id))
    : 0;

  return {
    version: 1,
    categories,
    transactions,
    nextCategoryId: Math.max(
      Number(raw.nextCategoryId) || 1,
      maxCategoryId + 1
    ),
    nextTransactionId: Math.max(
      Number(raw.nextTransactionId) || 1,
      maxTransactionId + 1
    ),
  };
}

async function readPublicContent(meta) {
  const url = new URL(meta.url);
  url.searchParams.set("v", meta.etag.replaceAll('"', ""));

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Не удалось прочитать данные из Blob: ${response.status}`);
  }

  return response.text();
}

async function readContent(meta) {
  const access = resolveAccess(meta);

  if (access === "public") {
    return readPublicContent(meta);
  }

  const result = await get(PATHNAME, { access, useCache: false });
  if (!result || result.statusCode === 304 || !result.stream) {
    throw new Error("Не удалось прочитать данные из Blob");
  }

  return new Response(result.stream).text();
}

async function readData() {
  let meta;

  try {
    meta = await head(PATHNAME);
  } catch (error) {
    if (!(error instanceof BlobNotFoundError)) {
      throw error;
    }
  }

  if (!meta) {
    const data = createInitialData();

    try {
      const saved = await putBlob(PATHNAME, JSON.stringify(data), {
        addRandomSuffix: false,
        allowOverwrite: false,
        contentType: "application/json",
        cacheControlMaxAge: 60,
      });

      return { data, etag: saved.etag };
    } catch (createError) {
      // Параллельный запрос мог создать файл первым — перечитываем его.
      // Если и это не удалось, показываем исходную ошибку записи.
      try {
        const existingMeta = await head(PATHNAME);
        const text = await readContent(existingMeta);
        return {
          data: normalizeData(JSON.parse(text)),
          etag: existingMeta.etag,
        };
      } catch {
        throw createError;
      }
    }
  }

  const text = await readContent(meta);
  return { data: normalizeData(JSON.parse(text)), etag: meta.etag };
}

async function writeData(data, etag) {
  return putBlob(PATHNAME, JSON.stringify(data), {
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 60,
    ...(etag ? { ifMatch: etag } : {}),
  });
}

async function mutate(mutator) {
  for (let attempt = 0; attempt < MAX_WRITE_ATTEMPTS; attempt += 1) {
    const { data, etag } = await readData();
    const outcome = await mutator(data);

    if (outcome?.skipWrite) {
      return outcome.value;
    }

    try {
      await writeData(data, etag);
      return outcome?.value ?? null;
    } catch (error) {
      if (error instanceof BlobPreconditionFailedError) {
        continue;
      }
      throw error;
    }
  }

  throw new Error("Не удалось сохранить данные: конфликт версий в Blob");
}

function toTransaction(data, transaction) {
  const category = data.categories.find(
    (item) => item.id === transaction.categoryId
  );

  return {
    id: transaction.id,
    amount: transaction.amount,
    categoryId: transaction.categoryId,
    categoryName: category?.name ?? "—",
    type: category?.type ?? "expense",
    date: transaction.date,
    comment: transaction.comment ?? "",
  };
}

export async function listCategories() {
  const { data } = await readData();
  return [...data.categories].sort((a, b) => a.id - b.id);
}

export async function createCategory({ name, type }) {
  return mutate((data) => {
    const category = { id: data.nextCategoryId, name, type };
    data.nextCategoryId += 1;
    data.categories.push(category);
    return { value: { ...category } };
  });
}

export async function listTransactions(filters = {}) {
  const { data } = await readData();
  let transactions = data.transactions.map((transaction) =>
    toTransaction(data, transaction)
  );

  if (filters.categoryId !== undefined) {
    const categoryId = parsePositiveId(filters.categoryId);
    if (!categoryId) {
      throw new ValidationError("Некорректный category_id");
    }
    transactions = transactions.filter(
      (transaction) => transaction.categoryId === categoryId
    );
  }

  if (filters.type !== undefined) {
    if (filters.type !== "income" && filters.type !== "expense") {
      throw new ValidationError("type должен быть income или expense");
    }
    transactions = transactions.filter(
      (transaction) => transaction.type === filters.type
    );
  }

  if (filters.from !== undefined) {
    if (!isValidDate(filters.from)) {
      throw new ValidationError("from должен быть в формате YYYY-MM-DD");
    }
    transactions = transactions.filter(
      (transaction) => transaction.date >= filters.from
    );
  }

  if (filters.to !== undefined) {
    if (!isValidDate(filters.to)) {
      throw new ValidationError("to должен быть в формате YYYY-MM-DD");
    }
    transactions = transactions.filter(
      (transaction) => transaction.date <= filters.to
    );
  }

  return transactions.sort(
    (a, b) => b.date.localeCompare(a.date) || b.id - a.id
  );
}

export async function getTransactionById(id) {
  const { data } = await readData();
  const transaction = data.transactions.find((item) => item.id === id);
  return transaction ? toTransaction(data, transaction) : null;
}

export async function createTransaction({ amount, categoryId, date, comment }) {
  return mutate((data) => {
    const category = data.categories.find((item) => item.id === categoryId);
    if (!category) {
      throw new ValidationError("Категория не найдена");
    }

    const transaction = {
      id: data.nextTransactionId,
      amount,
      categoryId,
      date,
      comment,
    };

    data.nextTransactionId += 1;
    data.transactions.push(transaction);

    return { value: toTransaction(data, transaction) };
  });
}

export async function updateTransaction(id, { amount, categoryId, date, comment }) {
  return mutate((data) => {
    const index = data.transactions.findIndex((item) => item.id === id);
    if (index === -1) {
      return { skipWrite: true, value: null };
    }

    const category = data.categories.find((item) => item.id === categoryId);
    if (!category) {
      throw new ValidationError("Категория не найдена");
    }

    data.transactions[index] = {
      ...data.transactions[index],
      amount,
      categoryId,
      date,
      comment,
    };

    return { value: toTransaction(data, data.transactions[index]) };
  });
}

export async function deleteTransaction(id) {
  return mutate((data) => {
    const index = data.transactions.findIndex((item) => item.id === id);
    if (index === -1) {
      return { skipWrite: true, value: false };
    }

    data.transactions.splice(index, 1);
    return { value: true };
  });
}
