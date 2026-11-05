import {
  differenceInCalendarDays,
  differenceInCalendarMonths,
  format,
  formatDistanceToNowStrict,
  isToday,
  isTomorrow,
  isYesterday,
} from "date-fns";
import { ptBR } from "date-fns/locale";

import { inProfileZone, nowInProfileZone } from "@/shared/time-zone/zonedDate";

export function formatLongDate(date: Date): string {
  return format(inProfileZone(date), "EEEE, d 'de' MMMM", { locale: ptBR });
}

export function formatDayLabel(date: Date): string {
  const zoned = inProfileZone(date);
  if (isToday(zoned)) return "Hoje";
  if (isTomorrow(zoned)) return "Amanhã";
  return format(zoned, "EEE, d 'de' MMM", { locale: ptBR });
}

export function formatTime(date: Date): string {
  return format(inProfileZone(date), "HH:mm");
}

export function formatConversationTime(date: Date): string {
  const zoned = inProfileZone(date);
  if (isToday(zoned)) return format(zoned, "HH:mm");
  if (isYesterday(zoned)) return "Ontem";
  return format(zoned, "dd/MM/yy");
}

export function formatRelative(date: Date): string {
  return formatDistanceToNowStrict(date, { locale: ptBR, addSuffix: true });
}

export function formatShortDate(date: Date): string {
  return format(inProfileZone(date), "d 'de' MMM 'de' yyyy", { locale: ptBR });
}

export function formatChipDate(date: Date): string {
  return format(inProfileZone(date), "d MMM, yyyy", { locale: ptBR });
}

export function formatChipDateTime(date: Date): string {
  return format(inProfileZone(date), "d MMM, yyyy - HH:mm", { locale: ptBR });
}

export function formatLastContact(date: Date): string {
  const now = nowInProfileZone();
  const zoned = inProfileZone(date);
  const days = differenceInCalendarDays(now, zoned);
  if (days <= 0) return "hoje";
  if (days === 1) return "ontem";
  if (days < 7) return `há ${days} dias`;

  const months = differenceInCalendarMonths(now, zoned);
  if (months < 1) {
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? "há 1 semana" : `há ${weeks} semanas`;
  }

  if (months < 12) return months === 1 ? "há 1 mês" : `há ${months} meses`;
  const years = Math.floor(months / 12);
  return years === 1 ? "há 1 ano" : `há ${years} anos`;
}
