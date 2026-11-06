# VET-19 — Integration with the prospecting pipeline

## Objective

Let the prospecting pipeline (`C:\Code\Projetos\captacao-pipeline`, a separate Claude Code project) hand its approved prospects to Vetra, and ask Vetra whether a prospect is already known, without either project depending on the other.

- **What:** a small, local HTTP contract in Vetra: a version check, a lookup of leads, an idempotent upsert by `slug`, a `doNotContact` flag, and the matching import column.
- **Why:** today a prospect found by the pipeline is typed or imported by hand into Vetra, and the pipeline cannot know whether a business was already contacted.
- **Who benefits:** the user, who gets each prospect in the CRM with the demo link and a first action waiting, and a pipeline that stops prospecting the same business twice.

## The agreement (decided with the user and with the agent that works on the pipeline)

### Principles

- **The pipeline works alone.** Vetra is optional for it. If any call to Vetra fails or is slow (about 2 s), the pipeline continues with its own files and never blocks.
- **With Vetra running, it is the source of truth for the state of a lead.** The pipeline keeps its own artifacts (approach text, identity, result, learnings), which are not lead state.
- **No message is sent automatically, and there is no automatic chat.** Sending from an activity belongs to the automations (VET-20), not here.
- **No lead without a phone.** The pipeline does not prospect a business with no phone with area code, so the phone stays required and unique in Vetra. Landlines are valid (Vetra only asks for 8 to 15 digits and does not tell mobile from landline).
- **A candidate the user rejects never reaches Vetra.** It stays only in the pipeline's dossiers.

### When a lead enters Vetra

One call, at the **end** of each prospect, when the demo is deployed and the approach did not fail the pipeline's quality gate. It creates the lead with the demo link, a note and the first action at once. A failed gate sends nothing. If Vetra is down, the pipeline keeps the lead in its own file and sends it on the next round.

### What the pipeline never does in Vetra

Change the stage after creating the lead, delete a lead or a note, touch finance, WhatsApp or the profile, or overwrite a field the user edited.

## Out of scope

- Sending a message, the send button and any automation (VET-20).
- Instagram, website, address or Maps link as lead fields. Vetra keeps the state, the pipeline keeps the files.
- Leads without a phone.
- The pipeline's own side (slug generation, `lead.json`, the sync skill): that is the other project, decided by its owner.
- Publishing and updating (VET-23, VET-24).

---

## What Vetra adds

All local, on `127.0.0.1` with no login, as the rest of the API. Calls from outside a browser carry no `Origin` and pass; the `Host` must be `127.0.0.1` or `localhost` with the port.

### Database

- `leads.slug`: text, nullable, **unique** (kebab-case, without accents, stable).
- `leads.do_not_contact`: boolean, not null, default `false`.

### Routes

1. **`GET /api/system`** answers `{ "name": "vetra", "apiVersion": 1 }`.
2. **`GET /api/leads/lookup?slug=&phone=&name=&city=`** answers the leads that match, each with `id`, `slug`, `businessName`, stage (name and role) and `doNotContact`. It matches by `slug` and by phone (the same canonical key the lead uses: it ignores the ninth digit and completes the `55`). **Name plus city is only a hint** (equal ignoring case and accents), never a reason by itself to discard anything.
3. **`PUT /api/leads/by-slug/:slug`**, an idempotent upsert:
   - **Creates** the lead if the slug is new, in the entry stage. Fields: `businessName` (≤120), `niche` (≤60), `city` (≤60), `phone` (digits, 8–15, with `55`), `contactName`, `email`, `demoUrl` (http/https), `prospectedAt` (optional, keeps the real date of an old prospect), `doNotContact`, and `nextAction` (optional).
   - `nextAction` is `{ type: "first_approach" | "follow_up", followUpStep?, dueAt?, description, body? }`. **Only when the upsert creates the lead**, it also creates that pending next action (`dueAt` defaults to now; it may be in the past or the future). Absent means no action. Updating an existing lead never creates one, so a repeated call never duplicates it. `description` is a short title ("Enviar a abordagem de abertura"); the message text goes in `body`.
   - **Updates** an existing slug only to set `demoUrl` and to fill fields that are empty. It never overwrites a field the user edited and never changes the stage.
   - `doNotContact` is accepted only as `true`, also on a lead that exists. `false` is ignored: only the user turns it off, in Vetra.
   - **Phone collision.** A new slug whose phone belongs to another lead is not created. It answers `{ "created": false, "conflict": "phone", "lead": { slug, name, stage, doNotContact } }`, not a generic error.
   - Answers `{ "created": boolean, "lead": … }`.
4. The note with the gap and the category goes through the existing `POST /api/leads/:id/notes`.

### Import

- `leads.csv` accepts a `slug` column and a `nao_contatar` column (sim/nao), and `etapa` becomes optional (a lead without it goes to the entry stage), so the pipeline's CSV does not depend on the name of a stage, which the user can rename.
- The export writes both columns.

### The text of an action

- A next action gets an optional **`body`** (text, up to 4000 characters, line breaks and emoji kept). Today an action only has a one-line `description`, shown cut at one or two lines and edited in a single-line input, which would flatten a message of several lines.
- Where an action is shown inside a lead, the `body` appears in full (line breaks kept) with a **"Copiar" button**, and the edit form gets a text area for it. Lists (Painel, leads) keep showing only the short `description`.
- This is also the place the send button of the automations (VET-20) will read.

### Screens

- A visible "Não contatar" mark on the lead's page and in the Leads list, and a switch in the lead's "Ações do lead" menu ("Marcar como não contatar" / "Permitir contato", with undo) through `PATCH /api/leads/:id/do-not-contact`. It is its own route, not part of the edit form, so the update contract of a lead did not change. Nothing is blocked by it in this task (blocking a send belongs to the automations).

## Decisions

- **`doNotContact` is a flag, not a stage.** "Lost" and "asked to stop" are different, and the second must survive any stage change.
- **The sync of old leads asks before it creates an action.** An old `lead.json` can be an approached, a talking or a refused prospect, and the pipeline cannot know who already received the message. The sync skill (`/vetra-sync`) asks the user, per lead or in a batch, whether and when the message was sent, and only then sends the right `nextAction` (a `first_approach` if not sent; a `follow_up` with its step and date if sent and unanswered). Vetra only stores what it receives.
- **Completing an action** still works as today: the request carries the next action, and the web suggests it (`suggestNextAction`: follow-ups 1, 2 and 3 after 2, 3 and 5 days). Vetra does not schedule by itself.
- **A lead has one phone in Vetra.** The pipeline sends one (the mobile one when it has both). The other number stays in the pipeline's `lead.json`, and the lookup accepts several phones, so the pipeline can check both. A later candidate that shows only the number Vetra did not store is not found by phone; name plus city is the hint for that case.
- **The pipeline's piece ids stay in the pipeline.** The note carries only the gap and the category.
- **Follow-up descriptions naming pipeline pieces** (a suggestion of the other agent): a little coupling is acceptable to the user, but Vetra does not write follow-up descriptions today (the user types the next action when completing one). It is left for the automations (VET-20), where the cadence is designed.
- **The skill that syncs old leads is called `vetra-sync`** (the user's choice: it only makes sense with Vetra).

## No duplicate leads

What Vetra guarantees, at the database and not only in the code:

- **One lead per phone.** `leads` has a unique index on the canonical phone key (it ignores the ninth digit and completes the `55`). A second lead with the same number cannot exist, whoever tries to create it.
- **One lead per slug.** The new `slug` column is unique (several leads may have no slug, as those typed by hand do).

What Vetra does **not** guarantee, and says so: the same business with **two different phones** (landline and mobile) or two different slugs becomes two leads. Name plus city in the lookup is only a hint for the pipeline to show the user.

Requirements that follow:

- Two upserts of the same slug arriving at the same time must end as one lead: the loser of the unique index is caught and answered as the existing lead (or as the phone `conflict`), never as a 500.
- The upsert never changes a phone, so a phone the user corrected in Vetra is not undone.

## Requirements

- No new dependency. Core, contracts, routes and the API follow the existing layering (`ADDING-A-FEATURE.md`); the new rules live in `packages/core` (the leads feature).
- A migration for the two columns. It is **not applied to the user's real database without asking.**
- `pnpm dev` and the built image keep working.
- No automated tests, as in the earlier tasks. Each step is checked with a temporary database over HTTP, with `curl` from outside a browser: version, lookup by slug, phone and name+city, create, repeat (idempotent), update that fills only empty fields, phone collision, `doNotContact` true and false, the next action created once (with a multi-line body with accents and emoji, shown whole and copied), a follow-up with a past and a future date, two upserts of the same slug fired at once, import with and without `etapa`, export round trip.

## Acceptance Criteria

- `GET /api/system` answers the version.
- Repeating the same upsert never duplicates a lead or its first action.
- An upsert with a phone that belongs to another lead answers `conflict: "phone"` and creates nothing.
- A lead the user edited is not overwritten by an upsert.
- `doNotContact` can only be turned off in Vetra.
- The pipeline's `leads.csv` (with `slug`, without `etapa`) imports.

---

## What was found while checking it

- **Checked** over HTTP from outside a browser (no `Origin`), with a temporary database that was dropped afterwards, a fake WAHA and the real web in Chrome: the version, the lookup (slug, phone without the ninth digit, several phones, name plus city ignoring case and accents, name alone finding nothing), the create with its first action, the repeat (no second lead, no second action), the phone collision, an update that fills only empty fields and keeps what the user edited (email, name, city, phone, stage), `doNotContact` only going up from the pipeline and the user turning it off, the validations (slug, phone, a follow-up without a step, other action types, a body over 4000), a follow-up in the past with a `prospectedAt`, completing an action with a body (and its copy in the history), five equal upserts at once (one lead, one action, no error), four different slugs with the same phone at once (one lead, three conflicts, no error), the import with `slug` and `nao_contatar` and no `etapa`, the export, and a full round trip (export, empty the database, import) that restored slugs, flags, phones, bodies and the history.
- **In the browser:** the text of the first action is shown whole with its line breaks and a copy button, the edit form shows it in a text area that keeps them, the mark shows on the lead and in the list, the menu switch works in both directions, and the console stayed clean.
- **The clipboard on Windows** turns `\n` into `\r\n` when the text is copied. The content is otherwise identical; it is the system, not Vetra.
- **`etapa` in the import is optional**, so the pipeline's CSV does not depend on the name of a stage. A customer (`cliente = sim`) still needs a stage, since it must be in the closing stage.

## Not done, on purpose

- **The migration `0022_add_pipeline_integration` is not applied to the real database.** Until it is, the development API (which now reads the new columns) fails against it. It was only run on temporary databases.
- Nothing is blocked by `doNotContact`; sending is the automations (VET-20).
- The pipeline's own side (the client, `lead.json`, `/vetra-sync`) is the other project.

## Changes after the user's review

- **"Definir ação" opens the "Nova atividade" sheet** (in the Leads list, on a lead and in the Painel), instead of a small popover. The sheet moved to `shared/components/next-actions`.
- **"Concluir" only completes.** It no longer asks for the next action: the popover, the form and the suggestion of the next follow-up (`suggestNextAction`) are gone, and `POST /next-actions/:id/complete` takes no body. A toast says "Atividade concluída." with **Desfazer**, which calls `POST /next-actions/:id/reopen`: the history row goes and the pending action comes back with its id and text. A lead left with no action shows in the Painel's "sem próxima ação".
- **Delete an activity**, from the **Editar atividade** sheet ("Excluir atividade", with a confirmation), through `DELETE /next-actions/:id`, with a toast and **Desfazer** through `POST /next-actions/restore` (the same id, text and date; 409 if it already exists, as notes do). A deleted action does not go to the history.
- Checked over HTTP (complete, complete again, unknown id, reopen, reopen twice, delete, delete again, restore, restore twice, restore for an unknown lead, an empty description) and in Chrome (one click completes, the toast and the undo, the confirmation, the undo of a deletion that keeps the text), with a temporary database that was dropped.
- **"Não contatar" still changes nothing in Vetra besides the mark**, the lookup and the CSV. What it should do in the app (a warning when sending, a confirmation, or a block) is the user's decision, pending.

## Changes after the code review

- **`compose.yaml`: Postgres is published only on this computer** (`127.0.0.1:5432`). It was on every network interface, with a fixed development password, which exposed every lead and WhatsApp message to the local network and contradicted the rule that nothing else may reach Vetra. An existing container only changes after `docker compose up -d` recreates it.
- **The new-activity sheet** starts clean each time it opens (the default date is "tomorrow" as of the opening) and, in a list, only exists after its button was clicked, instead of one form per row.
- **Completing and reopening an action twice at once** is now one success and a 404 for the rest, never a 500 (the delete decides inside the transaction). Checked with 8 simultaneous requests each.
- **`body` is optional** on `POST` and `PATCH /next-actions` (defaults to none), so a client that does not know the field still works. The limits that must stay equal (the text, the slug) say so in a comment.
- **Not done, on purpose:** the backup before an automatic migration (to be decided with VET-24); keeping the creation date of a reopened action (documented in `DATABASE.md` instead, since it needs a column and a migration for a date nobody sees); the mark on a customer's page; the index for the name plus city lookup.

## A route to read a lead's messages, for the pipeline

The lead's card route returns only the last 4 messages, too few for the pipeline to learn from a conversation. `GET /api/leads/:id/messages?limit=` (200 by default, 500 at most) returns the lead's messages, oldest first, with only direction, type, text and time (a deleted one has no text). It starts from a lead and finds the conversation by its phone, so no other conversation can be asked for. Details and limits in `PIPELINE-INTEGRATION.md`. Checked with a temporary database and a fake WAHA: the default and a given limit (the latest messages, oldest first), `hasMore`, the five fields and nothing else (no ids), refusals of 0, 501, -1 and a text, a lead with no conversation, an unknown lead, deleted messages with no text.

## The lookup by name alone

A lead typed by hand has no slug, so the pipeline could not find it for `/resultado`: the lookup only took a name together with a city, and a guessed slug matched nothing. `GET /leads/lookup?name=` without `city` now finds the leads whose name **contains** what was typed (ignoring case and accents), answering `matchedBy: ["name"]`; with `city` the rule is still an equal name in the same city (`name_and_city`). Both are hints for the user to confirm, never sure matches. A `%` or `_` in the text is only a character (it uses `position`, not `like`). Checked in an isolated database: the full name, a part of it, any case, with and without the accent, a word shared by two leads (both come), a name that is nowhere, the old name plus city rule, the phone and slug matches unchanged, and a name over 120 characters refused.
