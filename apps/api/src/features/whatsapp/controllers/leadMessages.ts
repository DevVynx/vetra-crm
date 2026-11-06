import { type LeadMessagesResponse, leadMessagesResponseSchema } from "@vetra/contracts";
import { whatsappServices } from "@vetra/core";
import type { Response } from "express";

import type { ValidatedRequest } from "@/shared/http/validation";

import type v from "../validators";

// For the prospecting pipeline: one lead's messages with only what it needs, see PIPELINE-INTEGRATION.md.
export async function getLeadMessagesController(
  req: ValidatedRequest<typeof v.leadMessages>,
  res: Response<LeadMessagesResponse>
) {
  const found = await whatsappServices.getLeadMessages(req.params.id, req.query.limit);

  res.json(
    leadMessagesResponseSchema.parse({
      hasConversation: found !== null,
      hasMore: found?.hasMore ?? false,
      messages: (found?.messages ?? []).map((message) => ({
        direction: message.direction,
        type: message.type,
        text: message.deletedAt ? null : message.content,
        isDeleted: message.deletedAt !== null,
        sentAt: message.sentAt.toISOString(),
      })),
    })
  );
}
