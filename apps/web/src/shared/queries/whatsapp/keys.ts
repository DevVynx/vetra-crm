export const whatsappQueryKeys = {
  all: ["whatsapp"] as const,
  status: ["whatsapp", "status"] as const,
  qrCode: ["whatsapp", "qr-code"] as const,
  conversationCount: ["whatsapp", "conversations", "count"] as const,
  conversationList: (q: string) => ["whatsapp", "conversations", "list", q] as const,
  conversation: (id: string) => ["whatsapp", "conversations", "detail", id] as const,
  messages: (id: string) => ["whatsapp", "conversations", "messages", id] as const,
};
