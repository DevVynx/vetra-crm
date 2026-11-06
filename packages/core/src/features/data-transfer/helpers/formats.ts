const CENTS_PER_REAL = 100;
const BRAZIL_NUMBER = /^55(\d{2})(\d{8,9})$/;
const NINE_DIGIT_NUMBER_LENGTH = 9;
const NUMBER_SPLIT_AT = { 8: 4, 9: 5 } as const;

export type InstantFormatter = (date: Date | null) => string;

// 2026-11-05T14:30:00-03:00: readable, and exact for anyone who reads it back.
export function instantFormatterOf(timeZone: string): InstantFormatter {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    timeZoneName: "longOffset",
  });

  return (date) => {
    if (!date) return "";

    const parts = formatter.formatToParts(date);
    const part = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((item) => item.type === type)?.value ?? "";
    const offset = part("timeZoneName").replace("GMT", "") || "+00:00";

    return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}:${part("second")}${offset}`;
  };
}

export function dayOf(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(date);
}

export function moneyCell(cents: number | null): string {
  return cents === null ? "" : (cents / CENTS_PER_REAL).toFixed(2);
}

// As a person reads it, so a spreadsheet keeps it as text instead of a long number.
export function phoneCell(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";

  const brazilian = BRAZIL_NUMBER.exec(digits);
  if (!brazilian) return `+${digits}`;

  const [, area = "", local = ""] = brazilian;
  const cut = NUMBER_SPLIT_AT[local.length === NINE_DIGIT_NUMBER_LENGTH ? 9 : 8];

  return `+55 (${area}) ${local.slice(0, cut)}-${local.slice(cut)}`;
}
