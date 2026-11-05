import { useMutation, useQueryClient } from "@tanstack/react-query";
import { whatsappRoutes } from "@vetra/routes";
import { toast } from "sonner";

import api from "@/shared/lib/axios/api";
import { whatsappQueryKeys } from "@/shared/queries/whatsapp/keys";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";

export function useDeleteWhatsappConversations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.delete(whatsappRoutes.conversations),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: whatsappQueryKeys.all });
      toast.success("Conversas apagadas do Vetra.");
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Não foi possível apagar as conversas.")),
  });
}
