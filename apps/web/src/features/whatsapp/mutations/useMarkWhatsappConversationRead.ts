import { useMutation, useQueryClient } from "@tanstack/react-query";
import { buildPath, whatsappRoutes } from "@vetra/routes";

import api from "@/shared/lib/axios/api";
import { whatsappQueryKeys } from "@/shared/queries/whatsapp/keys";

// Silent on purpose: nothing went wrong for the user if it fails, and it retries on the next open.
export function useMarkWhatsappConversationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      api.post(buildPath(whatsappRoutes.conversationRead, { id: conversationId })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: whatsappQueryKeys.all }),
  });
}
