import { LedgerEntryNotFoundError } from "../errors";
import { ledgerRepositories } from "../repositories";

export async function deleteLedgerEntry(leadId: string, entryId: string): Promise<void> {
  const deleted = await ledgerRepositories.deleteLedgerEntry(leadId, entryId);
  if (!deleted) throw new LedgerEntryNotFoundError();
}
