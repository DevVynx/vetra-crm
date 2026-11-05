import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { EditWhatsappMessageRequest } from "@vetra/contracts";
import { buildPath, whatsappRoutes } from "@vetra/routes";
import { toast } from "sonner";

import api from "@/shared/lib/axios/api";
import { whatsappQueryKeys } from "@/shared/queries/whatsapp/keys";

import { whatsappMessageActionErrorMessage } from "../utils/whatsappErrors";

type EditWhatsappMessageInput = EditWhatsappMessageRequest & { messageId: string };

export function useEditWhatsappMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, ...request }: EditWhatsappMessageInput) =>
      api.patch(
        buildPath(whatsappRoutes.conversationMessageById, { id: conversationId, messageId }),
        request
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: whatsappQueryKeys.all }),
    onError: (error) =>
      toast.error(whatsappMessageActionErrorMessage(error, "Não foi possível editar a mensagem.")),
  });
}
