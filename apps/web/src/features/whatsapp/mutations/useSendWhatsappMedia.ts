import { useMutation, useQueryClient } from "@tanstack/react-query";
import { buildPath, whatsappRoutes } from "@vetra/routes";
import { toast } from "sonner";

import api from "@/shared/lib/axios/api";
import { whatsappQueryKeys } from "@/shared/queries/whatsapp/keys";

import { whatsappSendFileErrorMessage } from "../utils/whatsappErrors";

type SendWhatsappMediaInput = {
  file: File;
  caption: string;
};

export function useSendWhatsappMedia(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    // The type travels in the address and the body is always plain bytes, so the API's JSON parser
    // never reads a JSON file.
    mutationFn: ({ file, caption }: SendWhatsappMediaInput) =>
      api.post(buildPath(whatsappRoutes.conversationMessagesMedia, { id: conversationId }), file, {
        headers: { "Content-Type": "application/octet-stream" },
        params: {
          filename: file.name,
          mimetype: file.type || undefined,
          caption: caption.trim() || undefined,
        },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: whatsappQueryKeys.all }),
    onError: (error) => toast.error(whatsappSendFileErrorMessage(error)),
  });
}
