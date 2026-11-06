import { automationRepositories } from "../../automations/repositories";
import { nextActionDomain } from "../domain";
import { NextActionNotFoundError } from "../errors";
import { nextActionRepositories } from "../repositories";
import { getNextAction } from "./getNextAction";

// Only completes it. What comes next is the user's to schedule.
export async function completeNextAction(id: string): Promise<void> {
  const pending = await getNextAction(id);
  const { followUpWaitDays } = await automationRepositories.findAutomationSettings();

  const moved = await nextActionRepositories.moveNextActionToCompleted(
    nextActionDomain.complete(pending, new Date()),
    followUpWaitDays
  );
  if (!moved) throw new NextActionNotFoundError();
}
