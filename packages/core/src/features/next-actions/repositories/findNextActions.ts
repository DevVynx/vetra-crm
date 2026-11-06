import { asc, db, eq, leadsTable, nextActionsTable } from "@vetra/database";

import { leadColumns } from "../../leads/repositories/leadColumns";
import type { NextActionWithLead } from "../domain";

type findNextActionsInput = {
  id?: string;
  leadId?: string;
};

export const nextActionColumns = {
  id: nextActionsTable.id,
  leadId: nextActionsTable.leadId,
  type: nextActionsTable.type,
  followUpStep: nextActionsTable.followUpStep,
  description: nextActionsTable.description,
  body: nextActionsTable.body,
  dueAt: nextActionsTable.dueAt,
  createdAt: nextActionsTable.createdAt,
  sendAttempts: nextActionsTable.sendAttempts,
  sendError: nextActionsTable.sendError,
  sendBlocksDone: nextActionsTable.sendBlocksDone,
};

// Every pending action (or one lead's, or a single one) with its lead, soonest first.
export async function findNextActions({ id, leadId }: findNextActionsInput = {}): Promise<
  NextActionWithLead[]
> {
  const rows = await db
    .select({ ...nextActionColumns, lead: leadColumns })
    .from(nextActionsTable)
    .innerJoin(leadsTable, eq(leadsTable.id, nextActionsTable.leadId))
    .where(
      id ? eq(nextActionsTable.id, id) : leadId ? eq(nextActionsTable.leadId, leadId) : undefined
    )
    .orderBy(asc(nextActionsTable.dueAt), asc(nextActionsTable.id));
  return rows;
}
