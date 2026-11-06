import { DownloadIcon } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";

import { useExportData } from "../mutations/useExportData";
import { SettingsRow } from "./SettingsRow";
import { SettingsSection } from "./SettingsSection";

export function DataSettings() {
  const exportData = useExportData();

  return (
    <SettingsSection title="Dados">
      <SettingsRow
        title="Exportar tudo"
        description="Um arquivo .zip com planilhas CSV de leads, clientes, projetos, parcelas, despesas, notas, atividades e etapas. Não inclui o WhatsApp."
      >
        <Button
          variant="outline"
          disabled={exportData.isPending}
          onClick={() => exportData.mutate()}
        >
          {exportData.isPending ? <Spinner /> : <DownloadIcon />}
          Exportar
        </Button>
      </SettingsRow>
    </SettingsSection>
  );
}
