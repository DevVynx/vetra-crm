import { reactToSentText } from "../../automations/helpers/reactToSentText";
import {
  WhatsappNotConnectedError,
  WhatsappNumberNotFoundError,
  WhatsappSendRestrictedError,
  WhatsappUnavailableError,
} from "../../whatsapp/errors";
import { whatsappServices } from "../../whatsapp/services";
import { nextActionDomain, type NextActionWithLead } from "../domain";
import { NextActionBeingSentError } from "../errors";
import { nextActionRepositories } from "../repositories";

const failureCodeOf = (error: unknown): string => {
  if (error instanceof WhatsappNotConnectedError) return "not_connected";
  if (error instanceof WhatsappNumberNotFoundError) return "number_not_found";
  if (error instanceof WhatsappSendRestrictedError) return "send_restricted";
  if (error instanceof WhatsappUnavailableError) return "unavailable";

  return "unknown";
};

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Sends the text of an action to its lead, one WhatsApp message for each block, and completes it.
// A block that went is written down before the next one, so a retry never repeats it. A failure frees
// the action again, with why, and is thrown for the caller to answer (the user) or to log (the loop).
export async function deliverNextAction(
  action: NextActionWithLead,
  countsAsAutomaticAttempt: boolean
): Promise<void> {
  const balloons = nextActionDomain.balloonsOf(action.body);

  const claimed = await nextActionRepositories.claimNextActionForSending(action.id, new Date());
  if (!claimed) throw new NextActionBeingSentError();

  try {
    const conversation = await whatsappServices.openWhatsappConversation(action.lead.phone);

    for (let index = action.sendBlocksDone; index < balloons.length; index++) {
      if (index > action.sendBlocksDone)
        await pause(nextActionDomain.delivery.pauseBetweenBalloonsMs);

      await whatsappServices.sendWhatsappMessage({
        conversationId: conversation.id,
        text: balloons[index],
        replyToMessageId: undefined,
      });
      await nextActionRepositories.recordSendProgress(action.id, index + 1);
    }
  } catch (error) {
    await nextActionRepositories.releaseNextActionSending(action.id, {
      error: failureCodeOf(error),
      countAttempt: countsAsAutomaticAttempt,
    });
    throw error;
  }

  const now = new Date();
  await nextActionRepositories.moveNextActionToCompleted(
    nextActionDomain.complete(action, now, now)
  );
  await reactToSentText(action.lead.id);
}
