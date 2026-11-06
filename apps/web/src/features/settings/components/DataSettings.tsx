import type { ImportReport } from "@vetra/contracts";
import { DownloadIcon, UploadIcon } from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { pluralize } from "@/shared/utils/format";

import { useExportData } from "../mutations/useExportData";
import { useImportData } from "../mutations/useImportData";
import { usePreviewDataImport } from "../mutations/usePreviewDataImport";
import { importFileProblem } from "../utils/importMessages";
import { ImportReportView } from "./ImportReportView";
import { SettingsRow } from "./SettingsRow";
import { SettingsSection } from "./SettingsSection";

type PendingImport = { file: File; report: ImportReport };

export function DataSettings() {
  const exportData = useExportData();
  const previewImport = usePreviewDataImport();
  const importData = useImportData();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<PendingImport | null>(null);

  const choose = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const problem = importFileProblem(file);
    if (problem) return void toast.error(problem);

    previewImport.mutate(file, { onSuccess: (report) => setPending({ file, report }) });
  };

  const confirm = () => {
    if (!pending) return;

    importData.mutate(pending.file, { onSuccess: () => setPending(null) });
  };

  const newLeads = pending?.report.leads.new ?? 0;

  return (
    <SettingsSection title="Dados">
      <SettingsRow
        title="Exportar tudo"
        description="Um arquivo .zip com planilhas CSV de leads, clientes, projetos, parcelas, despesas, notas, atividades (pendentes e concluídas) e etapas. Não inclui o WhatsApp."
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
      <SettingsRow
        title="Importar"
        description="O .zip exportado pelo Vetra ou um leads.csv com as mesmas colunas. Antes de gravar, você vê o que vai acontecer. Leads que já existem, pelo telefone, são pulados."
      >
        <input
          ref={inputRef}
          type="file"
          accept=".zip,.csv,application/zip,text/csv"
          aria-label="Arquivo para importar"
          className="sr-only"
          tabIndex={-1}
          onChange={choose}
        />
        <Button
          variant="outline"
          disabled={previewImport.isPending}
          onClick={() => inputRef.current?.click()}
        >
          {previewImport.isPending ? <Spinner /> : <UploadIcon />}
          Importar
        </Button>
      </SettingsRow>
      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => !open && !importData.isPending && setPending(null)}
        title="Importar dados"
        description="Confira o que vai acontecer. Nada foi gravado ainda."
        confirmLabel={`Importar ${pluralize(newLeads, "lead", "leads")}`}
        confirmDisabled={newLeads === 0}
        isPending={importData.isPending}
        ignoreEscape={importData.isPending}
        onConfirm={confirm}
      >
        {pending && <ImportReportView report={pending.report} />}
      </ConfirmDialog>
    </SettingsSection>
  );
}
