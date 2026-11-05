import { whatsappRepositories } from "../repositories";

export function countWhatsappConversations(): Promise<number> {
  return whatsappRepositories.countWhatsappConversations();
}
