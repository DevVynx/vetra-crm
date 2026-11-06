import { z } from "zod";

export const updateLeadAutoSendRequestSchema = z.object({ autoSend: z.boolean() });
export type UpdateLeadAutoSendRequest = z.infer<typeof updateLeadAutoSendRequestSchema>;
