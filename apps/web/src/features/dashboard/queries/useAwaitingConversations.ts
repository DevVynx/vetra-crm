import { useQuery } from "@tanstack/react-query";
import type { ListAwaitingConversationsResponse } from "@vetra/contracts";
import { whatsappRoutes } from "@vetra/routes";

import api from "@/shared/lib/axios/api";
import { whatsappQueryKeys } from "@/shared/queries/whatsapp/keys";

export function useAwaitingConversations() {
  return useQuery({
    queryKey: whatsappQueryKeys.awaiting,
    queryFn: async () =>
      (await api.get<ListAwaitingConversationsResponse>(whatsappRoutes.conversationsAwaiting)).data,
  });
}
