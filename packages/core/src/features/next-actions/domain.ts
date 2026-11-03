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

export type NextActionWithLead = NextAction & { lead: Lead };

function create(leadId: string, input: NextActionInput): NextAction {
  return { ...input, id: uuidv7(), leadId };
}

function edit(action: NextAction, input: NextActionInput): NextAction {
  return { ...action, ...input };
}

// Completing an action removes it and schedules the next one for the same lead.
function followUp(completed: NextAction, next: NextActionInput): NextAction {
  return create(completed.leadId, next);
}

export const nextActionDomain = { create, edit, followUp };
