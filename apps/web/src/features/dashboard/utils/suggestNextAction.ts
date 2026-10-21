import type { NextAction, NextActionInput } from "@vetra/contracts";

import { inDays } from "./dueDates";

// Days after the previous contact for each follow-up step (D+2, D+5, D+10).
// Mocked here until the cadence becomes configurable and owned by the backend.
const FOLLOW_UP_GAPS_IN_DAYS = [2, 3, 5];

function followUp(step: number): NextActionInput {
  return {
    type: "follow_up",
    followUpStep: step,
    description: `Follow-up ${step}`,
    dueAt: inDays(FOLLOW_UP_GAPS_IN_DAYS[step - 1]).toISOString(),
  };
}

export function suggestNextAction(completed: NextAction): NextActionInput {
  if (completed.type === "first_approach") return followUp(1);

  const nextStep = (completed.followUpStep ?? 0) + 1;
  if (completed.type === "follow_up" && nextStep <= FOLLOW_UP_GAPS_IN_DAYS.length) {
    return followUp(nextStep);
  }

  return { type: "custom", followUpStep: null, description: "", dueAt: inDays(7).toISOString() };
}
