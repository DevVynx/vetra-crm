import { z } from "zod";

import { whatsappConversationSchema } from "./conversations";

export const listAwaitingConversationsResponseSchema = z.object({
  conversations: z.array(whatsappConversationSchema),
});
export type ListAwaitingConversationsResponse = z.infer<
  typeof listAwaitingConversationsResponseSchema
>;
