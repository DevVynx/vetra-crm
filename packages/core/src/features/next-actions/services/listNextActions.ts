import type { NextActionWithLead } from "../domain";
import { nextActionRepositories } from "../repositories";

export async function listNextActions(): Promise<NextActionWithLead[]> {
  return nextActionRepositories.findNextActions();
}
