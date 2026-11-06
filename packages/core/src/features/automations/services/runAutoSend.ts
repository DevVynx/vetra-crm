import { nextActionDomain } from "../../next-actions/domain";
import { deliverNextAction } from "../../next-actions/helpers/deliverNextAction";
import { nextActionRepositories } from "../../next-actions/repositories";
import { whatsappServices } from "../../whatsapp/services";
import { getAutomationSettings } from "./getAutomationSettings";

const canSendNow = async () =>
  (await getAutomationSettings()).autoSendEnabled && whatsappServices.isWhatsappConnected();

// One pass of the automatic send. Everything is looked at again before each message, so turning the
// master switch off, or a lead's switch, or marking "Não contatar", stops what is still waiting.
// Nothing is capped here: the user is warned that sending a lot can get the number blocked.
export async function runAutoSend(now: Date = new Date()): Promise<number> {
  const { staleSendingMs, maxAutomaticAttempts } = nextActionDomain.delivery;
  await nextActionRepositories.failStaleSending(
    new Date(now.getTime() - staleSendingMs),
    maxAutomaticAttempts
  );

  if (!(await canSendNow())) return 0;

  const { autoSendDelayMinutes } = await getAutomationSettings();
  const due = await nextActionRepositories.findAutoSendCandidates({
    now,
    delayMinutes: autoSendDelayMinutes,
  });

  let sent = 0;
  for (const candidate of due) {
    if (!(await canSendNow())) break;

    const [action] = await nextActionRepositories.findNextActions({ id: candidate.id });
    const isStillDue =
      action &&
      action.lead.autoSend &&
      !action.lead.doNotContact &&
      nextActionDomain.canBeSent(action) &&
      // A marker to fill in is the user's to fill: it waits, and is never sent as it is.
      !nextActionDomain.hasMarker(action.body);
    if (!isStillDue) continue;

    try {
      await deliverNextAction(action, true);
      sent++;
    } catch (error) {
      console.error(
        `Automatic send failed: ${error instanceof Error ? error.name : "unknown error"}`
      );
    }
  }

  return sent;
}
