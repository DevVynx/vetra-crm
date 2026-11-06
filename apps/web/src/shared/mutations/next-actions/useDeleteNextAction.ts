import { useMutation } from "@tanstack/react-query";
import type { NextAction, RestoreNextActionRequest } from "@vetra/contracts";
import { buildPath, nextActionsRoutes } from "@vetra/routes";
import { toast } from "sonner";

import api from "@/shared/lib/axios/api";
import { useInvalidateNextActions } from "@/shared/mutations/next-actions/useInvalidateNextActions";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";
import { toastWithUndo } from "@/shared/utils/toastWithUndo";

const toRestoreRequest = (action: NextAction): RestoreNextActionRequest => ({
  id: action.id,
  leadId: action.lead.id,
  type: action.type,
  followUpStep: action.followUpStep,
  description: action.description,
  body: action.body,
  dueAt: action.dueAt,
});

export function useDeleteNextAction() {
  const invalidateNextActions = useInvalidateNextActions();

  const restore = useMutation({
    mutationFn: (action: NextAction) =>
      api.post(nextActionsRoutes.restore, toRestoreRequest(action)),
    onSuccess: invalidateNextActions,
    onError: (error) =>
      toast.error(getErrorMessage(error, "Não foi possível restaurar a atividade.")),
  });

  return useMutation({
    mutationFn: (action: NextAction) =>
      api.delete(buildPath(nextActionsRoutes.byId, { id: action.id })),
    onSuccess: (_, action) => {
      toastWithUndo("Atividade excluída.", () => restore.mutate(action));
      return invalidateNextActions();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Não foi possível excluir a atividade.")),
  });
}
