import { whatsappRoutes } from "@vetra/routes";
import { Router } from "express";

import {
  connectWhatsappController,
  countWhatsappConversationsController,
  deleteWhatsappConversationsController,
  disconnectWhatsappController,
  getWhatsappQrCodeController,
  getWhatsappStatusController,
  resolveWhatsappAccountChangeController,
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
whatsappRouter.get(whatsappRoutes.conversationCount, countWhatsappConversationsController);
whatsappRouter.delete(whatsappRoutes.conversations, deleteWhatsappConversationsController);
