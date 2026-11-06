import {
  deleteWhatsappMessagesRequestSchema,
  editWhatsappMessageRequestSchema,
  leadMessagesQuerySchema,
  leadParamsSchema,
  listWhatsappConversationsQuerySchema,
  listWhatsappMessagesQuerySchema,
  openWhatsappConversationRequestSchema,
  resolveWhatsappAccountChangeRequestSchema,
  sendWhatsappMediaQuerySchema,
  sendWhatsappMessageRequestSchema,
  sendWhatsappVoiceQuerySchema,
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
  getMessageMedia: validation({ params: whatsappMessageParamsSchema }),
  markMessagePlayed: validation({ params: whatsappMessageParamsSchema }),
  sendVoice: validation({
    params: whatsappConversationParamsSchema,
    query: sendWhatsappVoiceQuerySchema,
  }),
  sendMedia: validation({
    params: whatsappConversationParamsSchema,
    query: sendWhatsappMediaQuerySchema,
  }),
  editMessage: validation({
    params: whatsappMessageParamsSchema,
    body: editWhatsappMessageRequestSchema,
  }),
  deleteMessages: validation({
    params: whatsappConversationParamsSchema,
    body: deleteWhatsappMessagesRequestSchema,
  }),
  leadConversation: validation({ params: leadParamsSchema }),
  leadMessages: validation({ params: leadParamsSchema, query: leadMessagesQuerySchema }),
};

export default v;
