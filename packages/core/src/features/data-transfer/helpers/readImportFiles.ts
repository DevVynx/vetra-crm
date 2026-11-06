import { readZip, ZipReadError } from "@vetra/infra";

import { InvalidImportFileError } from "../errors";

const ZIP_START = [0x50, 0x4b];
const MAX_FILES = 20;
const MAX_FILE_BYTES = 50 * 1024 * 1024;
const MAX_TOTAL_BYTES = 50 * 1024 * 1024;
const FILES_READ = new Set([
  "leads.csv",
  "projetos.csv",
  "parcelas.csv",
  "despesas.csv",
  "notas.csv",
  "atividades.csv",
]);

// A "CSV" saved by Excel in Windows is not UTF-8, so what is not valid UTF-8 is read as the
// Windows encoding. UTF-8 is tried first because the export writes it.
function textOf(content: Buffer): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(content);
  } catch {
    return new TextDecoder("windows-1252").decode(content);
  }
}

const basenameOf = (name: string) => (name.split(/[\\/]/).pop() ?? "").toLowerCase();

// A zip is told by its first bytes, not by its name; anything else is taken as the leads file.
export function readImportFiles(content: Buffer): Map<string, string> {
  if (content.length === 0) throw new InvalidImportFileError();
  if (content[0] !== ZIP_START[0] || content[1] !== ZIP_START[1]) {
    return new Map([["leads.csv", textOf(content)]]);
  }

  try {
    const entries = readZip(content, {
      maxEntries: MAX_FILES,
      maxEntryBytes: MAX_FILE_BYTES,
      maxTotalBytes: MAX_TOTAL_BYTES,
    });
    const files = new Map<string, string>();

    for (const entry of entries) {
      const name = basenameOf(entry.name);
      if (FILES_READ.has(name) && !files.has(name)) files.set(name, textOf(entry.content));
    }

    return files;
  } catch (error) {
    if (error instanceof ZipReadError) throw new InvalidImportFileError();
    throw error;
  }
}
