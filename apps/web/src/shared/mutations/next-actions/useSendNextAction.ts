import { useMutation } from "@tanstack/react-query";
import type { SendNextActionRequest } from "@vetra/contracts";
import { buildPath, nextActionsRoutes } from "@vetra/routes";
import { isAxiosError } from "axios";
import { toast } from "sonner";

import api from "@/shared/lib/axios/api";
import { useInvalidateNextActions } from "@/shared/mutations/next-actions/useInvalidateNextActions";

const MESSAGES_BY_STATUS: Record<number, string> = {
  409: "Não foi possível enviar: o WhatsApp está desconectado ou esta mensagem já está sendo enviada.",
  422: "Não foi possível enviar: o número não está no WhatsApp, ou a atividade não tem texto.",
  429: "O WhatsApp limitou novas conversas neste número. Aguarde um tempo antes de tentar de novo.",
  503: "O serviço do WhatsApp está indisponível. Verifique se o Docker está rodando.",
};

const messageOf = (error: unknown): string =>
  (isAxiosError(error) && error.response && MESSAGES_BY_STATUS[error.response.status]) ||
  "Não foi possível enviar a mensagem.";

type SendNextActionVariables = { id: string } & SendNextActionRequest;

// A sent message cannot be unsent, so there is no undo here.
export function useSendNextAction() {
  const invalidateNextActions = useInvalidateNextActions();

  return useMutation({
    mutationFn: ({ id, confirmed }: SendNextActionVariables) =>
      api.post(buildPath(nextActionsRoutes.send, { id }), { confirmed }),
    onSuccess: () => {
      toast.success("Mensagem enviada.");
      return invalidateNextActions();
    },
    onError: (error) => {
      toast.error(messageOf(error));
      return invalidateNextActions();
    },
  });
}
