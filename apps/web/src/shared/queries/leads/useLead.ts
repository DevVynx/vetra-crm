import { queryOptions, useQuery } from "@tanstack/react-query";
import type { GetLeadResponse } from "@vetra/contracts";
import { buildPath, leadsRoutes } from "@vetra/routes";

import api from "@/shared/lib/axios/api";
import { leadsQueryKeys } from "@/shared/queries/leads/keys";

export const leadQueryOptions = (leadId: string) =>
  queryOptions({
    queryKey: leadsQueryKeys.detail(leadId),
    queryFn: async () =>
      (await api.get<GetLeadResponse>(buildPath(leadsRoutes.byId, { id: leadId }))).data,
    // A missing lead will not appear by retrying.
    retry: false,
  });

export function useLead(leadId: string, { enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({ ...leadQueryOptions(leadId), enabled });
}
