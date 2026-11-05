import { db, dealsTable, eq, leadsTable } from "@vetra/database";

import type { LeadWithPhoto } from "../../leads/domain";
import type { Deal } from "../domain";
import { customerColumns } from "./customerSql";

export async function findCustomerById(
  id: string
): Promise<{ lead: LeadWithPhoto; deal: Deal } | undefined> {
  const [customer] = await db
    .select(customerColumns)
    .from(leadsTable)
    .innerJoin(dealsTable, eq(dealsTable.leadId, leadsTable.id))
    .where(eq(leadsTable.id, id));
  return customer;
}
