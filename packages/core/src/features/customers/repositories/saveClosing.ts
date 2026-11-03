import { db } from "@vetra/database";

import type { LeadStageState } from "../../leads/domain";
import { leadRepositories } from "../../leads/repositories";
import type { Deal, Installment } from "../domain";
import { insertDeal } from "./insertDeal";

// The lead moves to the closing stage, loses its pending actions and gets its deal, together.
export async function saveClosing(
  stageState: LeadStageState,
  deal: Deal,
  installments: Installment[]
): Promise<void> {
  await db.transaction(async (tx) => {
    await leadRepositories.saveLeadStages([stageState], [stageState.id], tx);
    await insertDeal(tx, deal, installments);
  });
}
