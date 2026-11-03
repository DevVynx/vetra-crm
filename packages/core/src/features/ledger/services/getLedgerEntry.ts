import type { LedgerEntryWithProject } from "../domain";
import { LedgerEntryNotFoundError } from "../errors";
import { ledgerRepositories } from "../repositories";

export async function getLedgerEntry(
  leadId: string,
  entryId: string
): Promise<LedgerEntryWithProject> {
  const [entry] = await ledgerRepositories.findLedgerEntries({ leadId, entryId });
  if (!entry) throw new LedgerEntryNotFoundError();

  return entry;
}
