import {
  and,
  count,
  db,
  eq,
  inArray,
  leadsTable,
  nextActionsTable,
  sql,
  stagesTable,
} from "@vetra/database";

import { autoSendDueConditions } from "../../next-actions/repositories/findAutoSendCandidates";

// The leads the automatic sending is about: the ones still in the funnel. A customer is not prospected,
// and an archived lead has left it (and lost its pending activities).
const liveStageIds = () =>
  db
    .select({ id: stagesTable.id })
    .from(stagesTable)
    .where(inArray(stagesTable.role, ["entry", "middle"]));

// A text with the marker the pipeline leaves for the user's number is never sent by itself.
const hasNoMarker = sql`${nextActionsTable.body} !~* '\\[\\s*SEU\\s+WHATSAPP\\s*\\]'`;

export type AutoSendLeadsCounts = {
  // Leads in the funnel that did not ask to stop: the ones the "all" buttons reach.
  total: number;
  withSending: number;
  // Texts already due, of those that have the sending off, that would go at once if it were turned on.
  dueTexts: number;
};

export async function countAutoSendLeads(delayMinutes: number): Promise<AutoSendLeadsCounts> {
  const [leads] = await db
    .select({
      total: count(),
      withSending: sql<number>`count(*) filter (where ${leadsTable.autoSend})`.mapWith(Number),
    })
    .from(leadsTable)
    .where(and(eq(leadsTable.doNotContact, false), inArray(leadsTable.stageId, liveStageIds())));

  const [due] = await db
    .select({ dueTexts: count() })
    .from(nextActionsTable)
    .innerJoin(leadsTable, eq(leadsTable.id, nextActionsTable.leadId))
    .where(
      and(
        ...autoSendDueConditions({ now: new Date(), delayMinutes }, false),
        inArray(leadsTable.stageId, liveStageIds()),
        hasNoMarker
      )
    );

  return { total: leads.total, withSending: leads.withSending, dueTexts: due.dueTexts };
}

// Turning it on reaches the leads in the funnel that did not ask to stop; turning it off reaches every
// lead that has it on. Returns how many changed.
export async function setAutoSendOfLeads(autoSend: boolean): Promise<number> {
  const changed = await db
    .update(leadsTable)
    .set({ autoSend })
    .where(
      autoSend
        ? and(
            eq(leadsTable.autoSend, false),
            eq(leadsTable.doNotContact, false),
            inArray(leadsTable.stageId, liveStageIds())
          )
        : eq(leadsTable.autoSend, true)
    )
    .returning({ id: leadsTable.id });

  return changed.length;
}
