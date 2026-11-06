import { useMutation } from "@tanstack/react-query";
import { dataRoutes } from "@vetra/routes";
import { toast } from "sonner";

import api from "@/shared/lib/axios/api";

function saveAsFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function useExportData() {
  return useMutation({
    mutationFn: async () => (await api.get<Blob>(dataRoutes.export, { responseType: "blob" })).data,
    onSuccess: (zip) => {
      const today = new Intl.DateTimeFormat("en-CA").format(new Date());
      saveAsFile(zip, `vetra-dados-${today}.zip`);
    },
    onError: () => toast.error("Não foi possível exportar os dados."),
  });
}
