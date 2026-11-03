import type {
  LeadConversation,
  LeadSummary,
  WhatsappMessage,
  WhatsappMessageDirection,
} from "@vetra/contracts";
import { addHours, addMinutes } from "date-fns";

import { awaitingConversationOf, lastContactFor, mockLeads } from "./fixtures";
import { stageAfterEntryId } from "./stageRules";

const MAX_MESSAGES = 6;

const outboundTexts = [
  "Oi! Vi o perfil de vocês e montei uma demonstração de site. Posso te mostrar?",
  "Segue o link da demonstração. Qualquer ajuste me avisa!",
  "Consegue olhar com calma? Posso adaptar as cores e as fotos.",
  "Fechado, te mando a proposta ainda hoje.",
  "Passando pra saber se deu pra ver o material 🙂",
];

const inboundTexts = [
  "Oi, tudo bem? Pode mostrar sim.",
  "Gostei bastante! Dá pra colocar o horário de funcionamento?",
  "Quanto fica no total?",
  "Vou ver com meu sócio e te retorno.",
  "Pode ser amanhã de manhã?",
];

const opposite = (direction: WhatsappMessageDirection): WhatsappMessageDirection =>
  direction === "inbound" ? "outbound" : "inbound";

const messageFor = (
  id: string,
  direction: WhatsappMessageDirection,
  position: number,
  salt: number,
  sentAt: Date
): WhatsappMessage => {
  const texts = direction === "inbound" ? inboundTexts : outboundTexts;
  const kind = (salt + position) % 11;
  if (direction === "inbound" && kind === 0) {
    return { id, direction, type: "audio", content: null, sentAt: sentAt.toISOString() };
  }
  if (direction === "inbound" && kind === 5) {
    return { id, direction, type: "image", content: null, sentAt: sentAt.toISOString() };
  }
  if (direction === "outbound" && kind === 3) {
    return { id, direction, type: "document", content: null, sentAt: sentAt.toISOString() };
  }
  return {
    id,
    direction,
    type: "text",
    content: texts[(salt + position) % texts.length] ?? "",
    sentAt: sentAt.toISOString(),
  };
};

export function buildMockConversation(lead: LeadSummary): LeadConversation | null {
  const lastContactAt = lastContactFor(lead);
  if (!lastContactAt) return null;

  const index = mockLeads.findIndex((item) => item.id === lead.id);
  const awaiting = awaitingConversationOf(lead.id);
  const isFirstContact = lead.stage === stageAfterEntryId();
  const lastDirection: WhatsappMessageDirection =
    awaiting || (!isFirstContact && index % 2 === 0) ? "inbound" : "outbound";
  const count = isFirstContact ? 1 : MAX_MESSAGES - (index % 3);

  let direction = lastDirection;
  let sentAt = new Date(lastContactAt);
  const newestFirst: WhatsappMessage[] = [];
  for (let position = 0; position < count; position += 1) {
    const message = messageFor(
      `${lead.id}-message-${count - position}`,
      direction,
      position,
      index,
      sentAt
    );
    const isAwaitingPreview = awaiting && position === 0;
    newestFirst.push(
      isAwaitingPreview
        ? { ...message, type: "text", content: awaiting.lastMessagePreview }
        : message
    );
    direction = opposite(direction);
    sentAt = addMinutes(addHours(sentAt, -(2 + ((index + position) % 20))), -(position * 7));
  }

  return {
    id: `conversation-${lead.id}`,
    unreadCount: lastDirection === "inbound" ? (awaiting?.unreadCount ?? 1) : 0,
    messages: newestFirst.reverse(),
  };
}
