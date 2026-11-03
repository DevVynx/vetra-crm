import { nextActionDomain, type NextActionInput, type NextActionWithLead } from "../domain";
import { nextActionRepositories } from "../repositories";
import { getNextAction } from "./getNextAction";

export async function completeNextAction(
  id: string,
  next: NextActionInput
): Promise<NextActionWithLead> {
  const { lead, ...completed } = await getNextAction(id);

  const scheduled = nextActionDomain.followUp(completed, next);
  await nextActionRepositories.replaceNextAction(completed.id, scheduled);

  return { ...scheduled, lead };
}
