import { format, formatDistanceToNowStrict, isToday, isTomorrow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatLongDate(date: Date): string {
  return format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
}

export function formatDayLabel(date: Date): string {
  if (isToday(date)) return "Hoje";
  if (isTomorrow(date)) return "Amanhã";
  return format(date, "EEE, d 'de' MMM", { locale: ptBR });
}

export function formatTime(date: Date): string {
  return format(date, "HH:mm");
}

export function formatRelative(date: Date): string {
  return formatDistanceToNowStrict(date, { locale: ptBR, addSuffix: true });
}
