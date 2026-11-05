import {
  deleteWhatsappMessagesRequestSchema,
  editWhatsappMessageRequestSchema,
  leadParamsSchema,
  listWhatsappConversationsQuerySchema,
  listWhatsappMessagesQuerySchema,
  openWhatsappConversationRequestSchema,
  resolveWhatsappAccountChangeRequestSchema,
  sendWhatsappMessageRequestSchema,
  whatsappConversationParamsSchema,
  whatsappMessageParamsSchema,
} from "@vetra/contracts";

import { validation } from "@/shared/http/validation";

const v = {
  resolveAccountChange: validation({ body: resolveWhatsappAccountChangeRequestSchema }),
  listConversations: validation({ query: listWhatsappConversationsQuerySchema }),
  openConversation: validation({ body: openWhatsappConversationRequestSchema }),
  getConversation: validation({ params: whatsappConversationParamsSchema }),
  listMessages: validation({
    params: whatsappConversationParamsSchema,
    query: listWhatsappMessagesQuerySchema,
  }),
  sendMessage: validation({
    params: whatsappConversationParamsSchema,
    body: sendWhatsappMessageRequestSchema,
  }),
  markRead: validation({ params: whatsappConversationParamsSchema }),
  editMessage: validation({
    params: whatsappMessageParamsSchema,
    body: editWhatsappMessageRequestSchema,
  }),
  deleteMessages: validation({
    params: whatsappConversationParamsSchema,
    body: deleteWhatsappMessagesRequestSchema,
  }),
  leadConversation: validation({ params: leadParamsSchema }),
};

export default v;
