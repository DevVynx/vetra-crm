import {
  deleteWhatsappHistory,
  findWhatsappAccount,
  insertWhatsappAccount,
  markHistoryImported,
  replaceWhatsappAccount,
} from "./accounts";
import {
  clearConversationUnread,
  countWhatsappConversations,
  findConversationByChatId,
  findConversationById,
  findConversationByPhoneKey,
  findConversationRowById,
  findConversationsPage,
  insertConversationIfNew,
  saveConversationFromOverview,
  updateConversationPhoto,
} from "./conversations";
import {
  advanceMessageStatus,
  findMessagesPage,
  markConversationReadByMessage,
  saveMessages,
} from "./messages";

export const whatsappRepositories = {
  advanceMessageStatus,
  clearConversationUnread,
  countWhatsappConversations,
  deleteWhatsappHistory,
  findConversationByChatId,
  findConversationById,
  findConversationByPhoneKey,
  findConversationRowById,
  findConversationsPage,
  findMessagesPage,
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
