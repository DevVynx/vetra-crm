import { db, eq, leadsTable } from "@vetra/database";

import type { PipelineLeadPatch } from "../domain";

export async function updateLeadFromPipeline(id: string, patch: PipelineLeadPatch): Promise<void> {
  await db.update(leadsTable).set(patch).where(eq(leadsTable.id, id));
}
