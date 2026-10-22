# Web Data Layer

TanStack Query conventions, the axios client, and cache management for `apps/web`.
Load this guide when adding a query/mutation or touching cache state.

## The axios client

`shared/lib/axios/api.ts` default-exports a single configured `axios` instance
(`baseURL` from `envConfig.get()`). Every HTTP call goes through it — never a bare
`axios.get(...)`/`fetch(...)` call anywhere else in the app. There is no
authentication, so there are no credentials, cookies, or session-refresh
interceptors.

## Query convention: `queryOptions()`

One `queryOptions({ queryKey, queryFn, ... })` per resource, exported so it can be
reused both by a component-facing `useX()` hook and by an imperative call elsewhere
(e.g. a route's `loader`). Never inline a `queryKey`/`queryFn` pair directly inside a
component. Illustrative shape (no real feature exists yet):

```ts
export const leadsQueryOptions = queryOptions({ queryKey: ["leads"], queryFn: ... });
export function useLeads() {
  return useQuery(leadsQueryOptions);
}
```

An imperative one-off fetch outside a component (e.g. in a route's `loader`) uses
`queryClient.query({ ...xQueryOptions, staleTime: "static" })`. `ensureQueryData` is
deprecated as of the pinned TanStack Query version — confirm against the installed
`.d.ts` before relying on either name, this is a fast-moving API.

## Mutation convention

One `useX()` hook per mutation, under `features/<name>/mutations/`, wrapping
`useMutation`. A mutation that needs to update another query's cached data does so
through `useQueryUtils` (below) inside its `onSuccess`, not by importing
`useQueryClient` directly in the mutation hook.

## Shared queries and mutations

A query or mutation lives in its feature (`features/<name>/queries`, `mutations`). When two or
more features need the same data, it moves to `shared/queries/<domain>/` (query hooks and their
`keys.ts`) or `shared/mutations/<domain>/` (mutation hooks and cache-invalidation helpers),
never to `shared/hooks/`, which is only for generic UI hooks (`useHotkey`, `useDebouncedCallback`...).

Today: `shared/queries/leads` (`useLead`, keys) and `shared/mutations/leads`
(`useInvalidateAfterLeadChange`) are used by both `features/leads` and `features/customers`, since
a customer is a won lead. `shared/queries/next-actions` and `shared/mutations/next-actions` serve
the dashboard and the lead screen, through the shared `next-actions` components.

Don't move something there "just in case": start in the feature and promote it when a second
feature needs it.

## `useQueryUtils`

`shared/lib/tanstack/useQueryUtils.ts` is a thin, typed wrapper over
`getQueryData`/`setQueryData`/`invalidateQueries`/`refetchQueries`/`removeQueries` for
one query key. Prefer it over calling `useQueryClient()` methods directly when the
intent is one of these five operations on a specific, known query key.

**`setData(undefined)` is a documented TanStack Query v5 no-op** — it skips updates
that resolve to `undefined`. To actually clear cached data, call `remove()`, not
`setData(undefined)`.

## Turning errors into user-facing text

`shared/utils/getErrorMessage.ts` turns an API error into text for the user: a `400`
with `issues[]` is formatted from the issues, otherwise the response's `message` is
used, otherwise the caller's Portuguese fallback (default `"Algo deu errado."`).

The backend only sends stable codes (Zod `issue.code`, error class names) in English —
mapping those codes to Portuguese sentences (both for server-reported issues and for
client-side form validation) is still to be built, together with the first real form.
Until then, never render a raw error object or a raw Zod code as the final UI text
without going through `getErrorMessage`.

## Query client defaults

`shared/lib/tanstack/queryClient.ts` sets `refetchOnWindowFocus: false`,
`refetchOnReconnect: false`, and a 5-minute `staleTime` as global defaults. A query
that overrides one of these needs a specific reason for that resource, not a
copy-pasted override.
