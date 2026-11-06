const CENTS_PER_REAL = 100;
// What the integer columns of the database hold. A value over it would pass the preview and then
// make the whole import fail when it is written.
export const MAX_INTEGER = 2_147_483_647;
const MINUTE_IN_MS = 60_000;
const SECOND_IN_MS = 1_000;
const NOON = 12;
const BRAZILIAN_COUNTRY_CODE = "55";
const BRAZILIAN_NUMBER_LENGTHS = [10, 11];
const PHONE_DIGITS = /^\d{8,15}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_URL_LENGTH = 2048;
const ISO_INSTANT =
  /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?)?\s*(Z|[+-]\d{2}:?\d{2})?$/;
const BRAZILIAN_INSTANT = /^(\d{2})\/(\d{2})\/(\d{4})(?: (\d{2}):(\d{2})(?::(\d{2}))?)?$/;
const FORMULA_QUOTE = /^'[=+\-@\t\r]/;

// The export puts a quote before a text that starts like a formula; coming back, it is taken off.
export const unquoted = (value: string): string =>
  FORMULA_QUOTE.test(value) ? value.slice(1) : value;

function offsetMsOf(utcMs: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(utcMs));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((item) => item.type === type)?.value);

  const local = Date.UTC(
    part("year"),
    part("month") - 1,
    part("day"),
    part("hour"),
    part("minute"),
    part("second")
  );

  return local - Math.floor(utcMs / SECOND_IN_MS) * SECOND_IN_MS;
}

function offsetOfText(text: string | undefined): number | null {
  if (!text) return null;
  if (text === "Z") return 0;

  const sign = text.startsWith("-") ? -1 : 1;
  const digits = text.slice(1).replace(":", "");

  return sign * (Number(digits.slice(0, 2)) * 60 + Number(digits.slice(2, 4))) * MINUTE_IN_MS;
}

type DateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function partsOf(
  raw: string
): { parts: DateParts; offsetText: string | undefined; hasTime: boolean } | null {
  const iso = ISO_INSTANT.exec(raw);
  const brazilian = iso ? null : BRAZILIAN_INSTANT.exec(raw);
  const match = iso ?? brazilian;
  if (!match) return null;

  const [year, month, day] = iso ? [match[1], match[2], match[3]] : [match[3], match[2], match[1]];
  const hasTime = match[4] !== undefined;

  return {
    parts: {
      year: Number(year),
      month: Number(month),
      day: Number(day),
      hour: hasTime ? Number(match[4]) : NOON,
      minute: hasTime ? Number(match[5]) : 0,
      second: Number(match[6] ?? 0),
    },
    offsetText: iso ? match[7] : undefined,
    hasTime,
  };
}

// Empty is null; a text that is no date, or a day that doesn't exist, is undefined. Without an
// offset the time is the one on the clock in the time zone of the profile; a day alone is noon.
export function readInstant(raw: string, timeZone: string): Date | null | undefined {
  if (raw === "") return null;

  const found = partsOf(raw);
  if (!found) return undefined;

  const { year, month, day, hour, minute, second } = found.parts;
  const asUtc = Date.UTC(year, month - 1, day, hour, minute, second);
  const check = new Date(asUtc);
  const isRealDay =
    check.getUTCFullYear() === year &&
    check.getUTCMonth() === month - 1 &&
    check.getUTCDate() === day &&
    hour < 24 &&
    minute < 60 &&
    second < 60;
  if (!isRealDay) return undefined;

  const explicitOffset = offsetOfText(found.offsetText);
  if (explicitOffset !== null) return new Date(asUtc - explicitOffset);

  const firstGuess = asUtc - offsetMsOf(asUtc, timeZone);

  return new Date(asUtc - offsetMsOf(firstGuess, timeZone));
}

// 1500.00, 1500,50, 1.500,50, R$ 1.500,50 and 1,500.50 all mean what they look like.
export function readMoneyInCents(raw: string): number | null | undefined {
  const text = raw.replace(/R\$|\s/g, "");
  if (text === "") return null;
  if (!/^\d[\d.,]*$/.test(text)) return undefined;

  const lastComma = text.lastIndexOf(",");
  const lastDot = text.lastIndexOf(".");
  let normalized = text;

  if (lastComma > lastDot) {
    normalized = text.replaceAll(".", "").replace(",", ".");
  } else if (lastDot > lastComma && lastComma !== -1) {
    normalized = text.replaceAll(",", "");
  } else if (lastDot !== -1 && /^\d{1,3}(\.\d{3})+$/.test(text)) {
    normalized = text.replaceAll(".", "");
  }

  const value = Number(normalized);
  if (!Number.isFinite(value)) return undefined;

  const cents = Math.round(value * CENTS_PER_REAL);

  return cents > MAX_INTEGER ? undefined : cents;
}

// A number with a "+" is international as typed. One without it and with 10 or 11 digits is taken
// as Brazilian, the country of the people Vetra is for, and gets the 55.
export function readPhone(raw: string): string | undefined {
  const digits = raw.replace(/\D/g, "");
  const isBrazilianLocal =
    !raw.trim().startsWith("+") && BRAZILIAN_NUMBER_LENGTHS.includes(digits.length);
  const phone = isBrazilianLocal ? `${BRAZILIAN_COUNTRY_CODE}${digits}` : digits;

  return PHONE_DIGITS.test(phone) ? phone : undefined;
}

export const isEmail = (value: string) => EMAIL.test(value);

export function isHttpUrl(value: string): boolean {
  if (value.length > MAX_URL_LENGTH) return false;

  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}
