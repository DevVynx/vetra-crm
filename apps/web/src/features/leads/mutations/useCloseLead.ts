import { useMutation } from "@tanstack/react-query";
import type { CloseLeadRequest } from "@vetra/contracts";
import { toast } from "sonner";

import { leadsMockApi } from "@/shared/mocks/leadsMockApi";
import { useInvalidateAfterLeadChange } from "@/shared/mutations/leads/useInvalidateAfterLeadChange";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";

export function useCloseLead(leadId: string, onClosed: () => void) {
  const invalidate = useInvalidateAfterLeadChange();

  return useMutation({
    mutationFn: (request: CloseLeadRequest) => leadsMockApi.closeLead(leadId, request),
    onSuccess: () => {
      onClosed();
      toast.success("Lead fechado. Agora ele é um cliente.");
      return invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Não foi possível fechar o lead.")),
  });
}
