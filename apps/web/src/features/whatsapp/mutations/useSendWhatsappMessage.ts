import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SendWhatsappMessageRequest } from "@vetra/contracts";
import { buildPath, whatsappRoutes } from "@vetra/routes";
import { toast } from "sonner";

import api from "@/shared/lib/axios/api";
import { whatsappQueryKeys } from "@/shared/queries/whatsapp/keys";

import { whatsappErrorMessage } from "../utils/whatsappErrors";

export function useSendWhatsappMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SendWhatsappMessageRequest) =>
      api.post(buildPath(whatsappRoutes.conversationMessages, { id: conversationId }), request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: whatsappQueryKeys.all }),
    onError: (error) =>
      toast.error(whatsappErrorMessage(error, "Não foi possível enviar a mensagem.")),
  });
}
