import { getLead } from "../../leads/services/getLead";
import type { NextAction } from "../domain";
import { NextActionAlreadyExistsError } from "../errors";
import { nextActionRepositories } from "../repositories";

// Undo of a deletion: the action comes back with its original id.
export async function restoreNextAction(action: NextAction): Promise<void> {
  await getLead(action.leadId);

  const existing = await nextActionRepositories.findNextActions({ id: action.id });
  if (existing.length > 0) throw new NextActionAlreadyExistsError();

  await nextActionRepositories.insertNextAction(action);
}
