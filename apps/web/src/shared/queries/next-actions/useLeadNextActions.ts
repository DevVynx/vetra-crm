import { queryOptions, useQuery } from "@tanstack/react-query";
import type { ListNextActionsResponse } from "@vetra/contracts";
import { buildPath, nextActionsRoutes } from "@vetra/routes";

import api from "@/shared/lib/axios/api";
import { leadsQueryKeys } from "@/shared/queries/leads/keys";

export const leadNextActionsQueryOptions = (leadId: string) =>
  queryOptions({
    queryKey: leadsQueryKeys.nextActions(leadId),
    queryFn: async () =>
      (await api.get<ListNextActionsResponse>(buildPath(nextActionsRoutes.byLead, { id: leadId })))
        .data,
  });

export function useLeadNextActions(leadId: string) {
  return useQuery(leadNextActionsQueryOptions(leadId));
}
