import { ensureCustomerExists } from "../../customers/services/ensureCustomerExists";
import {
  ledgerDomain,
  type LedgerEntryInput,
  type LedgerEntryType,
  type LedgerEntryWithProject,
} from "../domain";
import { ensureProjectOfCustomer } from "../helpers/ensureProjectOfCustomer";
import { ledgerRepositories } from "../repositories";
import { getLedgerEntry } from "./getLedgerEntry";

export async function createLedgerEntry(
  leadId: string,
  type: LedgerEntryType,
  input: LedgerEntryInput
): Promise<LedgerEntryWithProject> {
  await ensureCustomerExists(leadId);
  await ensureProjectOfCustomer(leadId, input.projectId);

  const entry = ledgerDomain.create(leadId, type, input, new Date());
  await ledgerRepositories.saveLedgerEntry(entry);

  return getLedgerEntry(leadId, entry.id);
}
