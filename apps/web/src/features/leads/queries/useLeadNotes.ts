import { queryOptions, useQuery } from "@tanstack/react-query";

import { leadsMockApi } from "@/shared/mocks/leadsMockApi";
import { leadsQueryKeys } from "@/shared/queries/leads/keys";

export const leadNotesQueryOptions = (leadId: string) =>
  queryOptions({
    queryKey: leadsQueryKeys.notes(leadId),
    queryFn: () => leadsMockApi.listLeadNotes(leadId),
  });

export function useLeadNotes(leadId: string) {
  return useQuery(leadNotesQueryOptions(leadId));
}
