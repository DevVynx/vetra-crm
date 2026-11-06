import { db, nextActionsTable } from "@vetra/database";

import type { NextAction } from "../../next-actions/domain";
import type { Lead } from "../domain";
import { insertLead } from "./insertLead";

export async function insertLeadWithNextAction(
  lead: Lead,
  nextAction: NextAction | null
): Promise<void> {
  await db.transaction(async (tx) => {
    await insertLead(lead, tx);
    if (nextAction) await tx.insert(nextActionsTable).values(nextAction);
  });
}
