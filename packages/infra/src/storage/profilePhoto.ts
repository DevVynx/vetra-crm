import { mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import { envConfig } from "@vetra/env/server";

const FILE_NAME = "profile-photo.webp";

type StoredPhoto = { content: Buffer; version: number };

const photoPath = () => path.resolve(envConfig.get().STORAGE_DIR, FILE_NAME);

const isMissing = (error: unknown) => (error as { code?: string }).code === "ENOENT";

const versionOf = (modifiedAtMs: number) => Math.trunc(modifiedAtMs);

// Written whole or not at all: a half-written file is never read as the photo.
async function save(content: Buffer): Promise<void> {
  const target = photoPath();
  const temporary = `${target}.tmp`;

  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(temporary, content);
  await rename(temporary, target);
}

async function read(): Promise<StoredPhoto | null> {
  const target = photoPath();

  try {
    const [content, info] = await Promise.all([readFile(target), stat(target)]);
    return { content, version: versionOf(info.mtimeMs) };
  } catch (error) {
    if (isMissing(error)) return null;
    throw error;
  }
}

async function version(): Promise<number | null> {
  try {
    return versionOf((await stat(photoPath())).mtimeMs);
  } catch (error) {
    if (isMissing(error)) return null;
    throw error;
  }
}

async function remove(): Promise<void> {
  await rm(photoPath(), { force: true });
}

export const profilePhotoStorage = { save, read, version, remove };
