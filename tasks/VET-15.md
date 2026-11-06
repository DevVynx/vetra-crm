# VET-15 — Export and import data (CSV)

## Objective

Let the user take their CRM data out as CSV files, and bring it (or leads from another spreadsheet) back in.

- **What:** a "Dados" section in Settings with "Exportar tudo" and "Importar".
- **Why:** it is what every CRM offers: the user owns their data, can work on it in a spreadsheet, move it to another tool, and restore it.
- **Who benefits:** the user, and anyone Vetra is shared with later, who needs a way in from their own spreadsheet.
- **Architectural direction:** CSV is one table per file, and the data has one-to-many (a client has several projects, installments, expenses, notes and activities). So one export is **one `.zip` with one CSV per kind**, which is also how CRMs do it. No library is added: the zip is written and read with Node's `zlib`.

Delivered in **two steps, each validated by the user before the next one starts**: 1. export, 2. import.

---

## Decisions already made with the user

- **Everything the CRM owns, nothing from WhatsApp.** No conversations or messages. The profile photo is not exported either.
- **One export, many files**, instead of one CSV (a single flat CSV would repeat the lead on every installment or lose data).
- **Import accepts the exported `.zip` and a loose `leads.csv`.** A lead that already exists is skipped and listed. Updating existing ones is not part of this task.
- **Headers in Portuguese**, like the interface.
- It lives in **Settings → Dados**.
- Automations are out of this task.

## Format

- Plain CSV (RFC 4180): comma, `"` quoting, `\r\n`, UTF-8 **with BOM** so Excel opens the accents right.
- Dates and times as ISO 8601 in the **profile time zone**, with the offset (`2026-11-05T14:30:00-03:00`). A date without time is only used where the data has none.
- Money as decimal reais with a dot and no symbol (`1500.00`).
- Phones written as people read them (`+55 (31) 99999-0000`), so a spreadsheet keeps them as text. The import reads any format, because the stored phone is only digits.
- Yes/no, statuses and kinds in Portuguese words.
- A text cell that starts with `=`, `+`, `-`, `@`, a tab or a carriage return gets a leading `'`, so a spreadsheet never runs it as a formula (phones are the exception: they are checked to be only phone characters).

**Open question, to check in Excel:** a phone is written as `+55 (31) 99999-0000` and is not guarded
like the other texts. Excel treats a leading `+` as the start of a formula when a cell is typed; it was
not confirmed what it does with a cell read from a CSV. If a phone shows as an error (`#NAME?`), the
phone cell has to change, and the import already reads the number however it is written.

## The files

| File                        | One row per                             | Notes                                                                                                             |
| --------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `leads.csv`                 | lead and customer (same record)         | stage names, where it stopped, and the deal columns (closed value, document, monthly fee), archived ones included |
| `projetos.csv`              | project                                 | points to the lead                                                                                                |
| `parcelas.csv`              | installment (revenue)                   | points to the lead and, if any, the project                                                                       |
| `despesas.csv`              | expense                                 | points to the lead and, if any, the project                                                                       |
| `notas.csv`                 | note                                    | points to the lead                                                                                                |
| `atividades.csv`            | pending next action                     | points to the lead                                                                                                |
| `atividades_concluidas.csv` | completed next action (added in VET-16) | points to the lead, with when it was completed                                                                    |
| `etapas.csv`                | stage                                   | name, color, role, position                                                                                       |

Every row keeps its own `id`, and the child files carry `lead_id`, so a spreadsheet can join them and the import can restore the links.

## Out of scope

- WhatsApp data, the profile and its photo.
- Updating leads that already exist, merging, or importing into a non-empty stage list.
- Scheduled or automatic backups.

---

## Step 1 — Export

- `GET /data/export` answers a `.zip` (`Content-Disposition: attachment`, `Cache-Control: no-store`).
- A `createZip` in `packages/infra` (store of `zlib.deflateRawSync`, `zlib.crc32`, UTF-8 names), pure, no dependency.
- A `data-transfer` feature in `packages/core`: repositories read each table, the domain owns the columns, the labels and the cell rules, and a service builds the files.
- In Settings, a "Dados" section with "Exportar tudo", that downloads `vetra-dados-AAAA-MM-DD.zip`.
- **Checked** over HTTP and in the browser, with a temporary database: every file and its header, the number of rows against the tables, accents and commas, quotes and line breaks inside a cell, the formula guard, an empty database, and that the zip opens with a real unzip tool.

## Step 2 — Import

**Decided with the user:** it accepts the exported `.zip` and a loose `leads.csv`; **only Vetra's own columns** (no guessing names from other CRMs); a lead that already exists is **skipped and listed**.

- **Two requests, nothing kept between them.** `POST /data/import/preview` reads and checks the file and answers what would happen, writing nothing. `POST /data/import` does the same and then writes, in **one transaction**. The browser keeps the file and sends it twice.
- **The file is told by its first bytes** (`PK`), not by its name: a zip is read, anything else is read as `leads.csv`.
- **A lead is the same lead by its phone**, with the rule that already exists (the canonical key, nine-digit aware). A lead whose phone is already in Vetra, or that repeats inside the file, is skipped and named in the report. The children of a skipped lead are skipped with it (they are counted, not errors).
- **New ids.** Nothing keeps the ids of the file: every lead and record gets a new one, and the `lead_id` / `projeto_id` columns only tie the rows of the file together. This is what lets a loose `leads.csv` with no ids work and avoids any clash.
- **The same rules as typing it in Vetra:** company, niche and city required with their lengths, a phone of 8 to 15 digits (a Brazilian number without the country code gets `55`), an email that is an email, a demo link that is `http`/`https`. A customer (`cliente = sim`) needs the closing stage, a closing date and a value above zero, and a lead in the closing stage must be a customer. An archived lead may say where it stopped.
- **Stages are matched by name** with the ones that exist, ignoring upper and lower case and the spaces at the ends (accents must match). Importing never creates a stage, so a lead with an unknown stage is an error that names it. `etapas.csv` is ignored: it is not needed.
- **Tolerant of what a spreadsheet does to a file:** the delimiter is read from the header (comma or semicolon, which Excel in Portuguese writes), a file that is not UTF-8 is read as Windows-1252 (the "CSV" of Excel), dates are ISO or `dd/mm/aaaa` (without an offset they are in the profile time zone), money is `1500.00`, `1500,50` or `R$ 1.500,50`, and the `'` the export puts before a formula is taken off.
- **A row of a project that stayed out because of an error makes the installments and expenses that point to it errors too, so a link is never lost without being said. A row with an error does not stop the others.** Each error says the file, the line, the column and why, as a code the web writes in Portuguese. The preview shows how many would be created, skipped and left out, and the list of errors and of skipped leads (the first 100 of each). The user confirms, and only valid rows are written.
- **All or nothing when writing:** if the database refuses anything, nothing of the import stays.
- **Limits, since the file is read by hand:** 10 MB of upload, at most 20 files in the zip and 50 MB once opened, no encrypted or Zip64 zip, every file's checksum checked, and at most 20,000 rows per file.
- **The browser turns away what can't be right before sending:** a name that doesn't end in `.zip` or `.csv`, an empty file, and one over 10 MB, each with a message in Portuguese. The API still checks everything, since the browser's check is only a convenience.
- **In Settings → Dados,** an "Importar" row picks the file and opens a dialog with the preview and the confirm button.
- **Out of scope:** updating existing leads, creating stages, and importing records of a lead that already exists.
- **Checked** over HTTP and in the browser with temporary databases: the exact round trip (export from one database, import into an empty one, export again and compare), every refusal and every tolerance above, the transaction rolling back, and the zip limits.

---

## Requirements

- The route is a new constant in `@vetra/routes`, a controller that only calls a service in `packages/core`.
- No new dependency.
- No automated tests, as in the earlier tasks. Each step is checked over HTTP and in the browser with a temporary database.
- The export never reads WhatsApp tables.

## Acceptance Criteria (step 1)

- One click in Settings downloads a `.zip` with the files (seven when it was written; eight since VET-16 added the completed activities).
- Each file opens in a spreadsheet with the right accents, one row per record, and the ids that tie the files together.
- Nothing from WhatsApp is in it.
