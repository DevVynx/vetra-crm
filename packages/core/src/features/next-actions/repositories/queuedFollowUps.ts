import {
  asc,
  type Database,
  db,
  eq,
  inArray,
  nextActionsTable,
  queuedFollowUpsTable,
  type Transaction,
} from "@vetra/database";

import { nextActionDomain, type QueuedFollowUpInput } from "../domain";

type Executor = Database | Transaction;

export async function insertQueuedFollowUps(
  executor: Executor,
  leadId: string,
  items: QueuedFollowUpInput[]
): Promise<void> {
  if (items.length === 0) return;

  await executor
    .insert(queuedFollowUpsTable)
    .values(items.map(({ step, body }) => ({ id: crypto.randomUUID(), leadId, step, body })));
}

// The pipeline's follow-ups are only taken once per lead: any row, in any state, means it already got them.
export async function hasQueuedFollowUps(leadId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: queuedFollowUpsTable.id })
    .from(queuedFollowUpsTable)
    .where(eq(queuedFollowUpsTable.leadId, leadId))
    .limit(1);

  return Boolean(row);
}

export async function findQueuedFollowUpStates(
  leadIds: string[]
): Promise<{ leadId: string; step: number; status: "queued" | "scheduled" | "cancelled" }[]> {
  if (leadIds.length === 0) return [];

  return db
    .select({
      leadId: queuedFollowUpsTable.leadId,
      step: queuedFollowUpsTable.step,
      status: queuedFollowUpsTable.status,
    })
    .from(queuedFollowUpsTable)
    .where(inArray(queuedFollowUpsTable.leadId, leadIds))
    .orderBy(asc(queuedFollowUpsTable.step));
}

type ScheduleCriteria = {
  leadId: string;
  anchorAt: Date;
  waitDays: number[];
  // The completed activity that triggers it, so undoing that completion can put the follow-up back.
  triggeredByActionId: string | null;
};

// Makes the lowest queued step an activity, due its wait after the anchor. Nothing happens if a follow-up of the
// queue is still pending: the next one only comes when that one is done.
export async function scheduleNextQueuedFollowUp(
  tx: Executor,
  { leadId, anchorAt, waitDays, triggeredByActionId }: ScheduleCriteria
): Promise<boolean> {
  const rows = await tx
    .select()
    .from(queuedFollowUpsTable)
    .where(eq(queuedFollowUpsTable.leadId, leadId))
    .orderBy(asc(queuedFollowUpsTable.step));

  const next = rows.find((row) => row.status === "queued");
  if (!next) return false;

  const scheduledIds = rows.flatMap((row) =>
    row.status === "scheduled" && row.scheduledActionId ? [row.scheduledActionId] : []
  );
  if (scheduledIds.length > 0) {
    const [stillPending] = await tx
      .select({ id: nextActionsTable.id })
      .from(nextActionsTable)
      .where(inArray(nextActionsTable.id, scheduledIds))
      .limit(1);
    if (stillPending) return false;
  }

  const action = nextActionDomain.create(leadId, {
    type: "follow_up",
    followUpStep: next.step,
    description: `Follow-up ${next.step}`,
    body: next.body,
    dueAt: nextActionDomain.followUpDueAt(next.step, waitDays, anchorAt),
  });
  await tx.insert(nextActionsTable).values(action);
  await tx
    .update(queuedFollowUpsTable)
    .set({
      status: "scheduled",
      scheduledActionId: action.id,
      scheduledByActionId: triggeredByActionId,
    })
    .where(eq(queuedFollowUpsTable.id, next.id));

  return true;
}

// Whether completing this activity is what starts the next follow-up: the opening message, or a follow-up of the queue.
export async function startsNextFollowUp(
  tx: Executor,
  completed: { id: string; type: string }
): Promise<boolean> {
  if (completed.type === "first_approach") return true;

  const [row] = await tx
    .select({ id: queuedFollowUpsTable.id })
    .from(queuedFollowUpsTable)
    .where(eq(queuedFollowUpsTable.scheduledActionId, completed.id))
    .limit(1);

  return Boolean(row);
}

// Undo of a completion: the follow-up it made goes back to the queue, if nobody did it yet.
export async function unscheduleFollowUpMadeBy(tx: Executor, completedId: string): Promise<void> {
  const [row] = await tx
    .select()
    .from(queuedFollowUpsTable)
    .where(eq(queuedFollowUpsTable.scheduledByActionId, completedId))
    .limit(1);
  if (!row || row.status !== "scheduled" || !row.scheduledActionId) return;

  const deleted = await tx
    .delete(nextActionsTable)
    .where(eq(nextActionsTable.id, row.scheduledActionId))
    .returning({ id: nextActionsTable.id });
  if (deleted.length === 0) return;

  await tx
    .update(queuedFollowUpsTable)
    .set({ status: "queued", scheduledActionId: null, scheduledByActionId: null })
    .where(eq(queuedFollowUpsTable.id, row.id));
}

// A reply, or leaving the funnel, ends the follow-ups: what waits will never be made.
export async function cancelQueuedFollowUps(executor: Executor, leadIds: string[]): Promise<void> {
  if (leadIds.length === 0) return;

  await executor
    .update(queuedFollowUpsTable)
    .set({ status: "cancelled" })
    .where(inArray(queuedFollowUpsTable.leadId, leadIds));
}

type QueueSchedule = { anchorAt: Date; waitDays: number[] };

// Keeps the texts and, for a lead whose opening message went already (outside Vetra), makes the first one an
// activity at once. For a lead whose opening is an activity of Vetra, nothing is made until that one is done.
export async function queueFollowUpsIn(
  tx: Executor,
  leadId: string,
  items: QueuedFollowUpInput[],
  schedule: QueueSchedule | null
): Promise<void> {
  await insertQueuedFollowUps(tx, leadId, items);
  if (schedule) {
    await scheduleNextQueuedFollowUp(tx, { leadId, ...schedule, triggeredByActionId: null });
  }
}

export async function queueFollowUps(
  leadId: string,
  items: QueuedFollowUpInput[],
  schedule: QueueSchedule | null
): Promise<void> {
  await db.transaction((tx) => queueFollowUpsIn(tx, leadId, items, schedule));
}
