import { v7 as uuidv7 } from "uuid";

import type { Lead } from "../leads/domain";

export type NextActionType = "first_approach" | "follow_up" | "meeting" | "proposal" | "custom";

export type NextActionInput = {
  type: NextActionType;
  followUpStep: number | null;
  description: string;
  body: string | null;
  dueAt: Date;
};

export type NextAction = NextActionInput & {
  id: string;
  leadId: string;
};

export type CompletedAction = NextAction & { completedAt: Date; sentAt: Date | null };

// What a pending action has besides what is typed: when it was made, and how sending it went.
export type NextActionDelivery = {
  createdAt: Date;
  sendAttempts: number;
  sendError: string | null;
  sendBlocksDone: number;
};

// What cancelling a lead's follow-ups removed, kept by the client so the cancellation can be undone.
export type FollowUpQueueState = {
  id: string;
  status: "queued" | "scheduled" | "cancelled";
  scheduledActionId: string | null;
  scheduledByActionId: string | null;
};
export type FollowUpsSnapshot = { actions: NextAction[]; queue: FollowUpQueueState[] };

export type NextActionWithLead = NextAction & NextActionDelivery & { lead: Lead };

// The pipeline leaves this where the user's own number goes. Sent as it is, it would reach the lead.
const MARKER = /\[\s*SEU\s+WHATSAPP\s*\]/i;

// What the pipeline hands over for a lead: the text of a follow-up and which of the three it is.
export type QueuedFollowUpInput = { step: number; body: string };

const MAX_FOLLOW_UPS_FROM_PIPELINE = 3;
const DAY_MS = 86_400_000;

// When a follow-up is due: the wait of its position in the sequence, counted from the message before it.
function followUpDueAt(step: number, waitDays: number[], from: Date): Date {
  const days = waitDays[step - 1] ?? 0;

  return new Date(from.getTime() + days * DAY_MS);
}

const delivery = {
  // After this many automatic failures an action waits for the user.
  maxAutomaticAttempts: 2,
  retryAfterMs: 60_000,
  // A send that began and did not end within this time was cut short by a stop of the server.
  staleSendingMs: 600_000,
  // A text of several blocks goes as one message each, like someone typing them one after the other.
  pauseBetweenBalloonsMs: 1_500,
};

// The pipeline writes a message in several bubbles by separating them with a blank line.
function balloonsOf(body: string | null): string[] {
  return (body ?? "")
    .replace(/\r\n/g, "\n")
    .split(/\n[ \t]*\n/)
    .map((block) => block.trim())
    .filter((block) => block !== "");
}

const hasMarker = (body: string | null): boolean => body !== null && MARKER.test(body);

// Whatever its type, an activity with a text has a message to send: the field says so.
function canBeSent(action: Pick<NextAction, "body">): boolean {
  return balloonsOf(action.body).length > 0;
}

function create(leadId: string, input: NextActionInput): NextAction {
  return { ...input, id: uuidv7(), leadId };
}

function edit(action: NextAction, input: NextActionInput): NextAction {
  return { ...action, ...input };
}

// A done action leaves the pending ones, and what was done stays as history, with when. It is sent
// when completing it was sending its text.
function complete(action: NextAction, now: Date, sentAt: Date | null = null): CompletedAction {
  return {
    id: action.id,
    leadId: action.leadId,
    type: action.type,
    followUpStep: action.followUpStep,
    description: action.description,
    body: action.body,
    dueAt: action.dueAt,
    completedAt: now,
    sentAt,
  };
}

// Undo of a completion: the action is pending again, with the id it had.
function reopen(completed: CompletedAction): NextAction {
  return {
    id: completed.id,
    leadId: completed.leadId,
    type: completed.type,
    followUpStep: completed.followUpStep,
    description: completed.description,
    body: completed.body,
    dueAt: completed.dueAt,
  };
}

export const followUpLimits = { maxFromPipeline: MAX_FOLLOW_UPS_FROM_PIPELINE };

export const nextActionDomain = {
  balloonsOf,
  canBeSent,
  complete,
  create,
  delivery,
  edit,
  followUpDueAt,
  hasMarker,
  reopen,
};
