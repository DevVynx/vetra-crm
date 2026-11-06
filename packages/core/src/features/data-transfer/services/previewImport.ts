import type { ImportReport } from "../helpers/planImport";
import { planImportOf } from "./planImportOf";

// What importing the file would do. Nothing is written.
export async function previewImport(content: Buffer): Promise<ImportReport> {
  return (await planImportOf(content)).report;
}
