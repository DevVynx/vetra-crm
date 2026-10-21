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
