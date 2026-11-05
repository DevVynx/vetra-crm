import {
  addWhatsappChangeListener,
  removeWhatsappChangeListener,
} from "../helpers/whatsappChanges";
import { connectWhatsapp } from "./connectWhatsapp";
import { countWhatsappConversations } from "./countWhatsappConversations";
import { deleteWhatsappConversations } from "./deleteWhatsappConversations";
import { disconnectWhatsapp } from "./disconnectWhatsapp";
import { getWhatsappConversation } from "./getWhatsappConversation";
import { getWhatsappQrCode } from "./getWhatsappQrCode";
import { getWhatsappStatus } from "./getWhatsappStatus";
import { listWhatsappConversations } from "./listWhatsappConversations";
import { listWhatsappMessages } from "./listWhatsappMessages";
import { markWhatsappConversationRead } from "./markWhatsappConversationRead";
import { openWhatsappConversation } from "./openWhatsappConversation";
import { resolveWhatsappAccountChange } from "./resolveWhatsappAccountChange";
import { sendWhatsappMessage } from "./sendWhatsappMessage";
import { startWhatsappSync } from "./startWhatsappSync";

export const whatsappServices = {
  addWhatsappChangeListener,
  connectWhatsapp,
  countWhatsappConversations,
  deleteWhatsappConversations,
  disconnectWhatsapp,
  getWhatsappConversation,
  getWhatsappQrCode,
  getWhatsappStatus,
  listWhatsappConversations,
  listWhatsappMessages,
  markWhatsappConversationRead,
  openWhatsappConversation,
  removeWhatsappChangeListener,
  resolveWhatsappAccountChange,
  sendWhatsappMessage,
  startWhatsappSync,
};
