import { whatsappRepositories } from "../repositories";

type ListWhatsappConversationsInput = {
  q?: string | undefined;
  page: number;
  pageSize: number;
};

export function listWhatsappConversations(input: ListWhatsappConversationsInput) {
  return whatsappRepositories.findConversationsPage(input);
}
