import {
  listWhatsappConversationsQuerySchema,
  listWhatsappMessagesQuerySchema,
  openWhatsappConversationRequestSchema,
  resolveWhatsappAccountChangeRequestSchema,
  sendWhatsappMessageRequestSchema,
  whatsappConversationParamsSchema,
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
};

export default v;
