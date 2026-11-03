import { ledgerDomain, type LedgerEntryInput, type LedgerEntryWithProject } from "../domain";
import { ensureProjectOfCustomer } from "../helpers/ensureProjectOfCustomer";
import { ledgerRepositories } from "../repositories";
import { getLedgerEntry } from "./getLedgerEntry";

export async function updateLedgerEntry(
  leadId: string,
  entryId: string,
  input: LedgerEntryInput
): Promise<LedgerEntryWithProject> {
  const { projectName: _projectName, ...entry } = await getLedgerEntry(leadId, entryId);
  await ensureProjectOfCustomer(leadId, input.projectId);

  await ledgerRepositories.saveLedgerEntry(ledgerDomain.edit(entry, input));
  return getLedgerEntry(leadId, entryId);
}
