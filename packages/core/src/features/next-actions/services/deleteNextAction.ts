import { NextActionNotFoundError } from "../errors";
import { nextActionRepositories } from "../repositories";

export async function deleteNextAction(id: string): Promise<void> {
  const deleted = await nextActionRepositories.deleteNextAction(id);
  if (!deleted) throw new NextActionNotFoundError();
}
