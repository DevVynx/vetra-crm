import { queryOptions, useQuery } from "@tanstack/react-query";
import type { ListLeadNotesResponse } from "@vetra/contracts";
import { buildPath, leadNotesRoutes } from "@vetra/routes";

import api from "@/shared/lib/axios/api";
import { leadsQueryKeys } from "@/shared/queries/leads/keys";

export const leadNotesQueryOptions = (leadId: string) =>
  queryOptions({
    queryKey: leadsQueryKeys.notes(leadId),
    queryFn: async () =>
      (await api.get<ListLeadNotesResponse>(buildPath(leadNotesRoutes.byLead, { id: leadId })))
        .data,
  });

export function useLeadNotes(leadId: string) {
  return useQuery(leadNotesQueryOptions(leadId));
}
