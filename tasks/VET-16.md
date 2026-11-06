# VET-16 — Closing the MVP gaps

## Objective

Close the gaps an audit of the CRM found before calling it a usable MVP, without starting the automations.

- **What:** a clear message when the server is down, search by phone number, a message when an action can't be scheduled, and a kept history of completed activities.
- **Why:** with the API down every screen was blank and said nothing; a number could not be found in the CRM, only in WhatsApp; completing an activity erased it, leaving nothing to build metrics on later.
- **Who benefits:** the user, daily, and anyone Vetra is shared with, who will often start it without the server or Docker running.
- **Architectural direction:** nothing new is invented: a notice in the app shell, the phone added to the searches that exist, and one new table that fills when an activity is completed.

---

## Decisions already made with the user

- **Done:** 1 (the server is down), 2 (search by phone), and **keeping completed activities**, with the export and the import updated. The "small details" turned out to need nothing (see 3).
- **Later, on their own:** starting Vetra with one command and when the computer turns on (with a guard on `db:seed` and the README), the first-run introduction (the "Maria Souza" name), and linking the prospecting pipeline.

## Out of scope

- A screen for the history. It is only kept (and exported and imported) for a later update. It can show in the lead's page when that update comes.
- Notifications of due actions.

---

## 1. The server is down

- Every query and mutation goes through one place that notices when the API can't be reached (no answer at all) or answers with an internal error, and then asks the API for the profile once. If that fails too, the whole backend, or its database, is down.
- Then the content of the app is replaced by a message in Portuguese: it says Vetra can't talk to its server, asks to check that it is running and that Docker is on, and has a "Tentar de novo" button. The sidebar stays.
- While it shows, Vetra tries again every few seconds. When the server answers, the message goes away and the data is loaded again, with nothing to click.
- A failure of one screen's code, which is not the server, shows a message too, with "Tentar de novo" and a way back to the Painel, instead of a blank page. "Tentar de novo" also clears what the screens had stored, since that may be what broke it.
- What made the screens blank: the providers of the time zone and of the stages draw nothing until the profile and the stages arrive, so with no server nothing was ever drawn.

## 2. Search by phone

- The Ctrl K search, the Leads list and the Clientes list find a lead by its phone. Whatever is typed is reduced to digits, and a lead is found when its number has them (any part, from four digits), whether the number was saved with the ninth digit or not.
- The text of the searches says it ("nome, contato, telefone, nicho ou cidade").

## 3. Small details

- **Nothing to change.** The audit thought that scheduling an activity with no description did nothing; it does say "Descreva a próxima ação.", in red, under the field. The audit's own check looked for other words.

## 4. History of completed activities

- Completing an action used to delete it and schedule the next. Now it also writes it to a new table, `completed_actions`, in the same transaction: its id, lead, kind, follow-up step, description, due date and **when it was completed**.
- It goes with the lead when the lead is deleted, like everything that belongs to one.
- Nothing from before can be recovered: what was completed earlier is gone.
- **Export:** a new file `atividades_concluidas.csv` (id, lead_id, tipo, passo_follow_up, descricao, vence_em, concluida_em). **Import:** it reads that file too, as another child of the lead, and the preview counts it as "Atividades concluídas". A zip without it (an older export) still imports.
- **The migration** (`0019`) must be applied with `db:migrate` on the real database.

---

## Requirements

- One new table and its migration, named. No other dependency.
- No automated tests, as in the earlier tasks. Each part is checked in the browser and over HTTP with a temporary database.

## Acceptance Criteria

- Turning the server off shows the message on every screen, and turning it on brings the screens back by itself.
- A phone, or part of it, finds the lead in the three searches.
- The server being down, and the code of a screen failing, each show their own message.
- Completing an action leaves a row in `completed_actions`, and the export carries it and the import brings it back.
