import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { buildPath, leadsRoutes } from "@vetra/routes";
import { toast } from "sonner";

import api from "@/shared/lib/axios/api";
import { useInvalidateAfterLeadChange } from "@/shared/mutations/leads/useInvalidateAfterLeadChange";
import { leadsQueryKeys } from "@/shared/queries/leads/keys";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";

export function useDeleteLead(leadId: string) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const invalidate = useInvalidateAfterLeadChange();

  return useMutation({
    mutationFn: () => api.delete(buildPath(leadsRoutes.byId, { id: leadId })),
    onSuccess: async () => {
      // Drop the detail first: refetching a deleted lead would flash "not found".
      queryClient.removeQueries({ queryKey: leadsQueryKeys.detail(leadId) });
      await navigate({ to: "/leads" });
      toast.success("Lead excluído com notas e próximas ações.");
      return invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Não foi possível excluir o lead.")),
  });
}
