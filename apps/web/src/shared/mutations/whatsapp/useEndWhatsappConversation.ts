import { useMutation, useQueryClient } from "@tanstack/react-query";
import { buildPath, whatsappRoutes } from "@vetra/routes";
import { toast } from "sonner";

import api from "@/shared/lib/axios/api";
import { whatsappQueryKeys } from "@/shared/queries/whatsapp/keys";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";
import { toastWithUndo } from "@/shared/utils/toastWithUndo";

export function useEndWhatsappConversation() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: whatsappQueryKeys.all });

  const reopen = useMutation({
    mutationFn: (conversationId: string) =>
      api.post(buildPath(whatsappRoutes.conversationReopen, { id: conversationId })),
    onSuccess: refresh,
    onError: (error) =>
      toast.error(getErrorMessage(error, "Não foi possível desfazer o encerramento.")),
  });

  return useMutation({
    mutationFn: (conversationId: string) =>
      api.post(buildPath(whatsappRoutes.conversationEnd, { id: conversationId })),
    onSuccess: (_, conversationId) => {
      void refresh();
      toastWithUndo("Conversa encerrada. Ela volta se a pessoa escrever de novo.", () =>
        reopen.mutate(conversationId)
      );
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Não foi possível encerrar a conversa.")),
  });
}
