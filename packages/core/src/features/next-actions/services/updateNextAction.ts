import { nextActionDomain, type NextActionInput, type NextActionWithLead } from "../domain";
import { nextActionRepositories } from "../repositories";
import { getNextAction } from "./getNextAction";

export async function updateNextAction(
  id: string,
  input: NextActionInput
): Promise<NextActionWithLead> {
  const {
    lead: _lead,
    createdAt: _c,
    sendAttempts: _a,
    sendError: _e,
    sendBlocksDone: _b,
    ...action
  } = await getNextAction(id);

  const edited = nextActionDomain.edit(action, input);
  // An edit is the user looking at it again, so a failed send is given a fresh start. What already
  // went of the text only starts over when the text itself changed.
  await nextActionRepositories.updateNextAction(edited, {
    textChanged: action.body !== edited.body,
  });

  return getNextAction(id);
}
