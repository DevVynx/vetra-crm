import { useMutation, useQueryClient } from "@tanstack/react-query";
import { buildPath, whatsappRoutes } from "@vetra/routes";
import { toast } from "sonner";

import api from "@/shared/lib/axios/api";
import { whatsappQueryKeys } from "@/shared/queries/whatsapp/keys";

import { whatsappSendVoiceErrorMessage } from "../utils/whatsappErrors";

type SendWhatsappVoiceInput = {
  blob: Blob;
  seconds: number;
  replyTo: string | undefined;
};

// The recorder's type carries parameters ("audio/webm;codecs=opus"); the API takes only the type.
const mimetypeOf = (blob: Blob) => blob.type.split(";")[0] || undefined;

export function useSendWhatsappVoice(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ blob, seconds, replyTo }: SendWhatsappVoiceInput) =>
      api.post(buildPath(whatsappRoutes.conversationMessagesVoice, { id: conversationId }), blob, {
        headers: { "Content-Type": "application/octet-stream" },
        params: { mimetype: mimetypeOf(blob), seconds, replyTo },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: whatsappQueryKeys.all }),
    onError: (error) => toast.error(whatsappSendVoiceErrorMessage(error)),
  });
}
