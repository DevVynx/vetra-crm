import { useQuery } from "@tanstack/react-query";
import type { WhatsappConversationResponse } from "@vetra/contracts";
import { buildPath, whatsappRoutes } from "@vetra/routes";

import api from "@/shared/lib/axios/api";
import { whatsappQueryKeys } from "@/shared/queries/whatsapp/keys";

export function useWhatsappConversation(id: string) {
  return useQuery({
    queryKey: whatsappQueryKeys.conversation(id),
    queryFn: async () =>
      (
        await api.get<WhatsappConversationResponse>(
          buildPath(whatsappRoutes.conversationById, { id })
        )
      ).data.conversation,
    retry: false,
  });
}
