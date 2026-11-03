import { db, inArray, leadsTable } from "@vetra/database";

import type { Lead } from "../domain";
import { leadColumns } from "./leadColumns";

export async function findLeadsByIds(ids: string[]): Promise<Lead[]> {
  return db.select(leadColumns).from(leadsTable).where(inArray(leadsTable.id, ids));
}
