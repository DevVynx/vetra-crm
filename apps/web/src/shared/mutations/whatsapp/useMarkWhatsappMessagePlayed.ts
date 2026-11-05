import { useMutation, useQueryClient } from "@tanstack/react-query";
import { buildPath, whatsappRoutes } from "@vetra/routes";

import api from "@/shared/lib/axios/api";
import { whatsappQueryKeys } from "@/shared/queries/whatsapp/keys";

// A failure here only leaves the microphone gray: nothing is worth interrupting the audio for.
export function useMarkWhatsappMessagePlayed(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) =>
      api.post(
        buildPath(whatsappRoutes.conversationMessagePlayed, { id: conversationId, messageId })
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: whatsappQueryKeys.all }),
  });
}
