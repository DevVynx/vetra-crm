import type { ImportCounts, ImportReport } from "@vetra/contracts";

import { errorText } from "../utils/importMessages";

type Kind = { label: string; counts: ImportCounts };

function countsText({ new: created, skipped, invalid }: ImportCounts): string {
  return [
    `${created} ${created === 1 ? "novo" : "novos"}`,
    skipped > 0 ? `${skipped} ${skipped === 1 ? "pulado" : "pulados"}` : null,
    invalid > 0 ? `${invalid} com erro` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

const REASONS = { exists: "já existe no Vetra", repeated: "repetido no arquivo" } as const;

// What the file holds and what would happen with it, before anything is written.
export function ImportReportView({ report }: { report: ImportReport }) {
  const kinds: Kind[] = [
    { label: "Leads", counts: report.leads },
    { label: "Projetos", counts: report.projects },
    { label: "Parcelas", counts: report.installments },
    { label: "Despesas", counts: report.expenses },
    { label: "Notas", counts: report.notes },
    { label: "Atividades", counts: report.activities },
    { label: "Atividades concluídas", counts: report.completedActivities },
  ].filter(({ counts }) => counts.new + counts.skipped + counts.invalid > 0);

  const hasDetails = report.errors.length > 0 || report.skippedLeads.length > 0;

  return (
    <div className="flex flex-col gap-3 text-sm">
      {kinds.length === 0 ? (
        <p className="text-muted-foreground">O arquivo não tem nenhum registro.</p>
      ) : (
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
          {kinds.map(({ label, counts }) => (
            <div key={label} className="contents">
              <dt className="font-medium">{label}</dt>
              <dd className="text-muted-foreground">{countsText(counts)}</dd>
            </div>
          ))}
        </dl>
      )}
      {report.leads.new === 0 && (
        <p className="text-muted-foreground">Não há leads novos para importar.</p>
      )}
      {hasDetails && (
        <div className="bg-muted/50 flex max-h-56 flex-col gap-3 overflow-y-auto rounded-lg p-3 text-xs">
          {report.errors.length > 0 && (
            <section className="flex flex-col gap-1">
              <h3 className="font-medium">Linhas que ficam de fora, com erro</h3>
              <ul className="text-muted-foreground flex flex-col gap-0.5">
                {report.errors.map((error, index) => (
                  <li key={index}>{errorText(error)}</li>
                ))}
                {report.hiddenErrors > 0 && <li>e mais {report.hiddenErrors}</li>}
              </ul>
            </section>
          )}
          {report.skippedLeads.length > 0 && (
            <section className="flex flex-col gap-1">
              <h3 className="font-medium">Leads pulados</h3>
              <ul className="text-muted-foreground flex flex-col gap-0.5">
                {report.skippedLeads.map((lead, index) => (
                  <li key={index}>
                    linha {lead.line} · {lead.name}: {REASONS[lead.reason]}
                  </li>
                ))}
                {report.hiddenSkippedLeads > 0 && <li>e mais {report.hiddenSkippedLeads}</li>}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
