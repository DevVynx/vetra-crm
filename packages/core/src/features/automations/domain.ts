export type AutomationSettings = {
  // The master switch: nothing is sent by itself while it is off.
  autoSendEnabled: boolean;
  autoSendDelayMinutes: number;
  // Whether a lead that comes in starts with its own "Envio automático" on.
  newLeadsAutoSend: boolean;
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
};
