import { db, eq, leadsTable } from "@vetra/database";

import type { Lead } from "../domain";
import { leadColumns } from "./leadColumns";

export async function findLeadBySlug(slug: string): Promise<Lead | null> {
  const [lead] = await db.select(leadColumns).from(leadsTable).where(eq(leadsTable.slug, slug));

  return lead ?? null;
}
