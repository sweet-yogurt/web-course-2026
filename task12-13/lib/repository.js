const usesBlob =
  Boolean(process.env.BLOB_READ_WRITE_TOKEN) ||
  Boolean(process.env.BLOB_STORE_ID);

let repositoryPromise;

export function getStorageKind() {
  return usesBlob ? "vercel-blob" : "sqlite";
}

export function getRepository() {
  if (!repositoryPromise) {
    repositoryPromise = usesBlob
      ? import("./storage/blob")
      : import("./storage/sqlite");
  }

  return repositoryPromise;
}
