import { useMutation } from "@tanstack/react-query";
import { buildPath, whatsappRoutes } from "@vetra/routes";
import { isAxiosError } from "axios";
import { useEffect, useState } from "react";

import api from "@/shared/lib/axios/api";

const MESSAGES_BY_STATUS: Record<number, string> = {
  409: "Conecte o WhatsApp para abrir arquivos.",
  503: "O serviço do WhatsApp está indisponível. Verifique se o Docker está rodando.",
};

// 404, 422 and the rest all mean the same to the person: the file can't be had anymore.
export function mediaErrorMessage(error: unknown): string {
  const status = isAxiosError(error) ? error.response?.status : undefined;

  return (status && MESSAGES_BY_STATUS[status]) || "Este arquivo não está mais disponível.";
}

type UseWhatsappMediaFileInput = {
  conversationId: string;
  messageId: string;
};

// The file is only asked for on request, kept as a temporary address, and let go when the
// message leaves the screen. Nothing is cached or stored.
export function useWhatsappMediaFile({ conversationId, messageId }: UseWhatsappMediaFileInput) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  const request = useMutation({
    mutationFn: async () =>
      (
        await api.get<Blob>(
          buildPath(whatsappRoutes.conversationMessageMedia, { id: conversationId, messageId }),
          { responseType: "blob" }
        )
      ).data,
  });

  useEffect(
    () => () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    },
    [objectUrl]
  );

  const open = (onOpened?: (url: string) => void) =>
    request.mutate(undefined, {
      onSuccess: (blob) => {
        const url = URL.createObjectURL(blob);
        setObjectUrl(url);
        onOpened?.(url);
      },
    });

  return {
    objectUrl,
    open,
    isLoading: request.isPending,
    errorMessage: request.isError ? mediaErrorMessage(request.error) : null,
  };
}
