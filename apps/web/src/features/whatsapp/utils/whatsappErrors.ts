import { isAxiosError } from "axios";

import { getErrorMessage } from "@/shared/utils/getErrorMessage";

const MESSAGES_BY_STATUS: Record<number, string> = {
  409: "O WhatsApp está desconectado. Conecte de novo para enviar mensagens.",
  422: "Esse número não está no WhatsApp.",
  429: "O WhatsApp limitou novas conversas neste número. Aguarde um tempo antes de tentar de novo.",
  503: "O serviço do WhatsApp está indisponível. Verifique se o Docker está rodando.",
};

export function whatsappErrorMessage(error: unknown, fallback: string): string {
  const status = isAxiosError(error) ? error.response?.status : undefined;
  const hasIssues = isAxiosError<{ issues?: unknown[] }>(error) && error.response?.data?.issues;

  if (!hasIssues && status && MESSAGES_BY_STATUS[status]) return MESSAGES_BY_STATUS[status];

  return getErrorMessage(error, fallback);
}

const ACTION_MESSAGES_BY_STATUS: Record<number, string> = {
  409: "O WhatsApp está desconectado. Conecte de novo para fazer isso.",
  422: "O WhatsApp não permitiu essa ação. Editar e apagar só funcionam por um tempo depois do envio.",
  503: "O serviço do WhatsApp está indisponível. Verifique se o Docker está rodando.",
};

// Here 422 means WhatsApp refused, not that the number is missing as when opening a conversation.
export function whatsappMessageActionErrorMessage(error: unknown, fallback: string): string {
  const status = isAxiosError(error) ? error.response?.status : undefined;
  const hasIssues = isAxiosError<{ issues?: unknown[] }>(error) && error.response?.data?.issues;

  if (!hasIssues && status && ACTION_MESSAGES_BY_STATUS[status]) {
    return ACTION_MESSAGES_BY_STATUS[status];
  }

  return getErrorMessage(error, fallback);
}
