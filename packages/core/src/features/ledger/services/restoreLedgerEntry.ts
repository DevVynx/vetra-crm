import { ensureCustomerExists } from "../../customers/services/ensureCustomerExists";
import { projectRepositories } from "../../projects/repositories";
import { ledgerDomain, type LedgerEntry } from "../domain";
import { LedgerEntryAlreadyExistsError } from "../errors";
import { ledgerRepositories } from "../repositories";

// Undo of a deletion: the entry comes back with its original id and creation date.
export async function restoreLedgerEntry(entry: LedgerEntry): Promise<void> {
  await ensureCustomerExists(entry.leadId);
  if (await ledgerRepositories.ledgerEntryIdExists(entry.id)) {
    throw new LedgerEntryAlreadyExistsError();
  }

  const project = entry.projectId
    ? await projectRepositories.findProjects({ leadId: entry.leadId, projectId: entry.projectId })
    : [];
  await ledgerRepositories.saveLedgerEntry(
    ledgerDomain.restoredWithProject(entry, project.length > 0)
  );
}
