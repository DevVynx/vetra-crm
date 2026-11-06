import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SetAutomationLeadsRequest, SetAutomationLeadsResponse } from "@vetra/contracts";
import { automationsRoutes } from "@vetra/routes";
import { toast } from "sonner";

import api from "@/shared/lib/axios/api";
import { pluralize } from "@/shared/utils/format";

// Turns the automatic sending on or off for every lead at once. Every lead can change on screen, so
// everything is read again.
export function useSetAutomationLeads() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: SetAutomationLeadsRequest) =>
      (await api.patch<SetAutomationLeadsResponse>(automationsRoutes.leads, request)).data,
    onSuccess: ({ changed }, { autoSend }) => {
      toast.success(
        `Envio automático ${autoSend ? "ligado" : "desligado"} em ${pluralize(changed, "lead", "leads")}.`
      );
      return queryClient.invalidateQueries();
    },
    onError: () => toast.error("Não foi possível alterar o envio automático dos leads."),
  });
}
