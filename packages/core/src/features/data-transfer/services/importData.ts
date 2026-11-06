import type { ImportReport } from "../helpers/planImport";
import { dataTransferRepositories } from "../repositories";
import { planImportOf } from "./planImportOf";

// Writes what the preview showed: the leads that are valid and new, with what hangs from them.
// The rows with an error are left out and are in the report.
export async function importData(content: Buffer): Promise<ImportReport> {
  const { records, report } = await planImportOf(content);
  if (records.leads.length > 0) await dataTransferRepositories.insertImport(records);

  return report;
}
