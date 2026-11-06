import { db, eq, leadsTable } from "@vetra/database";

import type { LeadStageState } from "../../leads/domain";
import { leadRepositories } from "../../leads/repositories";
import type { Deal, Installment } from "../domain";
import { insertDeal } from "./insertDeal";

// The lead moves to the closing stage, loses its pending actions and gets its deal, together. A customer
// is no longer prospected, so the marks of a lead (not to contact, automatic sending) go off with it.
export async function saveClosing(
  stageState: LeadStageState,
  deal: Deal,
  installments: Installment[]
): Promise<void> {
  await db.transaction(async (tx) => {
    await leadRepositories.saveLeadStages([stageState], [stageState.id], tx);
    await tx
      .update(leadsTable)
      .set({ doNotContact: false, autoSend: false })
      .where(eq(leadsTable.id, stageState.id));
    await insertDeal(tx, deal, installments);
  });
}
