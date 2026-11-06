export type CsvRow = { line: number; values: Map<string, string> };

export type ParsedCsv = { headers: string[]; rows: CsvRow[]; hasTooManyRows: boolean };

const BYTE_ORDER_MARK = "\uFEFF";
export const MAX_CSV_ROWS = 20_000;

// Excel in Portuguese writes a semicolon, so the delimiter is read from the header line.
function delimiterOf(text: string): string {
  const header = text.split(/\r\n|\n|\r/, 1)[0] ?? "";
  const semicolons = header.split(";").length;
  const commas = header.split(",").length;

  return semicolons > commas ? ";" : ",";
}

// RFC 4180, tolerant: quoted cells with commas, quotes and line breaks, any line ending, and blank
// lines left out. A cell never ends the file: an open quote at the end is closed by the end.
function splitRows(text: string, delimiter: string): { line: number; cells: string[] }[] {
  const rows: { line: number; cells: string[] }[] = [];
  let cells: string[] = [];
  let cell = "";
  let inQuotes = false;
  let line = 1;
  let rowLine = 1;
  let cellWasQuoted = false;

  const endCell = () => {
    cells.push(cell);
    cell = "";
    cellWasQuoted = false;
  };
  const endRow = () => {
    endCell();
    const isBlank = cells.length === 1 && cells[0] === "" && !cellWasQuoted;
    if (!isBlank) rows.push({ line: rowLine, cells });
    cells = [];
    rowLine = line;
  };

  for (let index = 0; index < text.length; index++) {
    const char = text[index];

    if (inQuotes) {
      if (char === '"' && text[index + 1] === '"') {
        cell += '"';
        index++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        if (char === "\n") line++;
        cell += char;
      }
    } else if (char === '"' && cell === "") {
      inQuotes = true;
      cellWasQuoted = true;
    } else if (char === delimiter) {
      endCell();
    } else if (char === "\r" || char === "\n") {
      if (char === "\r" && text[index + 1] === "\n") index++;
      line++;
      endRow();
    } else {
      cell += char;
    }
  }
  if (cell !== "" || cells.length > 0) endRow();

  return rows;
}

export function parseCsv(content: string): ParsedCsv {
  const text = content.startsWith(BYTE_ORDER_MARK) ? content.slice(1) : content;
  const [headerRow, ...dataRows] = splitRows(text, delimiterOf(text));
  const headers = (headerRow?.cells ?? []).map((header) => header.trim().toLowerCase());

  const rows = dataRows.slice(0, MAX_CSV_ROWS).map(({ line, cells }) => ({
    line,
    values: new Map(headers.map((header, index) => [header, cells[index] ?? ""] as const)),
  }));

  return { headers, rows, hasTooManyRows: dataRows.length > MAX_CSV_ROWS };
}
