# VET-10 — Sorting on the Leads and Customers tables, and a better bulk selection

## Objective

Let the user choose how the Leads and Customers tables are ordered, through a reusable "Ordenar" control, and improve the bulk selection on the Leads table.

- **What:** a reusable sort control in `shared/components`, server-side sorting on both list endpoints, the bulk actions moved from the floating bar to the table header, and a "select all" that reaches every page.
- **Why:** each table has a single fixed order today. On Leads it follows the next action date, so the other columns look unordered. The bulk bar floating at the bottom of the screen is also not liked, and selection cannot go past the current page.
- **Who benefits:** the CRM user, who works through longer lists.
- **Problem solved:** finding and acting on leads and customers by any relevant column, and acting on a whole filtered result.
- **Architectural direction:** follow the filter system. A screen only describes its options, the state lives in the URL, and the data owner does the work in SQL.

---

## Scope

- Reusable sort control, with one criterion at a time.
- Sorting on `GET /leads` and `GET /customers`.
- Bulk selection on Leads: actions in the table header, stronger highlight of selected rows, and "select all" across pages.
- A new endpoint returning the ids of every lead matching the current search and filters.

Out of scope:

- Sorting by more than one criterion.
- Sorting by stage.
- Sorting other lists (ledger, projects, dashboard blocks).
- Bulk selection on Customers.
- New bulk actions. "Mudar etapa" and "Arquivar" stay the only ones; closing a lead stays out because it needs the deal data.
- Always-visible checkboxes: selection stays behind the "Selecionar" button.

---

## Functional Overview

### Sorting

The button sits next to "Filtrar" on both pages and opens a menu with "Ordenar por" (the options) and the direction.

| Leads              | Customers                | Starting direction |
| ------------------ | ------------------------ | ------------------ |
| **Próxima ação** ★ |                          | Most urgent first  |
| Data de prospecção | **Data de fechamento** ★ | Most recent first  |
| Último contato     |                          | Most recent first  |
|                    | Valor fechado            | Highest first      |
|                    | Valor recebido           | Highest first      |
|                    | Mensalidade              | Highest first      |
| Nome do negócio    | Nome do negócio          | A → Z              |
| Nicho              | Nicho                    | A → Z              |
| Cidade             | Cidade                   | A → Z              |

★ The current fixed order, kept as the default.

- Choosing an option applies its starting direction; the user can then invert it.
- Empty values come last in either direction (a lead without a last contact, a customer without a monthly fee).
- Text ignores case and accents.
- Ties always resolve the same way, ending on the id, so no record repeats or disappears between pages.
- "Próxima ação" keeps today's rule: leads without a next action come last, and among those the newest prospect comes first.
- Changing the order returns to page 1.
- The order is kept in the URL, like the filters, so it survives opening a record and going back.
- "Limpar filtros" clears the search and the filters and keeps the order.

### Bulk selection (Leads)

Unchanged:

- The button alternates between "Selecionar" and "Concluir seleção", and checkboxes only exist while selecting.
- While selecting, clicking a row toggles it, `Espaço` toggles the active row, and `Esc` ends the selection.
- A bulk action ends the selection, with the current toast and undo.

Changed:

- The floating bar is removed. With at least one lead selected, the table header turns into the action bar.
- Selected rows get a stronger highlight.
- With the whole page selected and more leads matching, a "Selecionar todos os N" link selects every lead matching the current search and filters, including other pages.
- The selection survives changing page, and is cleared by changing the search, the filters or the order. The selection mode itself stays on.

---

## UI Elements

**Sort button (Leads and Customers headers)**

- Reads "Ordenar" on the default order, and "Ordenar: Cidade ↑" on any other.
- Hotkey `O`, shown in its title like the "F" of "Filtrar".
- Menu: the options, marking the active one; the direction; and "Restaurar padrão" when the order is not the default.

**Table header while selecting (Leads)**

- No lead selected: the normal column headers, with the page checkbox.
- At least one lead selected: page checkbox (checked or indeterminate), "N selecionados", the "Selecionar todos os N" link when it applies, then "Mudar etapa" and "Arquivar".
- "Mudar etapa" opens downwards, since the bar is no longer at the bottom.

---

## Requirements

- The sort control knows nothing about leads or customers: a screen passes its options, its current value and a change handler.
- The API only accepts the sort fields declared for each list, and they map to SQL expressions on the server. Client text never reaches the `ORDER BY`.
- The table header must not change height when it turns into the action bar. Its height feeds `useTablePageSize`, and a change would alter the page size and refetch the list.
- The action bar must work at every width where the table hides columns.
- Selection stays in Leads, with no shared selection component until a second table needs it.

---

## Backend Requirements

### Database

No schema changes or migrations.

### API

**`GET /leads` and `GET /customers`:** new optional query params.

- `sort`: leads accept `next_action`, `prospected_at`, `last_contact`, `business_name`, `niche`, `city`. Customers accept `closed_at`, `closed_value`, `received`, `monthly_fee`, `business_name`, `niche`, `city`.
- `direction`: `asc` or `desc`, required when `sort` is sent.
- Without them, each list keeps its current order.
- An unknown field, or `direction` without `sort`, is a `400`, like a broken filter expression.

**`GET /leads/ids`:** new endpoint, declared before `/leads/:id`.

- Takes `q` and `filters`, with the same meaning as `GET /leads`, including the rule for which archived leads are visible.
- Returns `{ ids: string[] }`.

### Core

- Each list repository declares its sort expressions next to its filter columns, in the shape of `FilterColumns`, reusing `receivedSql` for the received value.
- Sharing `searchSql` and the `where` of `findLeadsPage` with the ids query must not duplicate them.

---

## Frontend Requirements

- New folder `shared/components/sort/`, following `shared/components/filters/`: a controller hook, the button with its menu, the types and a short README.
- `routes/_app/leads.index.tsx` and `routes/_app/customers.index.tsx`: add `sort` and `direction` to the search schema. Like the other params, they are optional and fall back with `.catch(undefined)`.
- `LeadsPage` and `CustomersPage`:
  - pass the order to `useLeads` and `useCustomers`;
  - include it in the `useListNavigation` reset key;
  - keep it in `clearFilters`.
- `features/leads/constants` and `features/customers/constants`: the sort options of each table.
- `LeadsBulkBar` becomes the header action bar, rendered by `LeadsTable`, keeping `useBulkChangeLeadStage` and `ArchiveLeadDialog`.
- A query for `GET /leads/ids`, called when the link is clicked.

---

## Technical Notes

- No factories: plain exported functions only, with rules in `domain.ts` when there are any.
- Input validated with Zod in `packages/contracts`, on the API and the route.
- A `leadsTable` column in a sort expression inside a subquery uses `qualified()`, as the current list does.
- Text sorting uses the `unaccent` extension already enabled for search and filters.
- Error toasts go through `getErrorMessage` with a Portuguese fallback.
- The table keeps its current loading, empty and placeholder states.
- Testing: no automated tests, as in VET-9. Verify the API over HTTP and the screens in the browser.

---

## Acceptance Criteria

- Both tables have the "Ordenar" button, with the options and starting directions above.
- The default order on both tables is exactly what it is today.
- Each option orders across pages, not only the current page, with empty values last in both directions.
- Names with accents sort next to their unaccented neighbours.
- Paging through a sorted list never repeats or skips a record.
- Sorting works together with search and filters, and goes back to page 1.
- The order survives a reload and opening a record and going back; "Limpar filtros" keeps it; "Restaurar padrão" removes it from the URL.
- `O` opens the menu.
- An unknown `sort` value on the API returns `400`; on the route it falls back to the default order.
- The "Selecionar" button works as it does today, and the floating bar no longer exists.
- With a lead selected, the header shows the action bar, without changing the number of rows per page.
- "Selecionar todos os N" selects every lead matching the search and filters, and the bulk actions and their undo work on all of them.
- The selection survives a page change, and is cleared by a change of search, filters or order.
- `pnpm format`, `pnpm check-types`, `pnpm lint` and `pnpm build` pass, with no console errors.

---

## Project References

The executing agent must read these before starting:

- `docs/guides/API-MODULES.md`, `docs/guides/API-VALIDATION.md`, `docs/guides/SHARED-CONTRACTS.md`
- `docs/guides/WEB-VITE-OVERVIEW.md`, `docs/guides/WEB-VITE-DATA-LAYER.md`, `docs/guides/WEB-COMPONENTS.md`
- `apps/web/src/shared/components/filters/README.md`, the model for the sort control
- `packages/core/src/features/leads/repositories/findLeadsPage.ts`, `packages/core/src/features/customers/repositories/findCustomersPage.ts`

Project-specific decisions that apply to this issue:

- One criterion at a time, and selection only on Leads.
- The API stays bound to `127.0.0.1`, with no authentication.
- UI text is Portuguese, hardcoded.
