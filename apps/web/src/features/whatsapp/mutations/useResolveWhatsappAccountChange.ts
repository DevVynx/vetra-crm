import { useMutation } from "@tanstack/react-query";
import type { ResolveWhatsappAccountChangeRequest, WhatsappStatusResponse } from "@vetra/contracts";
import { whatsappRoutes } from "@vetra/routes";
import { toast } from "sonner";

import api from "@/shared/lib/axios/api";
import { useQueryUtils } from "@/shared/lib/tanstack/useQueryUtils";
import { whatsappQueryKeys } from "@/shared/queries/whatsapp/keys";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";

export function useResolveWhatsappAccountChange() {
  const statusQuery = useQueryUtils<WhatsappStatusResponse>(whatsappQueryKeys.status);

  return useMutation({
    mutationFn: (request: ResolveWhatsappAccountChangeRequest) =>
      api.post(whatsappRoutes.accountChange, request),
    onSuccess: () => statusQuery.invalidate(),
    onError: (error) => toast.error(getErrorMessage(error, "Não foi possível trocar o número.")),
  });
}
