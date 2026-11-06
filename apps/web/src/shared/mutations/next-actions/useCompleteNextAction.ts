import { useMutation } from "@tanstack/react-query";
import { buildPath, nextActionsRoutes } from "@vetra/routes";
import { toast } from "sonner";

import api from "@/shared/lib/axios/api";
import { useInvalidateNextActions } from "@/shared/mutations/next-actions/useInvalidateNextActions";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";
import { toastWithUndo } from "@/shared/utils/toastWithUndo";

export function useCompleteNextAction() {
  const invalidateNextActions = useInvalidateNextActions();

  const reopen = useMutation({
    mutationFn: (id: string) => api.post(buildPath(nextActionsRoutes.reopen, { id })),
    onSuccess: invalidateNextActions,
    onError: (error) =>
      toast.error(getErrorMessage(error, "Não foi possível desfazer a conclusão.")),
  });

  return useMutation({
    mutationFn: (id: string) => api.post(buildPath(nextActionsRoutes.complete, { id })),
    onSuccess: (_, id) => {
      toastWithUndo("Atividade concluída.", () => reopen.mutate(id));
      return invalidateNextActions();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Não foi possível concluir a atividade.")),
  });
}
