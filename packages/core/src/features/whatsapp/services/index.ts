import {
  addWhatsappChangeListener,
  removeWhatsappChangeListener,
} from "../helpers/whatsappChanges";
import { connectWhatsapp } from "./connectWhatsapp";
import { countWhatsappConversations } from "./countWhatsappConversations";
import { deleteWhatsappConversations } from "./deleteWhatsappConversations";
import { deleteWhatsappMessages } from "./deleteWhatsappMessages";
import { disconnectWhatsapp } from "./disconnectWhatsapp";
import { editWhatsappMessage } from "./editWhatsappMessage";
import { getLeadConversation } from "./getLeadConversation";
import { getWhatsappConversation } from "./getWhatsappConversation";
import { getWhatsappMessageMedia } from "./getWhatsappMessageMedia";
import { getWhatsappQrCode } from "./getWhatsappQrCode";
import { getWhatsappStatus } from "./getWhatsappStatus";
import { listAwaitingWhatsappConversations } from "./listAwaitingWhatsappConversations";
import { listWhatsappConversations } from "./listWhatsappConversations";
import { listWhatsappMessages } from "./listWhatsappMessages";
import { markWhatsappConversationRead } from "./markWhatsappConversationRead";
import { markWhatsappMessagePlayed } from "./markWhatsappMessagePlayed";
import { openLeadConversation } from "./openLeadConversation";
import { openWhatsappConversation } from "./openWhatsappConversation";
import { resolveWhatsappAccountChange } from "./resolveWhatsappAccountChange";
import { sendWhatsappMedia } from "./sendWhatsappMedia";
import { sendWhatsappMessage } from "./sendWhatsappMessage";
import { startWhatsappSync } from "./startWhatsappSync";

export const whatsappServices = {
  addWhatsappChangeListener,
  connectWhatsapp,
  countWhatsappConversations,
  deleteWhatsappConversations,
  deleteWhatsappMessages,
  disconnectWhatsapp,
  editWhatsappMessage,
  getLeadConversation,
  getWhatsappConversation,
  getWhatsappMessageMedia,
  getWhatsappQrCode,
  getWhatsappStatus,
  listAwaitingWhatsappConversations,
  listWhatsappConversations,
  listWhatsappMessages,
  markWhatsappConversationRead,
  markWhatsappMessagePlayed,
  openLeadConversation,
  openWhatsappConversation,
  removeWhatsappChangeListener,
  resolveWhatsappAccountChange,
  sendWhatsappMedia,
  sendWhatsappMessage,
  startWhatsappSync,
};
