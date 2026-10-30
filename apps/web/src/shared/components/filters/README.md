# Filters

Linear-style filter bar: a "Filtrar" button, editable chips (`field · operator · value`) and a
"+" to add more. Nothing in it is specific to leads or customers; a screen only describes its
fields.

## How it works

- A filter is `{ field, operator, values[] }` (`Filter` in `@vetra/contracts`).
- Filters combine with AND; the values of one filter combine with OR.
- One filter per field. Adding more values to a select field merges them into its chip.
- The state lives with the caller (the pages keep it in the URL `filters` search param); the
  component only reads `value` and reports changes through `onChange`.

## Usage

```tsx
const filtering = useFilterController({
  fields: filterFields,
  value: filters,
  onChange: changeFilters,
});

<FilterButton controller={filtering} />   // header, next to the other actions
<ActiveFilters controller={filtering} />  // above the list; renders nothing without filters
```

Fields are a `FilterField[]` (see `types.ts`): `select` (with `options`), `text`, `number`
(optionally `format: "currency"`), `date` and `boolean` (with `labels`). Each needs `id`,
`label` and `icon`. See `features/customers/constants/customerFilterFields.ts` for an example.

The `F` hotkey is registered by `useFilterController`: it opens the button's menu with no
filters, or the "+" menu when there are chips.

## Files

| File                              | Role                                                                 |
| --------------------------------- | -------------------------------------------------------------------- |
| `useFilterController.ts`          | Shared state: open menu, available fields, add/replace/remove/clear  |
| `FilterButton.tsx`                | The "Filtrar" button and its menu                                    |
| `ActiveFilters.tsx`               | Chips row, "+" and "Limpar"                                          |
| `FilterChip.tsx`                  | One chip: operator menu, value popover, remove                       |
| `AddFilterMenu.tsx`               | Field list with the values flyout                                    |
| `OptionList.tsx`, `ValueEditor.tsx` | Searchable keyboard list; text, number and date editors            |
| `operators.ts`, `types.ts`        | Operator labels per field type; field definitions                    |

## Dependencies outside this folder

- `@vetra/contracts`: `Filter`, `FilterOperator`, `FilterValue` types. The same package has
  `filterSchema` and `filtersParamSchema(fields)` (`packages/contracts/src/filters`) to validate
  the filters in the route and the API.
- `shared/components/ui`: `popover`, `button`, `input`, `checkbox` (shadcn).
- `shared/components/DateTimePicker`: used by the date editor.
- `shared/hooks/useHotkey`: the `F` shortcut.
- `shared/utils`: `cn`, `text` (`normalizeText`), `format`, `masks`, `dueDates`.
- `shared/constants/choiceStyles`: style of the selected operator button.

To reuse it in another project, copy this folder together with the items above and replace the
`@vetra/contracts` types.

## Applying filters

The component only builds the `Filter[]`. Filtering is done by whoever owns the data: the
mock layer uses `shared/mocks/filterEngine.ts` (`matchesFilters`), and the future API must apply
the same semantics. Select fields that list their options from the data (niche, city) get them
from a `filter-options` endpoint (`filterOptionsQuerySchema` in the contracts).
