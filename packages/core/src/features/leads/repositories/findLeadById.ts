import { db, eq, leadsTable } from "@vetra/database";

import type { Lead } from "../domain";
import { leadColumns } from "./leadColumns";

export async function findLeadById(id: string): Promise<Lead | undefined> {
  const [lead] = await db.select(leadColumns).from(leadsTable).where(eq(leadsTable.id, id));
  return lead;
}
