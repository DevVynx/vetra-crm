import { useQuery } from "@tanstack/react-query";
import type { WhatsappConversationCountResponse } from "@vetra/contracts";
import { whatsappRoutes } from "@vetra/routes";

import api from "@/shared/lib/axios/api";
import { whatsappQueryKeys } from "@/shared/queries/whatsapp/keys";

export function useWhatsappConversationCount() {
  return useQuery({
    queryKey: whatsappQueryKeys.conversationCount,
    queryFn: async () =>
      (await api.get<WhatsappConversationCountResponse>(whatsappRoutes.conversationCount)).data,
  });
}
