import { db, eq, leadsTable } from "@vetra/database";

import type { Lead, LeadContact } from "../domain";
import { leadColumns } from "./leadColumns";

export async function updateLeadContact(
  id: string,
  contact: LeadContact
): Promise<Lead | undefined> {
  const [lead] = await db
    .update(leadsTable)
    .set(contact)
    .where(eq(leadsTable.id, id))
    .returning(leadColumns);
  return lead;
}
