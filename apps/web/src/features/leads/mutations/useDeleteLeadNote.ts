import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { LeadNote } from "@vetra/contracts";
import { buildPath, leadNotesRoutes } from "@vetra/routes";
import { toast } from "sonner";

import api from "@/shared/lib/axios/api";
import { leadsQueryKeys } from "@/shared/queries/leads/keys";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";
import { toastWithUndo } from "@/shared/utils/toastWithUndo";

export function useDeleteLeadNote(leadId: string) {
  const queryClient = useQueryClient();
  const refreshNotes = () =>
    queryClient.invalidateQueries({ queryKey: leadsQueryKeys.notes(leadId) });

  const restore = useMutation({
    mutationFn: (note: LeadNote) => api.post(leadNotesRoutes.restore, note),
    onSuccess: refreshNotes,
    onError: (error) => toast.error(getErrorMessage(error, "Não foi possível restaurar a nota.")),
  });

  const remove = useMutation({
    mutationFn: (note: LeadNote) => api.delete(buildPath(leadNotesRoutes.byId, { id: note.id })),
    onSuccess: (_, note) => {
      toastWithUndo("Nota excluída.", () => restore.mutate(note));
      return refreshNotes();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Não foi possível excluir a nota.")),
  });

  return remove;
}
