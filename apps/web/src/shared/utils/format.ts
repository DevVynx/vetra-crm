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

export function formatPhone(phone: string): string {
  const match = /^55(\d{2})(\d{4,5})(\d{4})$/.exec(phone);
  return match ? `+55 (${match[1]}) ${match[2]}-${match[3]}` : phone;
}

export function parseCurrencyToCents(text: string): number | null {
  const normalized = text.replace(/[^\d,]/g, "").replace(",", ".");
  const value = Number(normalized);
  return Number.isFinite(value) && value > 0 ? Math.round(value * 100) : null;
}

export function centsToInput(valueInCents: number): string {
  return (valueInCents / 100).toFixed(2).replace(".", ",");
}
