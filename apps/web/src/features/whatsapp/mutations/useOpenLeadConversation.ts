import { useMutation } from "@tanstack/react-query";
import type { WhatsappConversationResponse } from "@vetra/contracts";
import { buildPath, whatsappRoutes } from "@vetra/routes";

import api from "@/shared/lib/axios/api";

export function useOpenLeadConversation() {
  return useMutation({
    mutationFn: async (leadId: string) =>
      (
        await api.post<WhatsappConversationResponse>(
          buildPath(whatsappRoutes.leadConversation, { id: leadId })
        )
      ).data.conversation,
  });
}
