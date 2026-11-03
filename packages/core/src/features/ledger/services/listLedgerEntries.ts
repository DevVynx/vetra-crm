import type { Filter } from "../../../shared/filters";
import { ensureCustomerExists } from "../../customers/services/ensureCustomerExists";
import { getProfile } from "../../profile/services/getProfile";
import type { LedgerEntryWithProject } from "../domain";
import { ledgerRepositories } from "../repositories";

export async function listLedgerEntries(
  leadId: string,
  filters: Filter[]
): Promise<LedgerEntryWithProject[]> {
  const [profile] = await Promise.all([getProfile(), ensureCustomerExists(leadId)]);
  return ledgerRepositories.findLedgerEntries({ leadId, filters, timeZone: profile.timeZone });
}
