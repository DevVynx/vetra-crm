import { nextActionDomain, type NextActionInput, type NextActionWithLead } from "../domain";
import { nextActionRepositories } from "../repositories";
import { getNextAction } from "./getNextAction";

export async function updateNextAction(
  id: string,
  input: NextActionInput
): Promise<NextActionWithLead> {
  const { lead, ...action } = await getNextAction(id);

  const edited = nextActionDomain.edit(action, input);
  await nextActionRepositories.updateNextAction(edited);

  return { ...edited, lead };
}
