import type { AutomationSettings, NextAction } from "@vetra/contracts";

const MINUTE_IN_MS = 60_000;

// Equal to the rules in packages/core (nextActions domain), which the web does not import.
const MARKER = /\[\s*SEU\s+WHATSAPP\s*\]/i;
export const MAX_AUTOMATIC_ATTEMPTS = 2;

// A text goes as one WhatsApp message for each block separated by a blank line (the same rule as in
// packages/core).
export const balloonsOf = (body: string | null): string[] =>
  (body ?? "")
    .replace(/\r\n/g, "\n")
    .split(/\n[ \t]*\n/)
    .map((block) => block.trim())
    .filter((block) => block !== "");

export const hasMarker = (body: string | null): boolean => body !== null && MARKER.test(body);

// Whatever its type, an activity with a text has a message to send.
export const canBeSent = (action: Pick<NextAction, "body">): boolean =>
  (action.body ?? "").trim() !== "";

// When Vetra will send it by itself, or null when it will not (and why is for the screen to say):
// the master switch off, the lead's off or asked to stop, a marker to fill in, or failed for good.
export function autoSendTimeOf(action: NextAction, settings: AutomationSettings): Date | null {
  if (!settings.autoSendEnabled || !action.lead.autoSend || action.lead.doNotContact) return null;
  if (!canBeSent(action) || hasMarker(action.body)) return null;
  if (action.sendAttempts >= MAX_AUTOMATIC_ATTEMPTS) return null;

  const created = new Date(action.createdAt).getTime();
  const waitedUntil = new Date(created + settings.autoSendDelayMinutes * MINUTE_IN_MS);
  const due = new Date(action.dueAt);

  return waitedUntil > due ? waitedUntil : due;
}

const FAILURE_REASONS: Record<string, string> = {
  not_connected: "o WhatsApp estava desconectado",
  number_not_found: "o número não está no WhatsApp",
  send_restricted: "o WhatsApp limitou o envio",
  unavailable: "o serviço do WhatsApp estava indisponível",
  interrupted: "o envio foi interrompido e talvez a mensagem tenha saído: confira a conversa",
};

export const failureReasonOf = (code: string): string =>
  FAILURE_REASONS[code] ?? "ocorreu um erro desconhecido";
