import { nextActionDomain, type NextActionWithLead } from "../domain";
import { NextActionNotFoundError } from "../errors";
import { nextActionRepositories } from "../repositories";
import { getNextAction } from "./getNextAction";

// Undo of a completion, for someone who clicked it by mistake.
export async function reopenNextAction(id: string): Promise<NextActionWithLead> {
  const completed = await nextActionRepositories.findCompletedAction(id);
  if (!completed) throw new NextActionNotFoundError();

  const reopened = await nextActionRepositories.reopenCompletedAction(
    nextActionDomain.reopen(completed)
  );
  if (!reopened) throw new NextActionNotFoundError();

  return getNextAction(id);
}
