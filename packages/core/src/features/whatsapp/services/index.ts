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
import { endWhatsappConversation } from "./endWhatsappConversation";
import { getLeadConversation } from "./getLeadConversation";
import { getLeadMessages } from "./getLeadMessages";
import { getWhatsappConversation } from "./getWhatsappConversation";
import { getWhatsappMessageMedia } from "./getWhatsappMessageMedia";
import { getWhatsappQrCode } from "./getWhatsappQrCode";
import { getWhatsappStatus } from "./getWhatsappStatus";
import { isWhatsappConnected } from "./isWhatsappConnected";
import { listAwaitingWhatsappConversations } from "./listAwaitingWhatsappConversations";
import { listWhatsappConversations } from "./listWhatsappConversations";
import { listWhatsappMessages } from "./listWhatsappMessages";
import { markWhatsappConversationRead } from "./markWhatsappConversationRead";
import { markWhatsappMessagePlayed } from "./markWhatsappMessagePlayed";
import { openLeadConversation } from "./openLeadConversation";
import { openWhatsappConversation } from "./openWhatsappConversation";
import { reopenWhatsappConversation } from "./reopenWhatsappConversation";
import { resolveWhatsappAccountChange } from "./resolveWhatsappAccountChange";
import { sendWhatsappMedia } from "./sendWhatsappMedia";
import { sendWhatsappMessage } from "./sendWhatsappMessage";
import { sendWhatsappVoice } from "./sendWhatsappVoice";
import { startWhatsappSync } from "./startWhatsappSync";

export const whatsappServices = {
  addWhatsappChangeListener,
  connectWhatsapp,
  countWhatsappConversations,
  deleteWhatsappConversations,
  deleteWhatsappMessages,
  disconnectWhatsapp,
  editWhatsappMessage,
  endWhatsappConversation,
  getLeadConversation,
  getLeadMessages,
  getWhatsappConversation,
  getWhatsappMessageMedia,
  getWhatsappQrCode,
  getWhatsappStatus,
  isWhatsappConnected,
  listAwaitingWhatsappConversations,
  listWhatsappConversations,
  listWhatsappMessages,
  markWhatsappConversationRead,
  markWhatsappMessagePlayed,
  openLeadConversation,
  openWhatsappConversation,
  removeWhatsappChangeListener,
  reopenWhatsappConversation,
  resolveWhatsappAccountChange,
  sendWhatsappMedia,
  sendWhatsappMessage,
  sendWhatsappVoice,
  startWhatsappSync,
};
