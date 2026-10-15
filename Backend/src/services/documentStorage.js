
import { mkdir, writeFile, access, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { ApiError } from "../utils/ApiError.js";

const STORAGE_DIR = path.resolve(
  process.env.PRIVATE_DOCUMENT_DIR || "./private-documents"
);

const EXTENSIONS = {
  "application/pdf": ".pdf",
  "image/jpeg": ".jpg",
  "image/png": ".png",
};

export const storePrivateDocument = async (file) => {
  if (!file?.buffer || !EXTENSIONS[file.mimetype]) {
    throw new ApiError(400, "Unsupported or missing document file");
  }

  await mkdir(STORAGE_DIR, { recursive: true });

  const storageKey = `${randomUUID()}${EXTENSIONS[file.mimetype]}`;
  const fullPath = path.join(STORAGE_DIR, storageKey);

  await writeFile(fullPath, file.buffer, { flag: "wx", mode: 0o600 });

  return storageKey;
};

export const getPrivateDocumentPath = (storageKey) => {
  // Only accept generated UUID filenames with supported extensions.
  if (
    typeof storageKey !== "string" ||
    !/^[0-9a-f-]{36}\.(pdf|jpg|png)$/i.test(storageKey)
  ) {
    throw new ApiError(400, "Invalid document storage key");
  }

  return path.join(STORAGE_DIR, storageKey);
};

export const ensurePrivateDocumentExists = async (storageKey) => {
  const fullPath = getPrivateDocumentPath(storageKey);

  try {
    await access(fullPath);
  } catch {
    throw new ApiError(404, "Stored document file not found");
  }

  return fullPath;
};

export const deletePrivateDocumentFile = async (storageKey) => {
  const fullPath = getPrivateDocumentPath(storageKey);

  try {
    await unlink(fullPath);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
};
