import { useMutation } from "@tanstack/react-query";
import type { WhatsappStatusResponse } from "@vetra/contracts";
import { whatsappRoutes } from "@vetra/routes";
import { toast } from "sonner";

import api from "@/shared/lib/axios/api";
import { useQueryUtils } from "@/shared/lib/tanstack/useQueryUtils";
import { whatsappQueryKeys } from "@/shared/queries/whatsapp/keys";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";

export function useDisconnectWhatsapp() {
  const statusQuery = useQueryUtils<WhatsappStatusResponse>(whatsappQueryKeys.status);

  return useMutation({
    mutationFn: () => api.post(whatsappRoutes.disconnect),
    onSuccess: () => {
      statusQuery.setData({ status: "disconnected", phone: null });
      statusQuery.invalidate();
      toast.success("WhatsApp desconectado.");
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Não foi possível desconectar o WhatsApp.")),
  });
}
