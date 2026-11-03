import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateLeadNoteRequest, CreateLeadNoteResponse } from "@vetra/contracts";
import { buildPath, leadNotesRoutes } from "@vetra/routes";

import api from "@/shared/lib/axios/api";
import { leadsQueryKeys } from "@/shared/queries/leads/keys";

export function useCreateLeadNote(leadId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateLeadNoteRequest) =>
      (
        await api.post<CreateLeadNoteResponse>(
          buildPath(leadNotesRoutes.byLead, { id: leadId }),
          request
        )
      ).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: leadsQueryKeys.notes(leadId) }),
  });
}
