import { getLead } from "../../leads/services/getLead";
import { nextActionDomain, type NextActionInput, type NextActionWithLead } from "../domain";
import { nextActionRepositories } from "../repositories";
import { getNextAction } from "./getNextAction";

export async function createNextAction(
  leadId: string,
  input: NextActionInput
): Promise<NextActionWithLead> {
  await getLead(leadId);

  const action = nextActionDomain.create(leadId, input);
  await nextActionRepositories.insertNextAction(action);

  return getNextAction(action.id);
}
