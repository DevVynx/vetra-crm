const BYTE_ORDER_MARK = "\uFEFF";
const FORMULA_START = /^[=+\-@\t\r]/;
const NEEDS_QUOTES = /[",\r\n]/;

// A spreadsheet runs a cell that starts with one of these as a formula, so a text the user wrote
// (or a stranger sent) gets a quote in front, which the spreadsheet shows as nothing.
export function textCell(value: string | null): string {
  if (value === null) return "";

  return FORMULA_START.test(value) ? `'${value}` : value;
}

function quoted(cell: string): string {
  return NEEDS_QUOTES.test(cell) ? `"${cell.replaceAll('"', '""')}"` : cell;
}

// RFC 4180, with the byte order mark Excel needs to read UTF-8.
export function csvOf(headers: string[], rows: string[][]): string {
  const lines = [headers, ...rows].map((row) => row.map(quoted).join(","));

  return `${BYTE_ORDER_MARK}${lines.join("\r\n")}\r\n`;
}
