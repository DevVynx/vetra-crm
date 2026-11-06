import { v7 as uuidv7 } from "uuid";

import type { Lead } from "../leads/domain";

export type NextActionType = "first_approach" | "follow_up" | "meeting" | "proposal" | "custom";

export type NextActionInput = {
  type: NextActionType;
  followUpStep: number | null;
  description: string;
  dueAt: Date;
};

export type NextAction = NextActionInput & {
  id: string;
  leadId: string;
};

export type CompletedAction = NextAction & { completedAt: Date };

export type NextActionWithLead = NextAction & { lead: Lead };

function create(leadId: string, input: NextActionInput): NextAction {
  return { ...input, id: uuidv7(), leadId };
}

function edit(action: NextAction, input: NextActionInput): NextAction {
  return { ...action, ...input };
}

// A done action leaves the pending ones, and what was done stays as history, with when.
function complete(action: NextAction, now: Date): CompletedAction {
  return {
    id: action.id,
    leadId: action.leadId,
    type: action.type,
    followUpStep: action.followUpStep,
    description: action.description,
    dueAt: action.dueAt,
    completedAt: now,
  };
}

// Completing an action removes it and schedules the next one for the same lead.
function followUp(completed: NextAction, next: NextActionInput): NextAction {
  return create(completed.leadId, next);
}

export const nextActionDomain = { create, complete, edit, followUp };
