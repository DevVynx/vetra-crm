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

## The files

| File             | One row per                     | Notes                                                                                                             |
| ---------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `leads.csv`      | lead and customer (same record) | stage names, where it stopped, and the deal columns (closed value, document, monthly fee), archived ones included |
| `projetos.csv`   | project                         | points to the lead                                                                                                |
| `parcelas.csv`   | installment (revenue)           | points to the lead and, if any, the project                                                                       |
| `despesas.csv`   | expense                         | points to the lead and, if any, the project                                                                       |
| `notas.csv`      | note                            | points to the lead                                                                                                |
| `atividades.csv` | next action                     | points to the lead                                                                                                |
| `etapas.csv`     | stage                           | name, color, role, position                                                                                       |

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

## Step 2 — Import (after step 1 is validated)

Written when step 1 is accepted.

---

## Requirements

- The route is a new constant in `@vetra/routes`, a controller that only calls a service in `packages/core`.
- No new dependency.
- No automated tests, as in the earlier tasks. Each step is checked over HTTP and in the browser with a temporary database.
- The export never reads WhatsApp tables.

## Acceptance Criteria (step 1)

- One click in Settings downloads a `.zip` with the seven files.
- Each file opens in a spreadsheet with the right accents, one row per record, and the ids that tie the files together.
- Nothing from WhatsApp is in it.
