import { useMutation } from "@tanstack/react-query";
import type { PreviewImportResponse } from "@vetra/contracts";
import { dataRoutes } from "@vetra/routes";
import { toast } from "sonner";

import api from "@/shared/lib/axios/api";

import { IMPORT_FILE_ERROR } from "../utils/importMessages";

export function usePreviewDataImport() {
  return useMutation({
    // The file is the body as bytes, like the files sent to WhatsApp (see API-OVERVIEW.md).
    mutationFn: async (file: File) =>
      (
        await api.post<PreviewImportResponse>(dataRoutes.importPreview, file, {
          headers: { "Content-Type": "application/octet-stream" },
        })
      ).data,
    onError: () => toast.error(IMPORT_FILE_ERROR),
  });
}
