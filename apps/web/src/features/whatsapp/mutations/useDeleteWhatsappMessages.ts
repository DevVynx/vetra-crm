import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { DeleteWhatsappMessagesRequest } from "@vetra/contracts";
import { buildPath, whatsappRoutes } from "@vetra/routes";
import { toast } from "sonner";

import api from "@/shared/lib/axios/api";
import { whatsappQueryKeys } from "@/shared/queries/whatsapp/keys";

import { whatsappMessageActionErrorMessage } from "../utils/whatsappErrors";

export function useDeleteWhatsappMessages(conversationId: string) {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: whatsappQueryKeys.all });

  return useMutation({
    mutationFn: (request: DeleteWhatsappMessagesRequest) =>
      api.post(
        buildPath(whatsappRoutes.conversationMessageDelete, { id: conversationId }),
        request
      ),
    onSuccess: refresh,
    // Some may have been deleted before the one that failed.
    onError: (error) => {
      toast.error(whatsappMessageActionErrorMessage(error, "Não foi possível apagar a mensagem."));
      return refresh();
    },
  });
}
