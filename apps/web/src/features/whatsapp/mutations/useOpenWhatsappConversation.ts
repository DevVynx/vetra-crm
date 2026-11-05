import { useMutation } from "@tanstack/react-query";
import type {
  OpenWhatsappConversationRequest,
  WhatsappConversationResponse,
} from "@vetra/contracts";
import { whatsappRoutes } from "@vetra/routes";

import api from "@/shared/lib/axios/api";

export function useOpenWhatsappConversation() {
  return useMutation({
    mutationFn: async (request: OpenWhatsappConversationRequest) =>
      (await api.post<WhatsappConversationResponse>(whatsappRoutes.conversations, request)).data
        .conversation,
  });
}
