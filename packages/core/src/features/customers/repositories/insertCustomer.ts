import { db } from "@vetra/database";

import type { Lead } from "../../leads/domain";
import { leadRepositories } from "../../leads/repositories";
import type { Deal, Installment } from "../domain";
import { insertDeal } from "./insertDeal";

export async function insertCustomer(
  lead: Lead,
  deal: Deal,
  installments: Installment[]
): Promise<void> {
  await db.transaction(async (tx) => {
    await leadRepositories.insertLead(lead, tx);
    await insertDeal(tx, deal, installments);
  });
}
