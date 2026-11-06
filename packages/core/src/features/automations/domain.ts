export type AutomationSettings = {
  // The master switch: nothing is sent by itself while it is off.
  autoSendEnabled: boolean;
  autoSendDelayMinutes: number;
  // Whether a lead that comes in starts with its own "Envio automático" on.
  newLeadsAutoSend: boolean;
  // Reactions to the conversation, each with its own switch. They only run while the master switch is on.
  moveOnSendEnabled: boolean;
  moveOnSendStageId: string | null;
  moveOnReplyEnabled: boolean;
  moveOnReplyStageId: string | null;
  cancelFollowUpsOnReply: boolean;
  archiveUnansweredEnabled: boolean;
  archiveUnansweredStageId: string | null;
  archiveUnansweredDays: number;
};

// A lead that comes in starts with its own switch on only if the master switch is on too: with it off the
// option is not even shown, so it must not keep working behind the scenes.
export const newLeadAutoSendOf = (settings: AutomationSettings): boolean =>
  settings.autoSendEnabled && settings.newLeadsAutoSend;

// Everything off until the user turns it on: sending messages by itself is the user's choice.
export const DEFAULT_AUTOMATION_SETTINGS: AutomationSettings = {
  autoSendEnabled: false,
  autoSendDelayMinutes: 2,
  newLeadsAutoSend: false,
  moveOnSendEnabled: false,
  moveOnSendStageId: null,
  moveOnReplyEnabled: false,
  moveOnReplyStageId: null,
  cancelFollowUpsOnReply: true,
  archiveUnansweredEnabled: false,
  archiveUnansweredStageId: null,
  archiveUnansweredDays: 7,
};
