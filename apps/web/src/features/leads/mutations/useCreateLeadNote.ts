import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateLeadNoteRequest } from "@vetra/contracts";

import { leadsMockApi } from "@/shared/mocks/leadsMockApi";
import { leadsQueryKeys } from "@/shared/queries/leads/keys";

export function useCreateLeadNote(leadId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateLeadNoteRequest) => leadsMockApi.createLeadNote(leadId, request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: leadsQueryKeys.notes(leadId) }),
  });
}
