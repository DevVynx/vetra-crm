import { automationRepositories } from "../repositories";
import { moveLeadByAutomation } from "./moveLeadByAutomation";

// The first text Vetra sends to a lead still at the start of the funnel moves it on. It is a reaction to
// a message that already went, so it never throws: the lead is already contacted either way.
export async function reactToSentText(leadId: string): Promise<void> {
  try {
    const settings = await automationRepositories.findAutomationSettings();
    if (!settings.autoSendEnabled || !settings.moveOnSendEnabled) return;

    await moveLeadByAutomation(leadId, settings.moveOnSendStageId, {
      kind: "forward",
      onlyFromEntry: true,
    });
  } catch (error) {
    console.error(
      `Automation after a send failed: ${error instanceof Error ? error.name : "unknown error"}`
    );
  }
}
