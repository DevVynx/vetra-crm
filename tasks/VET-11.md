# VET-11 — Global search palette (Ctrl+K)

## Objective

Make the CRM search work as a global shortcut: a command palette that opens from any screen, searches the main records of the CRM at once and navigates straight to the one the user picks.

- **What:** a palette opened by `Ctrl+K` (and by the "Buscar" button that already exists, disabled, in the sidebar), backed by a single `GET /search` endpoint that returns grouped results.
- **Why:** today the only search lives inside each list (Leads, Clientes) and only looks at that list's own fields. Finding a note, a project or a follow-up means remembering which screen holds it.
- **Who benefits:** the CRM user, who can jump to any record without navigating first.
- **Problem solved:** one place to find leads, customers, projects, notes and next actions, and to jump to a page.
- **Architectural direction:** the screen only renders groups and handles the keyboard; the server owns what is searched and how it matches. Adding a new searchable kind later (for example the ledger) must mean adding one group on the server and one renderer on the web, not reworking the palette.

---

## Scope

- Global palette, opened by `Ctrl+K` anywhere in the app and by the sidebar's "Buscar" button, which only needs re-enabling. No new button is added.
- `GET /search` returning one result group per searchable kind.
- Searchable kinds: pages, leads, customers, projects, notes, next actions.
- Keyboard navigation and navigation to the chosen record.

Out of scope:

- Command actions ("Novo lead", "Novo cliente", "Alternar tema"). The palette only searches and navigates. A command group can be added later on top of the same structure.
- Ledger entries (income and expenses).
- Phone, e-mail and `slug` of a lead as searchable fields.
- Archived leads, and anything that belongs to an archived lead.
- Typo tolerance (fuzzy matching) and group prefixes such as `lead:` or `nota:`.
- "Recent" items on the empty palette.
- Changing the existing per-list search fields. They stay as they are, and `/` keeps focusing them.

---

## Functional Overview

### Opening and closing

- `Ctrl+K` opens the palette from any screen, including while typing in an input, and also toggles it closed. `Esc` closes it.
- The sidebar's "Buscar" button, which already shows the `Ctrl+K` hint, opens it too.
- Closing the palette clears the query.

### Matching

- One free-text term. A record matches when the term is contained in any of its searched fields, ignoring case and accents, the same rule as `containsSql` in the list searches.
- The query is sent after a 300 ms debounce, like the list searches.
- A query with fewer than 2 characters does not call the API and shows the empty-query state.

### Groups

Results are grouped, in this order. Each group shows at most 5 results. A group with no results is hidden.

| Group          | Searched fields                     | Opens                         |
| -------------- | ----------------------------------- | ----------------------------- |
| Páginas        | page title                          | the page                      |
| Leads          | business name, contact, niche, city | the lead detail               |
| Clientes       | business name, contact, niche, city | the customer detail           |
| Projetos       | project name                        | the project's customer detail |
| Notas          | note content                        | the lead detail that owns it  |
| Próximas ações | next action description             | the lead detail that owns it  |

- A lead that has a deal is a customer: it appears only in "Clientes", never in "Leads".
- Archived leads (those in a hidden stage) never appear, and neither do their notes and next actions. Projects belong to customers, so they follow the customer.
- Notes and next actions only come from leads the Leads list shows. A customer's notes stay stored but aren't searched, since no customer screen shows them. Closing a lead already deletes its next actions.
- "Páginas" is matched on the client (a fixed list: Painel, Leads, Clientes, WhatsApp, Configurações) and does not come from the API.
- Notes show a short excerpt around the match, not the whole content.

### States

- **Empty query (or fewer than 2 characters):** shows the "Páginas" group with all five pages.
- **Loading:** a skeleton in the results area, keeping the input interactive.
- **No results:** a message with the typed term and no groups. "Páginas" still filters locally, so a page can match even when the API returns nothing.
- **Error:** a message in Portuguese through `getErrorMessage`, with the input still usable.

### Selecting a result

- `↑` and `↓` move through the results across groups, `Enter` opens the active one, `Esc` closes. Hovering a result also activates it.
- Opening a result closes the palette and navigates to it.

---

## UI Elements

**Sidebar**

- The existing "Buscar" button, disabled until now, is re-enabled and opens the palette. On phones, where the sidebar is an overlay, it also closes the sidebar. The app header doesn't change.

**Palette (dialog)**

- A search input with the placeholder "Buscar leads, clientes, projetos, notas…".
- The grouped results below it, each group with a title.
- Each result shows: an icon for its kind, a primary line (business name, project name, note excerpt, action description), and a secondary line giving context (niche and city for leads and customers; the business name for projects, notes and next actions).
- A discreet footer with the keyboard hints `↑ ↓ navegar`, `Enter abrir`, `Esc fechar`.

---

## Requirements

- The palette must not know about leads, customers or projects. It renders groups of items and delegates how each kind is drawn and where it navigates to, so a new kind is one more group.
- The API only searches the kinds it declares. Client text is a bound parameter and never part of the SQL structure.
- The match rule must be shared with the list searches, not copied (`containsSql`).
- The visibility rule for archived leads must be the same one the Leads list uses, not a second definition of "archived".
- Each group is capped on the server (5), and the endpoint must stay fast with a debounced call per keystroke pause. Groups run in parallel.
- The shortcut must work while an input is focused. `useHotkey` ignores `Ctrl` combinations and typing targets by design, so the palette needs its own listener rather than bending `useHotkey`.
- Only one palette exists, mounted once in the app shell (`_app` layout), not per page.

---

## Backend Requirements

### Database

No schema changes or migrations.

### API

**`GET /search`:** new endpoint.

- Query: `q`, a string trimmed on the server, minimum 2 characters. A shorter or missing `q` is a `400`, like other invalid input.
- Response: one entry per group, in the order above, each with `items` (at most 5). Groups with no items are returned empty or omitted, as the contract defines; the web hides them either way.
- Item shape per group carries only what the palette needs: the record id, the primary text, the secondary text and the id needed to navigate (for notes, projects and next actions, the lead or customer id that owns them). Notes carry the excerpt, not the full content.
- Declared before any `/:id` style route if one is added under the same prefix.

### Core

- A new feature module for search in `packages/core`, with a service that asks each kind's repository for its matches in parallel and assembles the groups. Business rules ("a lead with a deal is a customer", "archived leads are hidden") live in the domain/service, not in the controller.
- Leads and customers reuse the visibility of the existing lists: leads only in visible stages, and a lead with a deal goes to the customers group.
- Notes and next actions join their lead and apply the same visibility rule as the Leads list.
- Each repository declares its searched columns the way `leadListWhere` does, reusing `containsSql` and `qualified()` where a column sits inside a subquery.

---

## Frontend Requirements

- `shared/routes`: a `searchRoutes` constant in `packages/routes`, and the contract in `packages/contracts` (a `search` folder with the request and response schemas, exported from the index).
- `features/search`: the `useSearch` query (debounced by the caller, disabled below 2 characters), the palette component, the per-kind result renderers and the page list.
- The palette is built on the existing dialog/command primitives in `shared/components/ui`; if no suitable `command` component exists there, add the shadcn one following `WEB-COMPONENTS.md` instead of hand-rolling a list.
- `AppSidebar` re-enables its "Buscar" button, and the palette is mounted once in the `_app` layout.
- Navigation uses the typed TanStack Router links already used by the app (`/leads/$leadId`, `/customers/$customerId`).
- Errors go through `getErrorMessage` with a Portuguese fallback; all UI text is Portuguese and hardcoded.
- Respect loading, empty, no-results and error states described above, and work at phone width (the dialog fills the screen).

---

## Technical Notes

- No factories: plain exported functions only, with rules in `domain.ts` when there are any.
- Input validated with Zod in `packages/contracts`, on the API and on the web.
- The endpoint is read-only and the API stays bound to `127.0.0.1` with no authentication.
- Text matching uses the `unaccent` extension already enabled for the list searches.
- Do not persist anything: no recents, no search history.
- Do not add a parallel search system. The list searches and the palette share `containsSql` and the archived-lead rule.
- Testing: no automated tests, as in VET-9 and VET-10. Verify the API over HTTP and the palette in the browser.

---

## Acceptance Criteria

- `Ctrl+K` opens and closes the palette from every page, including while an input is focused; the sidebar's "Buscar" button opens it too.
- With fewer than 2 characters, only the five pages are listed and no request is made.
- Searching a term finds leads, customers, projects, notes and next actions that contain it, ignoring case and accents, grouped in the specified order and capped at 5 per group.
- A lead with a deal appears under "Clientes" only; archived leads, their notes and next actions, and the notes of customers never appear.
- Each result opens the right screen: lead detail, customer detail, or the owning lead or customer for notes, projects and next actions.
- `↑ ↓ Enter Esc` work, hovering activates a result, and closing clears the query.
- Loading, no-results and error states render as described, and "Páginas" still match locally when the API returns nothing.
- A `q` shorter than 2 characters on the API returns `400`.
- The per-list search fields and the `/` shortcut behave exactly as before.
- The palette works at phone width with no horizontal scroll.
- `pnpm format`, `pnpm check-types`, `pnpm lint` and `pnpm build` pass, with no console errors.

---

## Project References

The executing agent must read these before starting:

- `docs/guides/ADDING-A-FEATURE.md`, the end-to-end walkthrough for a new feature
- `docs/guides/API-MODULES.md`, `docs/guides/API-VALIDATION.md`, `docs/guides/SHARED-CONTRACTS.md`
- `docs/guides/DOMAIN-MODELING.md`
- `docs/guides/WEB-VITE-OVERVIEW.md`, `docs/guides/WEB-VITE-DATA-LAYER.md`, `docs/guides/WEB-COMPONENTS.md`
- `packages/core/src/features/leads/repositories/leadListWhere.ts` and `packages/core/src/features/customers/repositories/findCustomersPage.ts`, the model for search columns and visibility
- `apps/web/src/shared/hooks/useHotkey.ts`, to see why the palette needs its own listener

Project-specific decisions that apply to this issue:

- Single `Lead` entity: a customer is a lead plus a `deals` row, there is no customers table.
- Hard delete everywhere, so no deleted-record filter is needed.
- The API stays bound to `127.0.0.1`, with no authentication.
- UI text is Portuguese, hardcoded; the backend is language-neutral.
