import { addDays, nextMonday, setHours, startOfHour } from "date-fns";

const DEFAULT_DUE_HOUR = 9;

export function atDefaultHour(date: Date): Date {
  return startOfHour(setHours(date, DEFAULT_DUE_HOUR));
}

export function inDays(days: number, from = new Date()): Date {
  return atDefaultHour(addDays(from, days));
}

export const quickDueOptions = [
  { label: "Amanhã", getDate: () => inDays(1) },
  { label: "Em 2 dias", getDate: () => inDays(2) },
  { label: "Próxima semana", getDate: () => atDefaultHour(nextMonday(new Date())) },
];
