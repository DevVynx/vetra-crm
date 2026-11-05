import { queryOptions, useQuery } from "@tanstack/react-query";
import type { WhatsappStatusResponse } from "@vetra/contracts";
import { whatsappRoutes } from "@vetra/routes";

import api from "@/shared/lib/axios/api";

import { whatsappQueryKeys } from "./keys";

const STATUS_POLL_INTERVAL_MS = 5_000;

export const whatsappStatusQueryOptions = queryOptions({
  queryKey: whatsappQueryKeys.status,
  queryFn: async () => (await api.get<WhatsappStatusResponse>(whatsappRoutes.status)).data,
  refetchInterval: STATUS_POLL_INTERVAL_MS,
  retry: false,
});

export function useWhatsappStatus() {
  return useQuery(whatsappStatusQueryOptions);
}
