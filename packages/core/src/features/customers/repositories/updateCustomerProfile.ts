import { db, dealsTable, eq, leadsTable } from "@vetra/database";

import type { LeadContact } from "../../leads/domain";
import { contactChangeOf } from "../../leads/repositories/contactChange";

// Contact data lives on the lead and the document on the deal; both change together.
export async function updateCustomerProfile(
  id: string,
  contact: LeadContact,
  document: string | null
): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.update(leadsTable).set(contactChangeOf(contact)).where(eq(leadsTable.id, id));
    await tx.update(dealsTable).set({ document }).where(eq(dealsTable.leadId, id));
  });
}
