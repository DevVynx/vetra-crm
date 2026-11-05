import { whatsappRepositories } from "../repositories";

const AWAITING_LIMIT = 50;

export function listAwaitingWhatsappConversations() {
  return whatsappRepositories.findAwaitingConversations(AWAITING_LIMIT);
}
