export const whatsappRoutes = {
  status: "/whatsapp/status",
  connect: "/whatsapp/connect",
  qrCode: "/whatsapp/qr",
  disconnect: "/whatsapp/disconnect",
  accountChange: "/whatsapp/account-change",
  events: "/whatsapp/events",
  conversations: "/whatsapp/conversations",
  conversationCount: "/whatsapp/conversations/count",
  conversationById: "/whatsapp/conversations/:id",
  conversationMessages: "/whatsapp/conversations/:id/messages",
  conversationRead: "/whatsapp/conversations/:id/read",
} as const;
