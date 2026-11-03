import { useMutation } from "@tanstack/react-query";
import type { CloseLeadRequest, CloseLeadResponse } from "@vetra/contracts";
import { buildPath, customersRoutes } from "@vetra/routes";
import { toast } from "sonner";

import api from "@/shared/lib/axios/api";
import { useInvalidateAfterLeadChange } from "@/shared/mutations/leads/useInvalidateAfterLeadChange";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";

export function useCloseLead(leadId: string, onClosed: () => void) {
  const invalidate = useInvalidateAfterLeadChange();

  return useMutation({
    mutationFn: async (request: CloseLeadRequest) =>
      (
        await api.post<CloseLeadResponse>(
          buildPath(customersRoutes.closeLead, { id: leadId }),
          request
        )
      ).data,
    onSuccess: () => {
      onClosed();
      toast.success("Lead fechado. Agora ele é um cliente.");
      return invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Não foi possível fechar o lead.")),
  });
}
