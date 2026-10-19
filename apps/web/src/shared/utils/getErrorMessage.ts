import { isAxiosError } from "axios";

type ErrorResponseBody = {
  error?: string;
  message?: string;
  issues?: { path: string; code: string; params?: Record<string, unknown> }[];
};

export function getErrorMessage(error: unknown, fallbackMessage = "Algo deu errado."): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as ErrorResponseBody | undefined;

    if (data?.issues?.length) {
      return data.issues.map((issue) => `${issue.path}: ${issue.code}`).join("; ");
    }

    if (data?.message) return data.message;
  }

  return fallbackMessage;
}
