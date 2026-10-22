import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { LeadNote } from "@vetra/contracts";
import { toast } from "sonner";

import { leadsMockApi } from "@/shared/mocks/leadsMockApi";
import { leadsQueryKeys } from "@/shared/queries/leads/keys";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";
import { toastWithUndo } from "@/shared/utils/toastWithUndo";

type NoteEdit = { noteId: string; content: string };

export function useUpdateLeadNote(leadId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ noteId, content }: NoteEdit) => leadsMockApi.updateLeadNote(noteId, { content }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: leadsQueryKeys.notes(leadId) }),
    onError: (error) => toast.error(getErrorMessage(error, "Não foi possível salvar a nota.")),
  });

  const saveNote = (note: LeadNote, content: string, onSaved: () => void) =>
    mutation.mutate(
      { noteId: note.id, content },
      {
        onSuccess: () => {
          onSaved();
          toastWithUndo("Nota atualizada.", () =>
            mutation.mutate({ noteId: note.id, content: note.content })
          );
        },
      }
    );

  return { saveNote, isPending: mutation.isPending };
}
