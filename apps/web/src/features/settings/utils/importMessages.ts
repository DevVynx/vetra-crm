import { DATA_IMPORT_MAX_BYTES, type ImportError } from "@vetra/contracts";

const PROBLEMS: Record<string, string> = {
  required: "campo obrigatório",
  too_long: "texto grande demais",
  invalid_date: "data inválida",
  invalid_money: "valor inválido",
  invalid_value: "valor inválido",
  invalid_phone: "telefone inválido",
  invalid_email: "e-mail inválido",
  invalid_url: "link inválido (use http ou https)",
  unknown_stage: "etapa que não existe no Vetra",
  inconsistent_customer:
    "cliente e etapa não combinam: só quem está na etapa de fechamento é cliente",
  duplicated_id: "id repetido no arquivo",
  unknown_lead: "lead que não está no leads.csv",
  unknown_project: "projeto que não está no projetos.csv",
  unimported_project: "projeto que ficou de fora por erro",
  missing_column: "coluna não encontrada",
  missing_file: "arquivo leads.csv não encontrado",
  too_many_rows: "mais de 20.000 linhas",
};

export const problemText = (code: string) => PROBLEMS[code] ?? "problema na linha";

export function errorText({ file, line, column, code }: ImportError): string {
  const place = [file, line > 0 ? `linha ${line}` : null, column].filter(Boolean).join(" · ");

  return `${place}: ${problemText(code)}`;
}

const MAX_MEGABYTES = DATA_IMPORT_MAX_BYTES / (1024 * 1024);

// What can be told from the name and the size, before the file is sent. The API checks it all
// again: this only saves the trip, and the wait, for a file that can't be the right one.
export function importFileProblem(file: File): string | null {
  if (!/.(zip|csv)$/i.test(file.name)) return "Escolha um arquivo .zip ou .csv.";
  if (file.size === 0) return "O arquivo está vazio.";
  if (file.size > DATA_IMPORT_MAX_BYTES) return `O arquivo passa do limite de ${MAX_MEGABYTES} MB.`;

  return null;
}

export const IMPORT_FILE_ERROR =
  "Não consegui ler esse arquivo. Use o .zip exportado pelo Vetra ou um leads.csv, de até 10 MB.";
