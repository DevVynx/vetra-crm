import { z } from "zod";

import { whatsappConversationSchema } from "./conversations";

export const listAwaitingConversationsResponseSchema = z.object({
  conversations: z.array(whatsappConversationSchema),
  // How many wait in all, since the list is capped.
  total: z.number().int().nonnegative(),
});
export type ListAwaitingConversationsResponse = z.infer<
  typeof listAwaitingConversationsResponseSchema
>;
