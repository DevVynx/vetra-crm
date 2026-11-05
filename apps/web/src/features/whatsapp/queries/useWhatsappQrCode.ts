import { useQuery } from "@tanstack/react-query";
import type { WhatsappQrCodeResponse } from "@vetra/contracts";
import { whatsappRoutes } from "@vetra/routes";

import api from "@/shared/lib/axios/api";
import { whatsappQueryKeys } from "@/shared/queries/whatsapp/keys";

const QR_CODE_POLL_INTERVAL_MS = 5_000;

// WAHA issues a new code about every 20 seconds, and an expired one must not linger in the cache.
export function useWhatsappQrCode() {
  return useQuery({
    queryKey: whatsappQueryKeys.qrCode,
    queryFn: async () => (await api.get<WhatsappQrCodeResponse>(whatsappRoutes.qrCode)).data,
    refetchInterval: QR_CODE_POLL_INTERVAL_MS,
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });
}
