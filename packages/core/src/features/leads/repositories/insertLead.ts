import { db, leadsTable } from "@vetra/database";

import type { Lead } from "../domain";

export async function insertLead(lead: Lead): Promise<void> {
  await db.insert(leadsTable).values(lead);
}
