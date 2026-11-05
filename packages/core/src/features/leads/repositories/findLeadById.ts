import { db, eq, leadsTable } from "@vetra/database";

import type { LeadWithPhoto } from "../domain";
import { leadColumns, leadPhotoSql } from "./leadColumns";

export async function findLeadById(id: string): Promise<LeadWithPhoto | undefined> {
  const [lead] = await db
    .select({ ...leadColumns, photoUrl: leadPhotoSql })
    .from(leadsTable)
    .where(eq(leadsTable.id, id));
  return lead;
}
