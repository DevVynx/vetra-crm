import { type Database, db, leadsTable, type Transaction } from "@vetra/database";

import type { Lead } from "../domain";
import { lastMessageAtOfPhoneKey } from "./contactChange";

export async function insertLead(lead: Lead, executor: Database | Transaction = db): Promise<void> {
  await executor
    .insert(leadsTable)
    .values({ ...lead, lastContactAt: lastMessageAtOfPhoneKey(lead.phoneKey) });
}
