# Sort

An "Ordenar" button with a menu: the options, the direction and "Restaurar padrão". Nothing in it
is specific to leads or customers; a screen only describes its options.

## Usage

```tsx
const sorting = useSortController({
  options: leadSortOptions,
  defaultField: "next_action",
  value: sort,
  onChange: changeSort,
});

<SortButton controller={sorting} />; // header, next to the other actions
```

Options are a `SortOption[]` (see `types.ts`), each with `id`, `label`, `icon` and the
`defaultDirection` it starts in. See `features/customers/constants/customerSortOptions.ts`.

- One criterion at a time.
- The state lives with the caller (the pages keep it in the URL `sort` and `direction` search
  params); the component only reads `value` and reports changes through `onChange`.
- `onChange` receives `undefined` for the default order, so it stays out of the URL.
- The `O` hotkey is registered by `useSortController`.

## Applying the order

The component only reports the choice, and the order must come from whoever owns the data: sorting
only the current page would be wrong. Here, the API turns it into SQL with `sortToSql`
(`packages/core/src/shared/sort`), and the contracts declare the fields each list accepts
(`sortParamsShape` in `packages/contracts/src/sort`).
