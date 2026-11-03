import type { ErrorResponse, ValidationIssue } from "@vetra/contracts";
import { isAxiosError } from "axios";

// The API sends stable codes only (see WEB-VITE-DATA-LAYER.md); this is where they become Portuguese.
const validationMessages: Record<string, (issue: ValidationIssue) => string> = {
  too_small: (issue) =>
    issue.params?.minimum === 1
      ? "Preencha os campos obrigatórios."
      : "Um dos valores está abaixo do mínimo permitido.",
  too_big: () => "Um dos valores passou do limite permitido.",
  invalid_type: () => "Um dos campos está em um formato inválido.",
  invalid_format: () => "Um dos campos está em um formato inválido.",
  invalid_value: () => "Um dos campos tem um valor inválido.",
  invalidTimeZone: () => "Fuso horário inválido.",
  receivedExceedsClosedValue: () => "O valor recebido não pode passar do valor fechado.",
  firstInstallmentDueAtRequired: () => "Informe o vencimento da primeira parcela.",
};

function translateIssues(issues: ValidationIssue[]): string | undefined {
  const messages = issues.map((issue) => validationMessages[issue.code]?.(issue));
  if (messages.some((message) => message === undefined)) return undefined;

  return [...new Set(messages)].join(" ");
}

export function getErrorMessage(error: unknown, fallbackMessage = "Algo deu errado."): string {
  if (!isAxiosError<ErrorResponse>(error)) return fallbackMessage;

  const issues = error.response?.data?.issues;
  return (issues?.length && translateIssues(issues)) || fallbackMessage;
}
