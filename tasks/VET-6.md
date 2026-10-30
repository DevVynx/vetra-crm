# VET-6 — Reusable filter component for the Leads and Customers lists

## Objective

Replace the single-value filter chips of the Leads and Customers lists with a reusable, Linear-style filter component: a bar of filter chips, each one `field · operator · value(s)`, built from a declarative field configuration supplied by the screen.

- **What:** a generic filter bar (button, chips, "+" menu, keyboard shortcuts) plus the shared filter-expression contract that the API will use to filter lists.
- **Why:** the current chips allow only one value at a time (a stage, "without next action" or "archived"), so they cannot express "city is Ipatinga and last contact before 30 days ago". Every new list in Vetra will need this, so it must not be tied to leads.
- **Who benefits:** every user of the CRM (the product is shared with the ViziClub community), and every future list.
- **Direction:** the component only renders and edits a filter expression; it never filters data. The screen owns the expression (kept in the URL), and the backend (the mock for now) applies it.

---

## Scope

- Generic component under `shared/components/filters/`, fed entirely by props: field definitions, option sources, current value, change handler.
- Filter expression schema in `packages/contracts`, shared by the web app and the API.
- `filters` query param on the Leads and Customers list endpoints (replacing `filter`), and on the app URLs.
- Option endpoints for fields whose values come from data (niche and city), with mock implementations.
- Apply the component to the Leads list and to the Customers list, replacing `FilterChips`.
- Keyboard shortcuts for adding and navigating filters.

Out of scope: saved filters, advanced (nested / OR between fields) filters, drag-reordering of filters, filtering by lists other than Leads and Customers, real database queries (the backend does not exist yet; the mock layer stands in for it).

---

## Functional Overview

### Filter model
- A **filter** is `{ field, operator, values }`. A list has an array of filters.
- **Between filters:** AND (all must match). **Between values of one filter:** OR.
- A field can be used **once**. A field already in use disappears from the add menu.
- Filters apply immediately; there is no apply or confirm button.
- Changing any filter resets the page to 1.

### Operators by field type
| Type | Operators (UI label) |
| --- | --- |
| Select | é, não é, é um de, não é um de |
| Text | contém, não contém |
| Number | igual, maior que, menor que, entre |
| Date | antes de, depois de, entre, nos últimos N dias |
| Yes/No | é |

With one selected value the operators are "é / não é"; with several they become "é um de / não é um de" automatically.

### Fields of the first version
**Leads**
- Etapa (select): Prospectado, Demo publicado, Abordagem enviada, Conversando, Reunião, Proposta enviada, Sem resposta, Perdido
- Nicho (select, options from data)
- Cidade (select, options from data)
- Próxima ação (yes/no: has or has not a next action)
- Último contato (date)
- Prospectado em (date)

**Customers**
- Nicho, Cidade (select, options from data)
- Valor fechado (number, BRL)
- Mensalidade (yes/no: has or has not a monthly fee)
- Projeto em andamento (yes/no)
- Fechado em (date)

### Leads without a value
A lead that was never contacted (no `lastContactAt`) never matches a date operator of "Último contato".

### Archived leads (business rule)
"Sem resposta" and "Perdido" are archived stages and are **out of every result by default**. They appear only when an Etapa filter with **é** or **é um de** explicitly includes them. A "não é" or "não é um de" never brings archived leads in (so "Etapa não é Prospectado" means "the other active stages"). No other filter reveals archived leads. The separate "Arquivados" chip disappears: it is just Etapa é Perdido / Sem resposta.

### Counts
The per-chip counts ("Prospectado 9") disappear with the chips, and the `counts` field of the list responses is removed because only the chips used it. The total shown at the bottom left of the lists ("44 leads") is a different value (`total`) and stays: it now reflects the filtered set.

---

## UI Elements

**Filter bar** (in the row where the chips are today; the search field stays below it)
- Funnel icon button at the right end of the row. It shows or hides the bar. The bar is always visible while at least one filter is active.
- Filter chips on the left, in order of creation, each: field icon + field name, operator (muted, clickable), value(s) (clickable), and an X that removes that filter.
- A "+" button right after the last chip, labelled "Filtro" while there are no chips, opens the add menu.
- "Limpar" button at the right end, visible only while filters are active.

**Add-filter menu**
- Search input ("Filtrar...") with the `F` hint, focused when the menu opens.
- List of the fields not yet used, each with its icon and a submenu arrow.
- Selecting a field opens its value picker; selecting the value(s) creates the filter.

**Value picker**
- Select: searchable list; multiple values can be toggled (checkbox style). Shows a loading state while options load and an empty state when nothing matches.
- Text: input. Number: BRL-masked input (one or two for "entre"). Date: the existing `DateTimePicker` in date-only mode, or a number input for "nos últimos N dias". Yes/No: two options.

**Operator menu:** clicking the operator of a chip lists the operators allowed for that field type.

**Keyboard**
- `F` opens the add menu (ignored while typing or with another overlay open, like the other hotkeys).
- `↑` `↓` move through the list, `→` or `Enter` opens the field's values, `←` goes back, `Esc` closes.
- Typing filters the list. `Enter` confirms the highlighted option; in multi-select, `Enter` toggles and `Esc` closes.

---

## Requirements

- The component is **data-agnostic**: no Leads or Customers knowledge inside `shared/components/filters/`. Everything specific comes through props.
- Field definition (declarative): `id`, `label`, `icon`, `type`, allowed operators (defaults per type) and, for select fields, an options source that is either a static list or an async function. Types must be a closed union, with no `any`.
- The value is **controlled** (`value` + `onChange`) so the screen can keep it in the URL.
- `filters` in the URL is the filter array encoded as JSON, e.g. `filters=[{"field":"stage","operator":"is_any_of","values":["prospected"]}]`. It is validated with Zod when read; an invalid or tampered value is ignored (no filters), never an error screen.
- Operator identifiers are stable English tokens in the contract (`is`, `is_not`, `is_any_of`, `is_none_of`, `contains`, `not_contains`, `eq`, `gt`, `lt`, `between`, `before`, `after`, `last_days`); Portuguese labels live only in the UI.
- Numbers travel in cents, dates as ISO strings.
- Reuse existing abstractions: `Popover`, `DropdownMenu`, `Checkbox`, `useHotkey`, `useListNavigation`, `DateTimePicker`, `masks.ts`, `selectedChoiceClass`. Colors only through tokens.
- Components stay around 200 lines; split the bar, chip, add menu, value picker and keyboard logic.

---

## Backend Requirements

The backend does not exist yet; the mock layer (`shared/mocks`) implements the same contract so the swap is mechanical.

### Contracts (`packages/contracts`)
- `filterExpressionSchema`: discriminated union by field type, with the operators and value shape of each, plus the allowed `field` ids per list.
- `listLeadsQuerySchema` and `listCustomersQuerySchema`: remove `filter`, add `filters` (JSON string parsed and validated into an array, default empty). Remove `counts` from both responses and the `leadListFilterSchema` / `customerListFilterSchema` enums.
- New schemas for the option endpoints (`{ items: { value, label }[] }`).

### API
- `GET /leads` and `GET /customers` accept `filters` and apply it server-side before pagination, so `total` and pages reflect the filtered set.
- `GET /leads/filter-options` and `GET /customers/filter-options`: distinct existing values for Nicho and Cidade, sorted alphabetically.
- Archived rule is enforced by the API, not only by the UI.
- Unknown field or operator for the list is a validation error handled by the existing error mapping.

### Database
No change now. The future real implementation should translate each operator into a query condition; the "yes/no" fields are derived (next action exists, monthly fee exists, active project exists), not stored.

---

## Frontend Requirements

- Replace `FilterChips` in `LeadsPage` and `CustomersPage`; remove the stage and "without next action" chip logic, `leadFilterLabels` and `customerFilters` constants that only served the chips (keep `isLiveStage` and `liveStages` if still used).
- Routes: replace the `filter` search param with `filters` in `leads.index.tsx` and `customers.index.tsx`.
- Queries: the list hooks send `filters`; add `useLeadFilterOptions` and `useCustomerFilterOptions` in the feature `queries/`, with query keys following the existing convention.
- Loading / error / empty: option lists show a loading state and an error message in Portuguese (`getErrorMessage`); the list keeps its current empty state, now with "Limpar filtros" clearing the expression and the search.
- Show the list keeping previous data while the new filtered page loads (as it already does).
- Responsive: on narrow screens the chips wrap onto more lines and the add menu stays inside the viewport.
- All text in Portuguese, with placeholders where there are inputs.

---

## Technical Notes

- Reuse existing abstractions; no parallel filter system next to the old chips once they are replaced.
- Keep the component decoupled from routing: the URL read and write live in the page, the component never touches the router.
- Keep the expression serialization and the archived-visibility rule in pure functions so they can be tested and later reused by the API.
- The mock must apply the same semantics as the future API (AND between filters, OR between values, archived rule), so behavior does not change when the real backend arrives.
- No comments except for non-obvious decisions (the archived rule is one).

---

## Testing Requirements

No automated tests in this task (the repository has no test runner configured). Verify manually against the acceptance criteria and with the headless-browser smoke script used in previous tasks.

Keep the pure logic (expression parsing and serialization, operator availability per type, archived-visibility rule, mock filtering) in standalone functions with no React or DOM dependency, so tests can be added later without refactoring.

---

## Acceptance Criteria

- The funnel button shows and hides the bar; the bar stays visible while any filter is active.
- `F` opens the add menu with the search focused, from both lists, and does not fire while typing or with an overlay open.
- `↑` `↓` `→` `←` `Enter` `Esc` work as described in the menu and in the value picker.
- A field already in use is not offered again; removing its chip offers it again.
- One value shows "é / não é"; several values show "é um de / não é um de".
- Every field of both lists works with all its operators, and results, `total` and pagination reflect the filtered set.
- Archived leads appear only with Etapa "é" or "é um de" including them, and never with "não é" or any other filter; with no Etapa filter the list is as today.
- "Limpar" removes every filter; the X of a chip removes only that one; the page returns to 1 on any change.
- The `filters` param is in the URL, survives reload and back/forward, and an invalid value is ignored without errors.
- The old chips, their counts and the `filter` param and `counts` field are gone, with no dead code left.
- The component lives under `shared/components/filters/` with no Leads or Customers knowledge, and a third list could use it by supplying only a field configuration.
- The total at the bottom left reflects the filtered set.
- `pnpm lint`, `pnpm check-types` and `pnpm build` pass.

---

## Project References

The executing agent must read these before starting:
- `docs/guides/WEB-COMPONENTS.md`
- `docs/guides/DESIGN-TOKENS.md`
- `docs/guides/WEB-VITE-DATA-LAYER.md` (including "Shared queries and mutations")
- `docs/guides/SHARED-CONTRACTS.md`
- `docs/guides/API-VALIDATION.md`

Project-specific decisions that apply to this issue:
- UI text is Portuguese and hardcoded; contract identifiers are English.
- No `any`; prefer `type` over `interface`; no comments that restate the code.
- Queries and mutations live in `features/<name>/queries`; they move to `shared/` only when a second feature needs them.
- Archived = stage `lost` or `no_response`; the stage where an archived lead stopped is kept in `stoppedAtStage`.
- The API must only listen on `127.0.0.1`; never widen CORS or hardcode secrets.
- Commits only on request, via `/pragmatic-commit`.
