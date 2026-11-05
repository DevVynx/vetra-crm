import { whatsappRoutes } from "@vetra/routes";
import { Router } from "express";

import {
  connectWhatsappController,
  disconnectWhatsappController,
  getWhatsappQrCodeController,
  getWhatsappStatusController,
} from "./controllers";

export const whatsappRouter: Router = Router();

whatsappRouter.get(whatsappRoutes.status, getWhatsappStatusController);
whatsappRouter.post(whatsappRoutes.connect, connectWhatsappController);
whatsappRouter.get(whatsappRoutes.qrCode, getWhatsappQrCodeController);
whatsappRouter.post(whatsappRoutes.disconnect, disconnectWhatsappController);
