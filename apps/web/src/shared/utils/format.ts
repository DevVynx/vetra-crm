import { parsePhoneNumberFromString } from "libphonenumber-js";

import { maskCurrency } from "./masks";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  maximumFractionDigits: 0,
});

export function formatCurrency(valueInCents: number): string {
  return currencyFormatter.format(valueInCents / 100);
}

export function formatPercent(ratio: number): string {
  return percentFormatter.format(ratio);
}

export function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

const signedPercentFormatter = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  maximumFractionDigits: 0,
  signDisplay: "exceptZero",
});

export function formatSignedPercent(ratio: number): string {
  return signedPercentFormatter.format(ratio);
}

const compactCurrencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatCompactCurrency(valueInCents: number): string {
  return compactCurrencyFormatter.format(valueInCents / 100);
}

// In Brazil, WhatsApp ids carry the ninth digit only in some regions, but every mobile number has
// it, so it is always shown. Landlines start with 2 to 5 and never have it.
function formatBrazilianPhone(area: string, number: string): string {
  const full = /^[6-9]/.test(number) && number.length === 8 ? `9${number}` : number;

  return `+55 (${area}) ${full.slice(0, -4)}-${full.slice(-4)}`;
}

export function formatPhone(phone: string): string {
  const brazilian = /^55(\d{2})(\d{8,9})$/.exec(phone);
  if (brazilian?.[1] && brazilian[2]) return formatBrazilianPhone(brazilian[1], brazilian[2]);

  return parsePhoneNumberFromString(`+${phone}`)?.formatInternational() ?? `+${phone}`;
}

export function parseCurrencyToCents(text: string): number | null {
  const normalized = text.replace(/[^\d,]/g, "").replace(",", ".");
  const value = Number(normalized);
  return Number.isFinite(value) && value > 0 ? Math.round(value * 100) : null;
}

export function centsToInput(valueInCents: number): string {
  return maskCurrency(String(valueInCents));
}

export const firstNameOf = (name: string) => name.split(" ")[0] ?? name;
