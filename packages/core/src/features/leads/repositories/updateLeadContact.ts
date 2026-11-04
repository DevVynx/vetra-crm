import { db, eq, leadsTable } from "@vetra/database";

import type { Lead, LeadFields } from "../domain";
import { leadColumns } from "./leadColumns";

export async function updateLeadContact(id: string, fields: LeadFields): Promise<Lead | undefined> {
  const [lead] = await db
    .update(leadsTable)
    .set(fields)
    .where(eq(leadsTable.id, id))
    .returning(leadColumns);
  return lead;
}
