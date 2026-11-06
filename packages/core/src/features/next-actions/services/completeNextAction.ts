import { nextActionDomain, type NextActionInput, type NextActionWithLead } from "../domain";
import { nextActionRepositories } from "../repositories";
import { getNextAction } from "./getNextAction";

export async function completeNextAction(
  id: string,
  next: NextActionInput
): Promise<NextActionWithLead> {
  const { lead, ...pending } = await getNextAction(id);

  const scheduled = nextActionDomain.followUp(pending, next);
  const completed = nextActionDomain.complete(pending, new Date());
  await nextActionRepositories.replaceNextAction(completed, scheduled);

  return { ...scheduled, lead };
}
