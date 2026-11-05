import { WHATSAPP_MEDIA_MAX_BYTES } from "@vetra/contracts";
import { whatsappRoutes } from "@vetra/routes";
import { Router } from "express";

import { rawFileBody } from "@/shared/middlewares/rawFileBody";

import {
  connectWhatsappController,
  countWhatsappConversationsController,
  deleteWhatsappConversationsController,
  deleteWhatsappMessagesController,
  disconnectWhatsappController,
  editWhatsappMessageController,
  getLeadConversationController,
  getWhatsappConversationController,
  getWhatsappMessageMediaController,
  getWhatsappQrCodeController,
  getWhatsappStatusController,
  listAwaitingWhatsappConversationsController,
  listWhatsappConversationsController,
  listWhatsappMessagesController,
  markWhatsappConversationReadController,
  markWhatsappMessagePlayedController,
  openLeadConversationController,
  openWhatsappConversationController,
  resolveWhatsappAccountChangeController,
  sendWhatsappMediaController,
  sendWhatsappMessageController,
  sendWhatsappVoiceController,
  streamWhatsappEventsController,
} from "./controllers";
import v from "./validators";

export const whatsappRouter: Router = Router();

whatsappRouter.get(whatsappRoutes.status, getWhatsappStatusController);
whatsappRouter.post(whatsappRoutes.connect, connectWhatsappController);
whatsappRouter.get(whatsappRoutes.qrCode, getWhatsappQrCodeController);
whatsappRouter.post(whatsappRoutes.disconnect, disconnectWhatsappController);
whatsappRouter.post(
  whatsappRoutes.accountChange,
  v.resolveAccountChange,
  resolveWhatsappAccountChangeController
);
whatsappRouter.get(whatsappRoutes.events, streamWhatsappEventsController);

// Declared before the :id routes, which would otherwise take these words for an id.
whatsappRouter.get(whatsappRoutes.conversationCount, countWhatsappConversationsController);
whatsappRouter.get(
  whatsappRoutes.conversationsAwaiting,
  listAwaitingWhatsappConversationsController
);
whatsappRouter.get(
  whatsappRoutes.conversations,
  v.listConversations,
  listWhatsappConversationsController
);
whatsappRouter.post(
  whatsappRoutes.conversations,
  v.openConversation,
  openWhatsappConversationController
);
whatsappRouter.delete(whatsappRoutes.conversations, deleteWhatsappConversationsController);
whatsappRouter.get(
  whatsappRoutes.conversationById,
  v.getConversation,
  getWhatsappConversationController
);
whatsappRouter.get(
  whatsappRoutes.conversationMessages,
  v.listMessages,
  listWhatsappMessagesController
);
whatsappRouter.post(
  whatsappRoutes.conversationMessages,
  v.sendMessage,
  sendWhatsappMessageController
);
whatsappRouter.post(
  whatsappRoutes.conversationRead,
  v.markRead,
  markWhatsappConversationReadController
);
whatsappRouter.get(
  whatsappRoutes.leadConversation,
  v.leadConversation,
  getLeadConversationController
);
whatsappRouter.post(
  whatsappRoutes.leadConversation,
  v.leadConversation,
  openLeadConversationController
);
whatsappRouter.post(
  whatsappRoutes.conversationMessageDelete,
  v.deleteMessages,
  deleteWhatsappMessagesController
);
whatsappRouter.patch(
  whatsappRoutes.conversationMessageById,
  v.editMessage,
  editWhatsappMessageController
);
whatsappRouter.get(
  whatsappRoutes.conversationMessageMedia,
  v.getMessageMedia,
  getWhatsappMessageMediaController
);
whatsappRouter.post(
  whatsappRoutes.conversationMessagePlayed,
  v.markMessagePlayed,
  markWhatsappMessagePlayedController
);
whatsappRouter.post(
  whatsappRoutes.conversationMessagesMedia,
  rawFileBody(WHATSAPP_MEDIA_MAX_BYTES),
  v.sendMedia,
  sendWhatsappMediaController
);
whatsappRouter.post(
  whatsappRoutes.conversationMessagesVoice,
  v.sendVoice,
  rawFileBody(WHATSAPP_MEDIA_MAX_BYTES),
  sendWhatsappVoiceController
);
