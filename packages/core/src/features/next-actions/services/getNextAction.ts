import type { NextActionWithLead } from "../domain";
import { NextActionNotFoundError } from "../errors";
import { nextActionRepositories } from "../repositories";

export async function getNextAction(id: string): Promise<NextActionWithLead> {
  const [action] = await nextActionRepositories.findNextActions({ id });
  if (!action) throw new NextActionNotFoundError();

  return action;
}
