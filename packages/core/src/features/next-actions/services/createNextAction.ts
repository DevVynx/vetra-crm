import { getLead } from "../../leads/services/getLead";
import { nextActionDomain, type NextActionInput, type NextActionWithLead } from "../domain";
import { nextActionRepositories } from "../repositories";

export async function createNextAction(
  leadId: string,
  input: NextActionInput
): Promise<NextActionWithLead> {
  const lead = await getLead(leadId);

  const action = nextActionDomain.create(leadId, input);
  await nextActionRepositories.insertNextAction(action);

  return { ...action, lead };
}
