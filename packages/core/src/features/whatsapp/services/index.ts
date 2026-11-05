import {
  addWhatsappChangeListener,
  removeWhatsappChangeListener,
} from "../helpers/whatsappChanges";
import { connectWhatsapp } from "./connectWhatsapp";
import { countWhatsappConversations } from "./countWhatsappConversations";
import { deleteWhatsappConversations } from "./deleteWhatsappConversations";
import { disconnectWhatsapp } from "./disconnectWhatsapp";
import { getWhatsappQrCode } from "./getWhatsappQrCode";
import { getWhatsappStatus } from "./getWhatsappStatus";
import { resolveWhatsappAccountChange } from "./resolveWhatsappAccountChange";
import { startWhatsappSync } from "./startWhatsappSync";

export const whatsappServices = {
  addWhatsappChangeListener,
  connectWhatsapp,
  countWhatsappConversations,
  deleteWhatsappConversations,
  disconnectWhatsapp,
  getWhatsappQrCode,
  getWhatsappStatus,
  removeWhatsappChangeListener,
  resolveWhatsappAccountChange,
  startWhatsappSync,
};
