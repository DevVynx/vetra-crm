import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ImportDataResponse } from "@vetra/contracts";
import { dataRoutes } from "@vetra/routes";
import { toast } from "sonner";

import api from "@/shared/lib/axios/api";
import { pluralize } from "@/shared/utils/format";

import { IMPORT_FILE_ERROR } from "../utils/importMessages";

export function useImportData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) =>
      (
        await api.post<ImportDataResponse>(dataRoutes.import, file, {
          headers: { "Content-Type": "application/octet-stream" },
        })
      ).data,
    onSuccess: (report) => {
      toast.success(
        `Importação concluída: ${pluralize(report.leads.new, "lead novo", "leads novos")}.`
      );
      return queryClient.invalidateQueries();
    },
    onError: () => toast.error(IMPORT_FILE_ERROR),
  });
}
