import {
  and,
  asc,
  db,
  eq,
  isNotNull,
  isNull,
  leadsTable,
  lt,
  ne,
  nextActionsTable,
  or,
  sql,
} from "@vetra/database";

import { leadColumns } from "../../leads/repositories/leadColumns";
import { nextActionDomain, type NextActionWithLead } from "../domain";
import { nextActionColumns } from "./findNextActions";

type Criteria = { now: Date; delayMinutes: number };

// When an activity is due to go by itself: its due time, or its creation plus the minutes to wait,
// whichever is later.
const scheduledAtSql = (delayMinutes: number) =>
  sql`greatest(${nextActionsTable.dueAt}, ${nextActionsTable.createdAt} + make_interval(mins => ${delayMinutes}))`;

// What is due to be sent by itself: an activity with a text, of a lead that did not ask to stop, not
// being sent, not failed for good, and whose time came. After a failure it waits before trying again.
// leadHasSending picks the leads whose own switch is on (what the loop sends) or off (what would go
// at once if it were turned on, which the screen tells before it does).
export function autoSendDueConditions({ now, delayMinutes }: Criteria, leadHasSending: boolean) {
  const { maxAutomaticAttempts, retryAfterMs } = nextActionDomain.delivery;
  const retryBefore = new Date(now.getTime() - retryAfterMs);

  return [
    isNotNull(nextActionsTable.body),
    ne(nextActionsTable.body, ""),
    eq(leadsTable.autoSend, leadHasSending),
    eq(leadsTable.doNotContact, false),
    isNull(nextActionsTable.sendingSince),
    lt(nextActionsTable.sendAttempts, maxAutomaticAttempts),
    sql`${scheduledAtSql(delayMinutes)} <= ${now}`,
    or(eq(nextActionsTable.sendAttempts, 0), sql`${nextActionsTable.updatedAt} <= ${retryBefore}`),
  ];
}

export async function findAutoSendCandidates(criteria: Criteria): Promise<NextActionWithLead[]> {
  return db
    .select({ ...nextActionColumns, lead: leadColumns })
    .from(nextActionsTable)
    .innerJoin(leadsTable, eq(leadsTable.id, nextActionsTable.leadId))
    .where(and(...autoSendDueConditions(criteria, true)))
    .orderBy(asc(scheduledAtSql(criteria.delayMinutes)), asc(nextActionsTable.id));
}
