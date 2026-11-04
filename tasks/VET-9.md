# VET-9 — Real backend replacing the front-end mock layer

## Objective

Build the real backend for everything the mock layer in `apps/web/src/shared/mocks` covers today (except WhatsApp), switch the web app to it, and delete the mock layer.

- **What:** PostgreSQL schema (Drizzle), domain logic in `packages/core`, HTTP endpoints in `apps/api`, typed paths in `packages/routes`, and the web data layer calling the API instead of the `*MockApi` objects.
- **Why:** the front-end is functionally complete against mocks, but data resets on every reload and the business rules live in the browser.
- **Who benefits:** the CRM user, who gets persistent data, and future ViziClub users who run Vetra locally, possibly in other countries, which is why the time zone becomes a setting.
- **Problem solved:** Vetra becomes usable day to day. Stage rules, deal payment, ledger and dashboard numbers are computed and enforced on the server.
- **Architectural direction:** the contracts in `packages/contracts` are the agreed shape and the mock is the behavioral spec. The backend implements both. Contract changes are the exception: limit them to what this issue lists, and call out anything else before doing it.

---

## Scope

- **Profile:** get and update, with `name` and the new `timeZone`.
- **Stages:** list, lead counts, create, update, reorder, delete (with the lead-moving rules), and the default preset created automatically.
- **Leads:**
  - list (search, shared filter expression, pagination, current ordering), filter options, detail, create, update, delete
  - change stage (single and bulk) and restore the previous stage
  - close as won (flexible payment)
  - notes (create, update, delete, restore) and next actions per lead
- **Customers:**
  - list (filters), filter options, detail, create (with deal payment), update, delete (with a typed-name confirmation)
  - ledger: list with filters, create, update, delete, restore
  - projects: list with financial summary, create, update, delete (entries become unlinked)
- **Dashboard:** summary, revenue, funnel, prospecting, conversion by niche, next actions (list, create, update, complete), and leads without a next action.
- **Server-side filter engine:** evaluates the shared filter expression in SQL and replaces `filterEngine.ts`.
- **Time zone:**
  - a per-profile IANA time zone, default `America/Sao_Paulo`
  - used by the server for date boundaries and by the web for displaying dates
  - a "Fuso horário" row in Configurações → Perfil
- **Dev seed:** `pnpm db:seed` with realistic demo data.
- **Removal:** delete `apps/web/src/shared/mocks` and everything that imports it.
- **Docs:** update `DATABASE.md` (hard delete), the decisions log in `PROJECT-OVERVIEW.md`, and `WEB-VITE-OVERVIEW.md` (the time zone rule: calendar reads such as "which day is this?" go through `shared/time-zone/zonedDate`, because `date-fns` computes in the zone of the date it receives; Zustand and `@date-fns/tz` in the stack).

Out of scope:

- WhatsApp / WAHA: no tables, no endpoints, and the WhatsApp areas show an empty state.
- The onboarding / first-run setup.
- AI features and integration with the prospecting pipeline.
- Authentication, which is excluded by design.
- Profile photo.
- Automated tests.

---

## Functional Overview

### Lead and customer

- A customer **is** a lead that was closed as won. There is a single `leads` row per person, holding identity and contact data, and it is shared by both views.
- The sale data lives apart from it, in a `deals` row (1:1 with the lead) created at closing. "Is a customer" means "has a deal"; `deals` is the single source of truth for this. Installments, expenses and projects belong to the customer through the lead id.
- The Leads screens never read deal data. The Customers screens read the lead joined with its deal.
- Closing a lead that already has a deal is rejected with a conflict error.
- Closing a lead and creating a customer directly each happen in a single transaction: the lead (or new lead), the deal, the paid entry and the generated installments are written together.

### Deleting and undo

- Rows are **hard deleted**; there is no soft delete. Children are removed with the parent:
  - lead → notes and next actions
  - customer → deal, installments, expenses, projects, notes and next actions
- Deleting a project sets `project_id` to null on its ledger entries and never deletes them.
- **Excluir cliente** requires typing the customer's business name to confirm. The dialog states explicitly that the customer, the whole financial history, the projects, the notes and the next actions will be permanently erased. Other deletions keep their current confirmations.
- Undo keeps working exactly as today. The previous state is held only in the toast's closure in the browser, so nothing is stored on the server and a page reload discards it:
  - **Undo a creation:** the front deletes the created item.
  - **Undo an edit** (lead, customer, note, project, ledger entry): the front sends the previous values through the regular update endpoint. The row never stopped existing, so `created_at` is untouched; `updated_at` reflects the undo.
  - **Undo a deletion** (note, ledger entry): the front sends the full item it kept to a `restore` endpoint. The server re-inserts it with the **same id and the same `created_at`**. A ledger entry whose project no longer exists is restored without a project.
  - **Undo a stage change** (single and bulk): it uses a `restore` endpoint that writes back the previous stage **and the previous `stage_changed_at`**, not a regular stage change.

### Time zone

- The profile stores an IANA time zone, default `America/Sao_Paulo`.
- The database and every API payload stay in UTC.
- The server reads the profile time zone when it needs local boundaries:
  - "hoje" and "atrasada" for next actions
  - the dashboard periods (today, week, month, …)
  - the monthly revenue buckets
  - the weekly prospecting buckets, which keep starting on Monday
- The web formats every displayed date and time in the profile time zone, not in the browser's zone. Date inputs, such as due dates and the next-action date and time, are interpreted in the profile time zone and sent as UTC.
- Changing the time zone in Configurações invalidates the queries that depend on it.

### Stages

- Same rules as VET-8:
  - roles: exactly one entry and one closing stage, at least one middle and one archive stage
  - delete moves the stage's leads to the previous stage, in one transaction
  - entry, closing, the last middle stage and the last archive stage cannot be deleted
- The rules move from `mocks/stageRules.ts` to `packages/core`.
- The default preset (VET-8) and the profile ("Maria Souza", `America/Sao_Paulo`) are created automatically when missing, so a fresh database always works. Initial setup through an onboarding flow comes later.

### Deal payment

- Same rules as today's `dealPayment` contract and `openWonDeal`:
  - received ≤ closed value
  - the first-installment due date is required only when there is a remainder and at least one installment
  - the paid entry is labeled "Entrada" (or "Pagamento à vista" when it covers the whole value)
  - installments are monthly and labeled "Parcela i de n", with the rounding remainder added to the last one
  - billing total = max(closed value, sum of installments)
- The rules move to `packages/core`.

### Lists, filters and ordering

- Lead and customer lists, and the customer ledger, are filtered on the server with the shared filter expression (`packages/contracts/src/filters`), keeping the same fields and operators the web offers today.
- Unknown fields and invalid operators are rejected as validation errors.
- Filter options (distinct niche, city, …) come from the database.
- Ordering stays exactly as the mock does today: leads with an overdue next action first, then prospecting order; ledger and other lists as today.
- Pagination keeps the contract's `page` / `pageSize` (default 25, max 100).

### Computed data

These are computed at query time and never persisted:

- the project `financial` summary
- the customer `billing` / `financial` / `projectMetrics`
- every dashboard number
- the stage lead counts

### WhatsApp areas

The lead conversation panel and the Painel "Conversas aguardando resposta" block show an empty state, "WhatsApp ainda não conectado". Their mock data is removed together with the rest of the mock layer.

---

## UI Elements

**Configurações → Perfil**

- New "Fuso horário" row: a searchable combobox listing `Intl.supportedValuesOf("timeZone")`, each option showing the zone name and its current UTC offset (e.g. "America/Sao_Paulo (UTC−3)"). Saving updates the profile.

**Excluir cliente dialog**

- An explicit warning listing everything that will be erased.
- A text input that must match the customer's business name exactly before the destructive button is enabled.

**Lead conversation panel / Painel "Conversas aguardando resposta"**

- Empty state: "WhatsApp ainda não conectado".

No other screen changes. All existing screens keep their layout and behavior; they only switch from mock data to the API.

---

## Requirements

- **Code style:** no factories. Repositories, services and controllers are plain exported functions that import their collaborators directly. No `createXService({ deps })`, no closures that return functions, and no classes, except the `DomainError` subclasses.
- One file per repository query and one file per service action, grouped by the barrel `index.ts` into `<name>Repositories` / `<name>Services` (`API-MODULES.md`).
- Business rules are pure functions in `packages/core/src/features/<name>/domain.ts` (`DOMAIN-MODELING.md`): stage invariants and delete moves, deal payment and installment generation, project financial summary, and time-zone boundary helpers.
- Controllers parse input with the contract schema, call exactly one service, and shape the response with the contract schema.
- Domain errors extend the existing `DomainError` categories, are added to the `DomainError` → `HttpError` registry, and are shown in Portuguese on the web through `getErrorMessage`. Examples:
  - lead not found
  - lead already closed (conflict)
  - stage cannot be deleted (conflict)
  - invalid stage order
  - project not found
- **Security:**
  - the API listens on `127.0.0.1` only
  - CORS allows only the web origin
  - no secrets in code
  - every input is validated with Zod
  - the time zone is validated as an IANA zone the runtime supports
- **Persistence:**
  - money is integer cents
  - instants are `timestamptz` in UTC
  - ids are uuid v7 generated in the domain layer (`DATABASE.md`)
- Multi-row operations are transactional: close lead, create customer, delete stage, delete customer, bulk stage change, and restore of a bulk stage change.
- Contract changes are limited to:
  - `timeZone` on the profile
  - restore request shapes where the mock helpers had none
  - anything else proven missing, called out before it is made

---

## Backend Requirements

### Database

One schema file per resource in `packages/database/src/schema`; migrations generated with `db:generate` and applied with `db:migrate`. All tables have `id`, `created_at` and `updated_at` (`common.ts`); none has `deleted_at`.

| Table          | Feature fields                                                                                                                                                                                            |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `profile`      | Single row. `name`, `time_zone`.                                                                                                                                                                          |
| `stages`       | `name`, `color` (hex), `role` (entry / middle / closing / archive), `position`.                                                                                                                           |
| `leads`        | Every field of the current lead contracts (business, contact, niche, city, slug, source and prospecting dates, …). `stage_id` → `stages`. `stopped_at_stage_id` → `stages`, nullable. `stage_changed_at`. |
| `lead_notes`   | `lead_id` → `leads`, cascade. `content`.                                                                                                                                                                  |
| `next_actions` | `lead_id` → `leads`, cascade. Fields from the next-action contract (due instant, description, completion).                                                                                                |
| `deals`        | `lead_id` → `leads`, unique, cascade. `closed_at`, `closed_value_in_cents`, `document`, `monthly_fee_in_cents`.                                                                                           |
| `installments` | `lead_id` → `leads`, cascade. `project_id` → `projects`, set null. `label`, `amount_in_cents`, `due_at`, `paid_at`.                                                                                       |
| `expenses`     | `lead_id` → `leads`, cascade. `project_id` → `projects`, set null. Fields from the ledger contract.                                                                                                       |
| `projects`     | `lead_id` → `leads`, cascade. `name`, `status`, value and dates from the project contract.                                                                                                                |

- Indexes cover foreign keys and the fields used by filters, ordering and dashboard ranges: `leads.stage_id`, `leads.niche`, `leads.city`, the prospecting date, `next_actions.due_at`, `installments.due_at` and `paid_at`, and the ledger dates.
- An idempotent bootstrap creates the profile and the stage preset when missing.
- The existing `deletedAtColumn` helper and the soft-delete section of `DATABASE.md` are removed.

### API

Typed paths in `packages/routes`, under `/api`. Paths are resource-oriented and mirror the mock methods one to one:

- `/profile`
- `/stages`, `/stages/order`, `/stages/lead-counts`
- `/leads`, `/leads/filter-options`, `/leads/stage`, `/leads/stage/restore`, `/leads/:id`, `/leads/:id/stage`, `/leads/:id/close`, `/leads/:id/notes`, `/notes/:id`, `/notes/restore`, `/leads/:id/next-actions`
- `/customers`, `/customers/filter-options`, `/customers/:id`, `/customers/:id/ledger`, `/customers/:id/ledger/:entryId`, `/customers/:id/ledger/restore`, `/customers/:id/projects`, `/customers/:id/projects/:projectId`
- `/dashboard/summary`, `/dashboard/revenue`, `/dashboard/funnel`, `/dashboard/prospecting`, `/dashboard/conversion-by-niche`, `/dashboard/next-actions`, `/dashboard/leads-without-next-action`, `/next-actions/:id`, `/next-actions/:id/complete`

Payloads follow the existing contracts. Lists support the shared filter expression, pagination where the contract has it, and the current ordering.

### Dev seed

`pnpm db:seed` (development only) wipes the data and inserts realistic demo data:

- about 20 leads spread across every stage, including the archive stages
- 5 customers with deals covering different payment shapes (paid in full, down payment plus installments, installments only), some paid and some overdue installments, expenses, and projects in production and delivered
- notes, and next actions that are overdue, due today and in the future
- the default stage preset and the profile

---

## Frontend Requirements

- Replace every `*MockApi` call inside the existing `queries/` and `mutations/` hooks with the axios client (`WEB-VITE-DATA-LAYER.md`). Hooks and components keep their public API.
- Undo flows keep their current UX and call the new `restore` endpoints where they called mock `restore*` helpers.
- **Dates:**
  - a central date-formatting helper using the profile time zone, e.g. with `@date-fns/tz`
  - every displayed date goes through it, and everything that depends on the current time (greeting, "hoje", "atrasada", due-date shortcuts, chart buckets) uses the profile zone instead of the browser's
  - date and time inputs convert from the profile zone to UTC
- **Configurações:** add the "Fuso horário" row in `ProfileSettings`, using a searchable combobox. The project has none yet: install the shadcn / Base UI combobox or the Dice UI `combobox`, adapting imports to `@/shared/components/ui`.
- **Excluir cliente:** typed-name confirmation in `CustomerActionsMenu`, reusing the existing dialog components.
- Loading, error and empty states stay as they are, with errors through `getErrorMessage`.
- Zustand may be used for client-only state if a need appears.
- Remove `apps/web/src/shared/mocks` and every import of it.

---

## Technical Notes

- Implementation is incremental, with a pause for the user's review after each block, in this order:
  1. foundation + Profile with time zone (end-to-end reference) + Portuguese error messages in `getErrorMessage`
  2. Stages (backend), together with the `leads` table schema, since lead counts and stage deletion move leads
  3. Leads core and filter engine (backend)
  4. Notes and next actions (backend)
  5. Closing and customers (backend)
  6. Ledger and projects (backend)
  7. Dashboard (backend)
  8. Front-end switch: every hook moves from the mock to the API at once, dates shown in the profile time zone, time-zone change invalidates dependent queries, seed, mock removal and docs
- Blocks 2–7 are backend only, verified over HTTP against the database. The mocks share state (leads reference mock stage ids; customers and the dashboard read the same mock leads), so switching one screen at a time would break the others. The front-end keeps running fully on the mock until block 8. Profile was the exception because nothing else depends on it.
- Block 8 still commits per feature, so each switch stays reviewable on its own.
- Time-zone handling stays centralized: one domain helper for boundaries on the server and one formatting helper on the web.
- Mock-only helpers (`respond()` latency, `linkMockEntriesToProjects`, fixtures) do not move to the backend; the seed builds its data directly.
- Behavior must not depend on stage names, only on roles and positions.
- Each block ends with `pnpm format`, `pnpm check-types`, `pnpm lint` and `pnpm build` passing; backend blocks are checked over HTTP, block 8 in the browser.

---

## Testing Requirements

Automated tests are out of scope for this issue, by decision. Verify each block manually in the browser, covering:

- stage invariants and delete moves
- deal payment shapes
- restore with the same id and `created_at`
- stage-change undo restoring `stage_changed_at`
- dashboard boundaries with a non-Brazilian time zone

---

## Acceptance Criteria

- Every screen works against the API with data persisted in PostgreSQL; reloading keeps the data.
- `apps/web/src/shared/mocks` no longer exists and nothing imports it.
- A fresh database (after `db:migrate` and starting the API) opens the app with the stage preset and the profile and no errors; `pnpm db:seed` fills it with the demo data.
- **Deletes:**
  - hard deletes cascade as described
  - deleting a project leaves its entries without a project
  - "Excluir cliente" requires typing the business name
- **Undo:**
  - every existing undo still works
  - restored notes and ledger entries keep their id and `created_at`
  - undoing a stage change restores the previous `stage_changed_at`
- Closing an already closed lead returns a conflict shown in Portuguese.
- Stage rules, deal payment and the project financial summary behave exactly as with the mock.
- **Time zone:**
  - changing it in Configurações updates displayed dates and the dashboard boundaries
  - the database and the API stay in UTC
  - the default is `America/Sao_Paulo`
- WhatsApp areas show "WhatsApp ainda não conectado".
- No factory functions in `packages/core` or `apps/api`; rules live in `domain.ts`.
- The API binds to `127.0.0.1` only and CORS allows only the web origin.
- `DATABASE.md` and the `PROJECT-OVERVIEW.md` decisions log reflect hard delete, customer = lead + deal, and the profile time zone.
- `WEB-VITE-OVERVIEW.md` documents the time zone rule for calendar reads and lists Zustand and `@date-fns/tz` in the stack.
- `pnpm format`, `pnpm check-types`, `pnpm lint` and `pnpm build` pass; there are no console errors.

---

## Project References

The executing agent must read these before starting:

- `docs/project/PROJECT-OVERVIEW.md`
- `docs/guides/ADDING-A-FEATURE.md`
- `docs/guides/API-OVERVIEW.md`, `docs/guides/API-MODULES.md`, `docs/guides/API-VALIDATION.md`
- `docs/guides/DOMAIN-MODELING.md`, `docs/guides/ERROR-HANDLING.md`
- `docs/guides/DATABASE.md`
- `docs/guides/SHARED-CONTRACTS.md`
- `docs/guides/WEB-VITE-DATA-LAYER.md`, `docs/guides/WEB-COMPONENTS.md`
- `apps/web/src/shared/components/filters/README.md`
- `apps/web/src/shared/mocks/*` (behavioral spec), `tasks/VET-8.md` (stage rules)

Project-specific decisions that apply to this issue:

- No factories: plain exported functions only.
- Hard delete with client-held undo; this replaces the soft-delete convention in `DATABASE.md`.
- Customer = lead + `deals` row (1:1); no separate customers table.
- UTC everywhere in storage and the API; the profile time zone (default `America/Sao_Paulo`) drives local boundaries and display.
- No automated tests in this issue.
- WhatsApp stays out; the UI shows an empty state.
- One block at a time, with review before the next.
