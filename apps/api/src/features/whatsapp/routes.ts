import { whatsappRoutes } from "@vetra/routes";
import { Router } from "express";

import {
  connectWhatsappController,
  countWhatsappConversationsController,
  deleteWhatsappConversationsController,
  disconnectWhatsappController,
  getWhatsappConversationController,
  getWhatsappQrCodeController,
  getWhatsappStatusController,
  listWhatsappConversationsController,
  listWhatsappMessagesController,
  markWhatsappConversationReadController,
  openWhatsappConversationController,
  resolveWhatsappAccountChangeController,
  sendWhatsappMessageController,
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

// Declared before the :id routes, which would otherwise take "count" for an id.
whatsappRouter.get(whatsappRoutes.conversationCount, countWhatsappConversationsController);
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
