import { db, eq, leadsTable } from "@vetra/database";

import type { LeadFields, LeadWithPhoto } from "../domain";
import { contactChangeOf } from "./contactChange";
import { leadColumns, leadPhotoSql } from "./leadColumns";

export async function updateLeadContact(
  id: string,
  fields: LeadFields
): Promise<LeadWithPhoto | undefined> {
  const [lead] = await db
    .update(leadsTable)
    .set(contactChangeOf(fields))
    .where(eq(leadsTable.id, id))
    .returning({ ...leadColumns, photoUrl: leadPhotoSql });
  return lead;
}
