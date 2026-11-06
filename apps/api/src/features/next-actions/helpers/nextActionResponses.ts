import type { NextAction, NextActionInput } from "@vetra/contracts";
import type { NextActionWithLead } from "@vetra/core";

import { toLeadSummary } from "@/features/leads/helpers/leadResponses";

export const toNextAction = (action: NextActionWithLead): NextAction => ({
  id: action.id,
  type: action.type,
  followUpStep: action.followUpStep,
  description: action.description,
  body: action.body,
  dueAt: action.dueAt.toISOString(),
  lead: toLeadSummary(action.lead),
});

export const fromNextActionInput = (input: NextActionInput) => ({
  ...input,
  dueAt: new Date(input.dueAt),
});
