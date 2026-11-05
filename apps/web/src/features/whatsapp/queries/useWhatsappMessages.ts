import { useInfiniteQuery } from "@tanstack/react-query";
import type { ListWhatsappMessagesResponse } from "@vetra/contracts";
import { buildPath, whatsappRoutes } from "@vetra/routes";

import api from "@/shared/lib/axios/api";
import { whatsappQueryKeys } from "@/shared/queries/whatsapp/keys";

// SSE brings changes right away; this is only the safety net if a signal gets lost.
const SAFETY_REFETCH_MS = 30_000;

export function useWhatsappMessages(conversationId: string) {
  return useInfiniteQuery({
    queryKey: whatsappQueryKeys.messages(conversationId),
    queryFn: async ({ pageParam }) =>
      (
        await api.get<ListWhatsappMessagesResponse>(
          buildPath(whatsappRoutes.conversationMessages, { id: conversationId }),
          { params: { before: pageParam } }
        )
      ).data,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.messages.at(-1)?.id : undefined),
    refetchInterval: SAFETY_REFETCH_MS,
  });
}
