import { db, eq, leadsTable } from "@vetra/database";

import type { LeadWithPhoto } from "../domain";
import { leadColumns, leadPhotoSql } from "./leadColumns";

export async function setLeadDoNotContact(
  id: string,
  doNotContact: boolean
): Promise<LeadWithPhoto | undefined> {
  const [lead] = await db
    .update(leadsTable)
    .set({ doNotContact })
    .where(eq(leadsTable.id, id))
    .returning({ ...leadColumns, photoUrl: leadPhotoSql });
  return lead;
}
