import {
  deleteWhatsappHistory,
  findWhatsappAccount,
  insertWhatsappAccount,
  markHistoryImported,
  replaceWhatsappAccount,
} from "./accounts";
import {
  countWhatsappConversations,
  findConversationByChatId,
  insertConversationIfNew,
  saveConversationFromOverview,
  updateConversationPhoto,
} from "./conversations";
import { markConversationReadByMessage, saveMessages } from "./messages";

export const whatsappRepositories = {
  countWhatsappConversations,
  deleteWhatsappHistory,
  findConversationByChatId,
  findWhatsappAccount,
  insertConversationIfNew,
  insertWhatsappAccount,
  markConversationReadByMessage,
  markHistoryImported,
  replaceWhatsappAccount,
  saveConversationFromOverview,
  saveMessages,
  updateConversationPhoto,
};
