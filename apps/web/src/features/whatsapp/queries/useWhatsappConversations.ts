import { useInfiniteQuery } from "@tanstack/react-query";
import type { ListWhatsappConversationsResponse } from "@vetra/contracts";
import { WHATSAPP_CONVERSATIONS_PAGE_SIZE } from "@vetra/contracts";
import { whatsappRoutes } from "@vetra/routes";

import api from "@/shared/lib/axios/api";
import { whatsappQueryKeys } from "@/shared/queries/whatsapp/keys";

// SSE brings changes right away; this is only the safety net if a signal gets lost.
const SAFETY_REFETCH_MS = 30_000;

export function useWhatsappConversations(q: string) {
  return useInfiniteQuery({
    queryKey: whatsappQueryKeys.conversationList(q),
    queryFn: async ({ pageParam }) =>
      (
        await api.get<ListWhatsappConversationsResponse>(whatsappRoutes.conversations, {
          params: {
            q: q || undefined,
            page: pageParam,
            pageSize: WHATSAPP_CONVERSATIONS_PAGE_SIZE,
          },
        })
      ).data,
    initialPageParam: 1,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.hasMore ? lastPageParam + 1 : undefined,
    refetchInterval: SAFETY_REFETCH_MS,
  });
}
